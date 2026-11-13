#!/usr/bin/env node
/**
 * Generates the dashboard dataset as CSV files for `sf data upsert bulk`.
 *
 * Usage: node scripts/data/generate-data.js [--seed 7] [--projects 4] [--resources 20] ...
 *
 * Every top-level value of config.js can be overridden with a `--name value` argument. The output is deterministic
 * for a given config: the same input always produces the same records.
 */
const fs = require('fs');
const path = require('path');
const baseConfig = require('./config');

// region Config and random numbers

const config = applyArguments({ ...baseConfig }, process.argv.slice(2));

// Turns a string or number seed into a 32 bit integer (xmur3 hash)
function hashSeed(seed) {
    const str = String(seed);
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
}

// Small, fast, seedable pseudo random generator (mulberry32)
function mulberry32(a) {
    return function() {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const random = mulberry32(hashSeed(config.seed));

const
    int     = (min, max) => min + Math.floor(random() * (max - min + 1)),
    range   = r => int(r.min, r.max),
    float   = (min, max) => min + random() * (max - min),
    chance  = p => random() < p,
    pick    = arr => arr[Math.floor(random() * arr.length)],
    shuffle = arr => {
        const result = arr.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };

function applyArguments(cfg, args) {
    for (let i = 0; i < args.length; i++) {
        const match = /^--([a-zA-Z]+)$/.exec(args[i]);
        if (!match) {
            throw new Error(`Unexpected argument ${args[i]}`);
        }
        const key = match[1], value = args[++i];
        if (!(key in cfg)) {
            throw new Error(`Unknown config key ${key}`);
        }
        if (typeof cfg[key] === 'number') {
            cfg[key] = Number(value);
        }
        else if (typeof cfg[key] === 'object') {
            // Objects and arrays are given as JSON, for example --tasksPerProject '{"min":10,"max":20}'
            cfg[key] = JSON.parse(value);
        }
        else {
            cfg[key] = value;
        }
    }
    return cfg;
}

// Probability of adding one more assignment so that the mean of min..max lands on `average`
function extraProbability({ min, max, average }) {
    const steps = max - min;
    if (steps <= 0 || average <= min) {
        return 0;
    }
    const mean = p => {
        let total = 0, prob = 1;
        for (let i = 0; i < steps; i++) {
            prob *= p;
            total += prob;
        }
        return min + total;
    };
    let lo = 0, hi = 1;
    for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (mean(mid) < average) {
            lo = mid;
        }
        else {
            hi = mid;
        }
    }
    return (lo + hi) / 2;
}

// endregion

// region Dates (UTC, day granularity, Monday to Friday are working days)

const DAY = 24 * 60 * 60 * 1000;

const parseDate = str => new Date(`${str}T00:00:00Z`);
const addDays = (date, days) => new Date(date.getTime() + days * DAY);
const isWorkingDay = date => date.getUTCDay() !== 0 && date.getUTCDay() !== 6;

function nextWorkingDay(date) {
    while (!isWorkingDay(date)) {
        date = addDays(date, 1);
    }
    return date;
}

// End date is exclusive: a 1 day task starting on Monday ends on Tuesday 00:00
function addWorkingDays(date, days) {
    const step = days < 0 ? -1 : 1;
    days = Math.abs(days);
    date = nextWorkingDay(date);
    while (days > 0) {
        date = addDays(date, step);
        if (isWorkingDay(date)) {
            days--;
        }
    }
    return date;
}

function workingDaysBetween(start, end) {
    let days = 0;
    for (let d = start; d < end; d = addDays(d, 1)) {
        if (isWorkingDay(d)) {
            days++;
        }
    }
    return days;
}

const formatDate = date => date.toISOString().slice(0, 10);
const formatDateTime = date => date.toISOString();

const today = config.today ? parseDate(config.today) : parseDate(new Date().toISOString().slice(0, 10));

// endregion

// region Vocabulary

const projectTypes = [
    {
        type       : 'Software',
        department : 'Engineering',
        names      : ['Customer Portal', 'Mobile Banking App', 'Inventory Platform', 'Analytics Suite', 'Booking Engine', 'Partner API'],
        phases     : [
            { name : 'Discovery', tasks : ['Stakeholder interviews', 'Requirements workshop', 'Competitor analysis', 'Technical feasibility study', 'Define success metrics'] },
            { name : 'Design', tasks : ['Information architecture', 'Wireframes', 'Visual design', 'Design review', 'Prototype usability test', 'Data model design', 'API specification'] },
            { name : 'Development', tasks : ['Set up CI pipeline', 'Authentication service', 'Core domain model', 'REST API', 'Web client', 'Mobile client', 'Reporting module', 'Notifications', 'Search and filtering', 'Admin console', 'Integration layer'] },
            { name : 'Testing', tasks : ['Test plan', 'Automated regression suite', 'Performance testing', 'Security audit', 'User acceptance testing', 'Bug fixing sprint'] },
            { name : 'Deployment', tasks : ['Production environment', 'Data migration', 'Release candidate', 'Go live', 'Hypercare support', 'Project retrospective'] }
        ]
    },
    {
        type       : 'Construction',
        department : 'Construction',
        names      : ['Riverside Office Tower', 'Harbor Logistics Center', 'Hillside Residential Complex', 'Central Station Renovation', 'Greenfield Warehouse'],
        phases     : [
            { name : 'Site Preparation', tasks : ['Site survey', 'Soil investigation', 'Building permits', 'Demolition', 'Site fencing and access', 'Utility relocation'] },
            { name : 'Foundation', tasks : ['Excavation', 'Piling', 'Formwork', 'Reinforcement', 'Concrete pour', 'Waterproofing', 'Curing and inspection'] },
            { name : 'Structure', tasks : ['Steel frame erection', 'Floor slabs', 'Exterior walls', 'Roof structure', 'Stairs and elevator shafts', 'Facade installation', 'Windows and glazing'] },
            { name : 'Interior', tasks : ['Electrical installation', 'Plumbing', 'HVAC installation', 'Drywall and partitions', 'Flooring', 'Painting', 'Fixtures and fittings', 'Fire safety systems'] },
            { name : 'Handover', tasks : ['Final inspection', 'Snag list', 'Landscaping', 'Commissioning', 'Client walkthrough', 'Handover documentation'] }
        ]
    },
    {
        type       : 'Marketing',
        department : 'Marketing',
        names      : ['Spring Product Launch', 'Brand Refresh Campaign', 'Trade Show Program', 'Customer Loyalty Campaign', 'Holiday Season Campaign'],
        phases     : [
            { name : 'Research', tasks : ['Market research', 'Audience segmentation', 'Channel analysis', 'Campaign brief', 'Budget approval'] },
            { name : 'Creative', tasks : ['Messaging framework', 'Concept development', 'Copywriting', 'Visual identity', 'Video storyboard', 'Landing page design'] },
            { name : 'Production', tasks : ['Video shoot', 'Video editing', 'Print production', 'Landing page build', 'Email templates', 'Social media assets', 'Ad creatives'] },
            { name : 'Launch', tasks : ['Media booking', 'Press release', 'Influencer outreach', 'Campaign go live', 'Social media rollout', 'Event activation'] },
            { name : 'Measurement', tasks : ['Performance dashboard', 'A/B test analysis', 'Mid-campaign optimization', 'Final report', 'Lessons learned'] }
        ]
    },
    {
        type       : 'Infrastructure',
        department : 'IT',
        names      : ['Data Center Migration', 'Network Upgrade', 'Cloud Adoption Program', 'Identity Platform Rollout', 'Disaster Recovery Site'],
        phases     : [
            { name : 'Assessment', tasks : ['Current state inventory', 'Capacity analysis', 'Risk assessment', 'Vendor evaluation', 'Architecture proposal'] },
            { name : 'Procurement', tasks : ['Request for proposal', 'Vendor negotiation', 'Hardware order', 'License agreements', 'Delivery and inspection'] },
            { name : 'Installation', tasks : ['Rack and cabling', 'Network configuration', 'Storage setup', 'Server provisioning', 'Monitoring setup', 'Backup configuration', 'Security hardening'] },
            { name : 'Migration', tasks : ['Migration plan', 'Pilot migration', 'Application migration wave 1', 'Application migration wave 2', 'Database migration', 'Cutover rehearsal', 'Production cutover'] },
            { name : 'Validation', tasks : ['Performance validation', 'Failover test', 'Documentation', 'Operations training', 'Decommission old systems'] }
        ]
    }
];

const subtaskNames = ['Preparation', 'Execution', 'Review', 'Sign-off'];

// Roles per department with a base hourly rate
const roles = {
    Engineering  : [['Project Manager', 95], ['Software Architect', 120], ['Developer', 85], ['Developer', 85], ['QA Engineer', 70], ['UX Designer', 80], ['DevOps Engineer', 95], ['Business Analyst', 75]],
    Construction : [['Project Manager', 95], ['Site Supervisor', 80], ['Civil Engineer', 90], ['Electrician', 65], ['Plumber', 60], ['Carpenter', 55], ['Crane Operator', 70], ['Safety Inspector', 75]],
    Marketing    : [['Project Manager', 95], ['Marketing Specialist', 70], ['Copywriter', 60], ['Graphic Designer', 65], ['Video Producer', 85], ['Media Planner', 75], ['Web Developer', 80], ['Data Analyst', 75]],
    IT           : [['Project Manager', 95], ['Network Engineer', 90], ['System Administrator', 80], ['Security Engineer', 105], ['Database Administrator', 95], ['Cloud Engineer', 100], ['Support Technician', 55], ['Business Analyst', 75]]
};

const firstNames = ['Alice', 'Ben', 'Carla', 'David', 'Elena', 'Felix', 'Greta', 'Hugo', 'Ines', 'Jonas', 'Kara', 'Liam', 'Maya', 'Noah', 'Olivia', 'Pavel', 'Quinn', 'Rosa', 'Samuel', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zane', 'Amir', 'Bianca', 'Cyrus', 'Dana'];
const lastNames = ['Andersson', 'Brown', 'Costa', 'Dubois', 'Eriksson', 'Fischer', 'Garcia', 'Hansen', 'Ivanov', 'Johansson', 'Kowalski', 'Lindqvist', 'Martin', 'Nguyen', 'Olsen', 'Petrov', 'Quist', 'Rossi', 'Schmidt', 'Tanaka', 'Ustinov', 'Vargas', 'Weber', 'Young', 'Zimmerman'];
const cities = ['Stockholm', 'Barcelona', 'London', 'Berlin', 'New York', 'Austin', 'Toronto', 'Sydney'];

const accountNames = ['Nordic Retail Group', 'Atlas Logistics', 'BlueRiver Bank', 'Helios Energy', 'Mariner Hotels', 'Quantum Health', 'Summit Education', 'Terra Foods', 'Urban Mobility Co', 'Vertex Media'];
const industries = ['Retail', 'Transportation', 'Banking', 'Energy', 'Hospitality', 'Healthcare', 'Education', 'Food & Beverage', 'Transportation', 'Media'];

// endregion

// region Generation

const pad = (n, width = 3) => String(n).padStart(width, '0');

function generateCalendars() {
    const calendars = [
        { ExternalId__c : 'cal-general', Name : 'General', UnspecifiedTimeIsWorking__c : true },
        { ExternalId__c : 'cal-business', Name : 'Business Hours', UnspecifiedTimeIsWorking__c : true },
        { ExternalId__c : 'cal-six-day', Name : 'Six Day Week', UnspecifiedTimeIsWorking__c : true }
    ];
    // Parent calendars are linked in a second pass, after all calendars exist
    const calendarParents = [{ ExternalId__c : 'cal-business', 'Parent__r.ExternalId__c' : 'cal-general' }];
    const intervals = [
        { ExternalId__c : 'int-weekend', Label__c : '', 'Calendar__r.ExternalId__c' : 'cal-general', RecurrentStartDate__c : 'on Sat', RecurrentEndDate__c : 'on Mon', StartDate__c : '', EndDate__c : '', IsWorking__c : false },
        { ExternalId__c : 'int-lunch', Label__c : '', 'Calendar__r.ExternalId__c' : 'cal-business', RecurrentStartDate__c : 'every weekday at 12:00', RecurrentEndDate__c : 'every weekday at 13:00', StartDate__c : '', EndDate__c : '', IsWorking__c : false },
        { ExternalId__c : 'int-evening', Label__c : '', 'Calendar__r.ExternalId__c' : 'cal-business', RecurrentStartDate__c : 'every weekday at 17:00', RecurrentEndDate__c : 'every weekday at 08:00', StartDate__c : '', EndDate__c : '', IsWorking__c : false },
        { ExternalId__c : 'int-sunday', Label__c : '', 'Calendar__r.ExternalId__c' : 'cal-six-day', RecurrentStartDate__c : 'on Sun', RecurrentEndDate__c : 'on Mon', StartDate__c : '', EndDate__c : '', IsWorking__c : false }
    ];
    const year = today.getUTCFullYear();
    [['Christmas', `${year}-12-24`, `${year}-12-27`], ['New Year', `${year + 1}-01-01`, `${year + 1}-01-02`], ['Midsummer', `${year}-06-19`, `${year}-06-20`]].forEach(([name, start, end], i) => {
        intervals.push({ ExternalId__c : `int-holiday-${i + 1}`, Label__c : name, 'Calendar__r.ExternalId__c' : 'cal-general', RecurrentStartDate__c : '', RecurrentEndDate__c : '', StartDate__c : formatDateTime(parseDate(start)), EndDate__c : formatDateTime(parseDate(end)), IsWorking__c : false });
    });
    return { calendars, calendarParents, intervals };
}

const projectTypeRows = projectTypes.map(projectType => ({
    ExternalId__c   : `ptype-${projectType.type.toLowerCase()}`,
    Name            : projectType.type,
    Description__c  : `${projectType.type} projects, staffed from the ${projectType.department} department`
}));

function generateAccounts() {
    const accounts = [];
    for (let i = 0; i < config.accounts; i++) {
        const round = Math.floor(i / accountNames.length);
        accounts.push({
            Bryntum_External_Id__c : `acc-${pad(i + 1)}`,
            Name                   : accountNames[i % accountNames.length] + (round ? ` ${round + 1}` : ''),
            Industry               : industries[i % industries.length],
            BillingCity            : pick(cities)
        });
    }
    return accounts;
}

function generateResources() {
    const resources = [], usedNames = new Set(), departments = Object.keys(roles);
    for (let i = 0; i < config.resources; i++) {
        const department = departments[i % departments.length], [role, rate] = pick(roles[department]);
        let name;
        do {
            name = `${pick(firstNames)} ${pick(lastNames)}`;
        } while (usedNames.has(name));
        usedNames.add(name);
        resources.push({
            ExternalId__c               : `res-${pad(i + 1)}`,
            Name                        : name,
            Role__c                     : role,
            Department__c               : department,
            City__c                     : pick(cities),
            Email__c                    : `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
            HourlyRate__c               : rate + int(-10, 15),
            MaxUnits__c                 : chance(config.partTimeShare) ? 50 : 100,
            'Calendar__r.ExternalId__c' : chance(0.2) ? 'cal-six-day' : 'cal-general'
        });
    }
    return resources;
}

function generateProjects(resources, accounts) {
    const projects = [], tasks = [], assignments = [], dependencies = [];
    const extraAssignmentProbability = extraProbability(config.assignmentsPerTask);
    const portfolioStart = addDays(today, -config.monthsBeforeToday * 30), portfolioDays = (config.monthsBeforeToday + config.monthsAfterToday) * 30;
    const usedProjectNames = new Set();

    for (let p = 0; p < config.projects; p++) {
        const
            projectType  = projectTypes[p % projectTypes.length],
            projectId    = `prj-${pad(p + 1)}`,
            account      = accounts[p % accounts.length],
            team         = shuffle(resources.filter(r => r.Department__c === projectType.department)).slice(0, range(config.teamSize)),
            manager      = team.find(r => r.Role__c === 'Project Manager') || pick(resources.filter(r => r.Role__c === 'Project Manager')),
            start        = nextWorkingDay(addDays(portfolioStart, int(0, portfolioDays))),
            targetCount  = range(config.tasksPerProject),
            projectTasks = [];

        // Teams get a couple of members from other departments too, so the resources are shared across projects
        team.push(...shuffle(resources.filter(r => !team.includes(r))).slice(0, 2));
        if (!team.includes(manager)) {
            team.push(manager);
        }

        let name = pick(projectType.names), attempts = 0;
        while (usedProjectNames.has(name) && attempts++ < projectType.names.length) {
            name = pick(projectType.names);
        }
        if (usedProjectNames.has(name)) {
            name += ` ${p + 1}`;
        }
        usedProjectNames.add(name);

        let taskCounter = 0, dependencyCounter = 0;
        const newTask = (taskName, parent, extra = {}) => {
            const task = {
                ExternalId__c : `tsk-${pad(p + 1)}-${pad(++taskCounter, 4)}`,
                Name          : taskName,
                project       : projectId,
                parent,
                children      : [],
                OrderIndex__c : parent ? parent.children.length : projectTasks.filter(t => !t.parent).length,
                predecessors  : [],
                leaf          : true,
                ...extra
            };
            if (parent) {
                parent.children.push(task);
                parent.leaf = false;
            }
            projectTasks.push(task);
            return task;
        };
        const addDependency = (from, to) => {
            const type = chance(config.nonFinishToStartShare) ? pick(['SS', 'FF']) : 'FS';
            const dependency = {
                ExternalId__c               : `dep-${pad(p + 1)}-${pad(++dependencyCounter, 4)}`,
                'FromTask__r.ExternalId__c' : from.ExternalId__c,
                'ToTask__r.ExternalId__c'   : to.ExternalId__c,
                Type__c                     : type,
                Lag__c                      : chance(config.lagProbability) ? int(1, 3) : 0,
                LagUnit__c                  : 'day',
                Active__c                   : true,
                from,
                to
            };
            to.predecessors.push(dependency);
            dependencies.push(dependency);
        };

        // Phases with their tasks, phases follow each other
        const phases = projectType.phases.map(phase => newTask(phase.name, null, { ShowInTimeline__c : true, pool : shuffle(phase.tasks), used : 0 }));
        let previousPhaseLast = null;
        for (const phase of phases) {
            // Fill the phases with 60% of the target, the rest is added below in random phases
            const count = Math.max(2, Math.floor(targetCount / phases.length * 0.6));
            let previous = null;
            for (let i = 0; i < count; i++) {
                const task = newTask(nextTaskName(phase), phase);
                if (previous && chance(config.sequentialDependencyProbability)) {
                    addDependency(previous, task);
                }
                else if (!previous && previousPhaseLast) {
                    addDependency(previousPhaseLast, task);
                }
                previous = task;
            }
            previousPhaseLast = previous;
        }

        // Add tasks until the target is reached, some of them as subtasks
        while (projectTasks.length < targetCount) {
            const phase = pick(phases), siblings = phase.children;
            const parentCandidate = chance(config.subtaskProbability) ? pick(siblings.filter(t => t.leaf)) : null;
            if (parentCandidate) {
                const count = Math.min(range(config.subtasksPerTask), targetCount - projectTasks.length);
                let previous = null;
                for (let i = 0; i < count; i++) {
                    const subtask = newTask(`${parentCandidate.Name}: ${subtaskNames[i % subtaskNames.length]}`, parentCandidate);
                    if (previous) {
                        addDependency(previous, subtask);
                    }
                    previous = subtask;
                }
                // The task is a parent now, move its dependencies to the first and the last subtask
                if (count > 0) {
                    const first = parentCandidate.children[0], last = parentCandidate.children[count - 1];
                    dependencies.forEach(dependency => {
                        if (dependency.to === parentCandidate) {
                            dependency.to = first;
                            dependency['ToTask__r.ExternalId__c'] = first.ExternalId__c;
                            first.predecessors.push(dependency);
                        }
                        if (dependency.from === parentCandidate) {
                            dependency.from = last;
                            dependency['FromTask__r.ExternalId__c'] = last.ExternalId__c;
                        }
                    });
                    parentCandidate.predecessors = [];
                }
            }
            else {
                const task = newTask(nextTaskName(phase), phase);
                const previous = siblings[siblings.length - 2];
                if (previous && chance(config.sequentialDependencyProbability)) {
                    // The previous task may have subtasks by now, depend on its last leaf
                    addDependency(lastLeaf(previous), task);
                }
            }
        }

        // Cross phase dependencies
        const leaves = projectTasks.filter(t => t.leaf);
        for (let i = range(config.crossPhaseDependencies); i > 0; i--) {
            const from = pick(leaves), to = pick(leaves);
            if (from !== to && phaseOf(from) !== phaseOf(to) && !createsCycle(from, to)) {
                addDependency(from, to);
            }
        }

        // Schedule: leaves get a duration, predecessors push the start date, parents span their children
        leaves.forEach(task => {
            task.duration = range(config.taskDuration);
        });
        scheduleTasks(projectTasks, start);

        // Assignments, progress, cost and the remaining fields
        leaves.forEach(task => {
            let count = config.assignmentsPerTask.min;
            while (count < config.assignmentsPerTask.max && chance(extraAssignmentProbability)) {
                count++;
            }
            const members = shuffle(team).slice(0, count);
            task.effort = 0;
            task.cost = 0;
            members.forEach((resource, i) => {
                const units = pick(config.assignmentUnits);
                const effort = task.duration * 8 * units / 100;
                task.effort += effort;
                task.cost += effort * resource.HourlyRate__c;
                assignments.push({
                    ExternalId__c               : `${task.ExternalId__c}-a${i + 1}`,
                    'Task__r.ExternalId__c'     : task.ExternalId__c,
                    'Resource__r.ExternalId__c' : resource.ExternalId__c,
                    Units__c                    : units
                });
            });

            if (task.endDate <= today) {
                if (chance(config.lateTaskShare)) {
                    task.percentDone = int(40, 90);
                    task.status = 'Late';
                }
                else {
                    task.percentDone = 100;
                    task.status = 'Completed';
                }
            }
            else if (task.startDate >= today) {
                task.percentDone = 0;
                task.status = 'Not Started';
            }
            else {
                const expected = workingDaysBetween(task.startDate, today) / task.duration * 100;
                task.percentDone = Math.max(5, Math.min(95, Math.round(expected + int(-20, 10))));
                task.status = 'In Progress';
            }

            task.priority = pick(['Low', 'Medium', 'Medium', 'High', 'High', 'Critical']);
            task.complexity = pick(['Easy', 'Normal', 'Normal', 'Hard']);
            task.rollup = chance(config.rollupProbability);
            if (chance(config.deadlineProbability)) {
                task.deadline = addDays(task.endDate, int(-2, 5));
            }
            if (chance(config.constraintProbability)) {
                task.constraintType = 'startnoearlierthan';
                task.constraintDate = task.startDate;
            }
            if (chance(0.1)) {
                task.note = pick(['Waiting for client feedback', 'Scope confirmed with stakeholders', 'Needs an extra review before sign-off', 'Vendor delivery may slip']);
            }
        });
        rollUpParents(phases);

        const plannedCost = phases.reduce((sum, t) => sum + t.cost, 0);
        const projectEnd = phases.reduce((max, t) => t.endDate > max ? t.endDate : max, start);
        const done = leaves.every(t => t.status === 'Completed');
        projects.push({
            ExternalId__c                       : projectId,
            Name                                : name,
            'ProjectType__r.ExternalId__c'      : `ptype-${projectType.type.toLowerCase()}`,
            // Values of the restricted Status__c picklist
            Status__c                           : start > today ? 'Planned' : done ? 'Completed' : p === config.projects - 1 && config.projects > 3 ? 'On Hold' : 'Active',
            'Manager__r.ExternalId__c'          : manager.ExternalId__c,
            'Account__r.Bryntum_External_Id__c' : account.Bryntum_External_Id__c,
            StartDate__c                        : formatDate(start),
            EndDate__c                          : formatDate(projectEnd),
            Budget__c                           : Math.round(plannedCost * float(config.budgetFactor.min, config.budgetFactor.max) / 100) * 100,
            'Calendar__r.ExternalId__c'         : 'cal-general',
            HoursPerDay__c                      : 24,
            DaysPerWeek__c                      : 5,
            DaysPerMonth__c                     : 20,
            Description__c                      : `${projectType.type} project for ${account.Name}`
        });
        tasks.push(...projectTasks);
    }
    return { projects, tasks, assignments, dependencies };
}

function nextTaskName(phase) {
    const base = phase.pool[phase.used % phase.pool.length], round = Math.floor(phase.used / phase.pool.length);
    phase.used++;
    return round ? `${base} ${round + 1}` : base;
}

const phaseOf = task => task.parent ? phaseOf(task.parent) : task;
const lastLeaf = task => task.leaf ? task : lastLeaf(task.children[task.children.length - 1]);

// A dependency from -> to creates a cycle if `from` depends on `to`, directly or through other tasks
function createsCycle(from, to) {
    const visited = new Set();
    const dependsOn = (task, target) => {
        if (task === target) {
            return true;
        }
        if (visited.has(task)) {
            return false;
        }
        visited.add(task);
        return task.predecessors.some(dep => dependsOn(dep.from, target));
    };
    return dependsOn(from, to);
}

function scheduleTasks(tasks, projectStart) {
    const leaves = tasks.filter(t => t.leaf), scheduled = new Set();
    // Leaves are scheduled once all their predecessors are scheduled
    while (scheduled.size < leaves.length) {
        let progress = false;
        for (const task of leaves) {
            if (scheduled.has(task) || !task.predecessors.every(dep => scheduled.has(dep.from))) {
                continue;
            }
            let start = projectStart;
            for (const dep of task.predecessors) {
                let earliest;
                switch (dep.Type__c) {
                    case 'SS':
                        earliest = dep.from.startDate;
                        break;
                    case 'FF':
                        earliest = addWorkingDays(dep.from.endDate, -task.duration);
                        break;
                    default:
                        earliest = dep.from.endDate;
                }
                earliest = addWorkingDays(earliest, dep.Lag__c);
                if (earliest > start) {
                    start = earliest;
                }
            }
            task.startDate = nextWorkingDay(start);
            task.endDate = addWorkingDays(task.startDate, task.duration);
            scheduled.add(task);
            progress = true;
        }
        if (!progress) {
            const stuck = leaves.filter(t => !scheduled.has(t)).slice(0, 3).map(t => `${t.ExternalId__c} waits for ${t.predecessors.filter(d => !scheduled.has(d.from)).map(d => d.from.ExternalId__c + (d.from.leaf ? '' : ' (parent)')).join(', ')}`);
            throw new Error(`Dependency cycle detected: ${stuck.join('; ')}`);
        }
    }
    // Parents span their children
    const span = task => {
        if (task.children.length) {
            task.children.forEach(span);
            task.startDate = task.children.reduce((min, t) => t.startDate < min ? t.startDate : min, task.children[0].startDate);
            task.endDate = task.children.reduce((max, t) => t.endDate > max ? t.endDate : max, task.children[0].endDate);
            task.duration = workingDaysBetween(task.startDate, task.endDate);
        }
    };
    tasks.filter(t => !t.parent).forEach(span);
}

function rollUpParents(parents) {
    parents.forEach(task => {
        if (task.children.length) {
            rollUpParents(task.children);
            task.effort = task.children.reduce((sum, t) => sum + t.effort, 0);
            task.cost = task.children.reduce((sum, t) => sum + t.cost, 0);
            const totalDuration = task.children.reduce((sum, t) => sum + t.duration, 0);
            task.percentDone = totalDuration ? Math.round(task.children.reduce((sum, t) => sum + t.percentDone * t.duration, 0) / totalDuration) : 0;
            task.status = task.children.every(t => t.status === 'Completed') ? 'Completed'
                : task.children.every(t => t.status === 'Not Started') ? 'Not Started'
                    : task.children.some(t => t.status === 'Late') ? 'Late' : 'In Progress';
        }
    });
}

// endregion

// region Output

function taskRow(task) {
    return {
        ExternalId__c              : task.ExternalId__c,
        Name                       : task.Name,
        'Project__r.ExternalId__c' : task.project,
        OrderIndex__c              : task.OrderIndex__c,
        StartDate__c               : formatDateTime(task.startDate),
        EndDate__c                 : formatDateTime(task.endDate),
        Duration__c                : task.duration,
        DurationUnit__c            : 'day',
        Effort__c                  : Math.round(task.effort * 100) / 100,
        PercentDone__c             : task.percentDone,
        Priority__c                : task.priority || '',
        Complexity__c              : task.complexity || '',
        Status__c                  : task.status,
        Cost__c                    : Math.round(task.cost * 100) / 100,
        ConstraintType__c          : task.constraintType || '',
        ConstraintDate__c          : task.constraintDate ? formatDateTime(task.constraintDate) : '',
        Deadline__c                : task.deadline ? formatDateTime(task.deadline) : '',
        ManuallyScheduled__c       : false,
        Rollup__c                  : Boolean(task.rollup),
        ShowInTimeline__c          : Boolean(task.ShowInTimeline__c),
        Note__c                    : task.note || ''
    };
}

function csvValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    const str = String(value);
    return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function writeCsv(file, rows) {
    const columns = Object.keys(rows[0]);
    const lines = [columns.join(','), ...rows.map(row => columns.map(column => csvValue(row[column])).join(','))];
    fs.writeFileSync(file, lines.join('\n') + '\n');
}

function main() {
    const outputDir = path.resolve(__dirname, '../..', config.outputDir);
    fs.mkdirSync(outputDir, { recursive : true });

    const { calendars, calendarParents, intervals } = generateCalendars();
    const accounts = generateAccounts();
    const resources = generateResources();
    const { projects, tasks, assignments, dependencies } = generateProjects(resources, accounts);

    const files = {
        'accounts.csv'           : accounts,
        'calendars.csv'          : calendars,
        'calendar-parents.csv'   : calendarParents,
        'calendar-intervals.csv' : intervals,
        'resources.csv'          : resources,
        'project-types.csv'      : projectTypeRows,
        'projects.csv'           : projects,
        'tasks.csv'              : tasks.map(taskRow),
        // Parents are linked in a second pass, so that the parent records exist when the link is set
        'task-parents.csv'       : tasks.filter(t => t.parent).map(t => ({ ExternalId__c : t.ExternalId__c, 'Parent__r.ExternalId__c' : t.parent.ExternalId__c })),
        'assignments.csv'        : assignments,
        'dependencies.csv'       : dependencies.map(({ from, to, ...row }) => row)
    };
    for (const [file, rows] of Object.entries(files)) {
        writeCsv(path.join(outputDir, file), rows);
    }

    console.log(`Generated dataset with seed "${config.seed}" in ${path.relative(process.cwd(), outputDir)}`);
    console.table({
        accounts     : accounts.length,
        calendars    : calendars.length,
        intervals    : intervals.length,
        resources    : resources.length,
        projectTypes : projectTypeRows.length,
        projects     : projects.length,
        tasks        : tasks.length,
        leafTasks    : tasks.filter(t => t.leaf).length,
        assignments  : assignments.length,
        dependencies : dependencies.length
    });
}

main();

// endregion
