/* globals bryntum : true */
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import getLicenseKey from '@salesforce/apex/BryntumLicense.getKey';
import GANTT from '@salesforce/resourceUrl/bryntum_gantt';
import getPortfolioData from '@salesforce/apex/BryntumDashboardController.getPortfolioData';
import saveChanges from '@salesforce/apex/BryntumDashboardController.saveChanges';

/**
 * The portfolio shared by the Bryntum dashboard components on the Bryntum Dashboard page. The page shows one
 * component per tab (projects grid, Gantt timeline, resource histogram), this module creates the Bryntum project
 * model once and hands the same instance to every component, so an edit in one tab is visible in the others and
 * every change is saved to Salesforce once.
 */

// The values of the restricted Status__c picklists of the project and task objects
export const PROJECT_STATUSES = ['Planned', 'Active', 'On Hold', 'Completed'];
export const TASK_STATUSES = [
    'Not Started',
    'In Progress',
    'Late',
    'Completed'
];
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const DEPARTMENTS = [
    'Engineering',
    'Construction',
    'Marketing',
    'IT',
    'Operations'
];

export const currencyFormat = {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
};

export const errorMessage = (error) =>
    error?.body?.message || error?.message || String(error);

// The child nodes regardless of the project filter that a selected project puts on the task store
export const childrenOf = (node) =>
    node.unfilteredChildren || node.children || [];

// The leaf tasks below a node, project nodes and phases are containers
export const leavesOf = (node) => {
    const children = childrenOf(node);
    return children.length ? children.flatMap(leavesOf) : [node];
};

const STYLES = [
    '/gantt.css',
    '/svalbard.css',
    '/fontawesome/css/fontawesome.css',
    '/fontawesome/css/solid.css'
];

// Edits are collected for this long before they are sent to Salesforce as one changeset
const SAVE_DELAY = 500;

let portfolioPromise = null;

/**
 * Loads the Bryntum styles into the template of a component, every component needs its own copy
 */
export function loadStyles(component) {
    return Promise.all(
        STYLES.map((style) => loadStyle(component, GANTT + style))
    );
}

function buildTaskTree(rows) {
    const byId = new Map(rows.map((row) => [row.id, { ...row, children: [] }]));
    const roots = [];
    byId.forEach((node) => {
        const parent = node.parentId ? byId.get(node.parentId) : null;
        delete node.parentId;
        if (parent) {
            parent.children.push(node);
        } else {
            roots.push(node);
        }
    });
    const finish = (node) => {
        node.children.sort(
            (a, b) => (a.orderedParentIndex || 0) - (b.orderedParentIndex || 0)
        );
        node.children.forEach(finish);
        if (!node.children.length) {
            delete node.children;
        }
    };
    roots.forEach(finish);
    return roots.sort(
        (a, b) => (a.orderedParentIndex || 0) - (b.orderedParentIndex || 0)
    );
}

/**
 * Saves the edits to Salesforce. The project reports an edit in any of its stores with the hasChanges event, the
 * edits are collected for a moment and sent to BryntumDashboardController.saveChanges as one changeset
 * (project.changes, with a $PhantomId on every new record). Apex answers with the rows it saved: the ids of the
 * inserted records, references resolved to those ids and the saved fields. Applying the answer with
 * applyProjectChanges() turns the phantom ids into the real ones and clears the saved fields from the pending
 * changes, so an edit made while the request was running stays pending and goes with the next save. A failed save
 * keeps the changes, they are sent again with the next edit.
 */
class Saver {
    constructor(project, onSaveFail) {
        this.project = project;
        this.onSaveFail = onSaveFail;
        this.timer = null;
        this.saving = false;
        this.changedWhileSaving = false;
        project.on({ hasChanges: () => this.schedule() });
    }

    schedule() {
        clearTimeout(this.timer);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.timer = setTimeout(() => this.save(), SAVE_DELAY);
    }

    async save() {
        const { project } = this;
        if (this.saving) {
            this.changedWhileSaving = true;
            return;
        }
        const changes = project.changes;
        if (!changes) {
            return;
        }
        this.saving = true;
        this.changedWhileSaving = false;
        try {
            const response = await saveChanges({
                changes: JSON.stringify(changes)
            });
            await project.applyProjectChanges(JSON.parse(response));
        } catch (error) {
            this.onSaveFail(errorMessage(error));
            this.changedWhileSaving = false;
        } finally {
            this.saving = false;
        }
        if (this.changedWhileSaving) {
            this.schedule();
        }
    }
}

function createPortfolio(data, onSaveFail, saveChangesEnabled) {
    const { ProjectModel, TaskModel, ResourceModel } = bryntum.gantt;

    class DashboardTask extends TaskModel {
        static get fields() {
            return [
                'projectId',
                'isProject',
                'status',
                'priority',
                'complexity',
                'plannedCost',
                'typeId',
                'accountId',
                'managerId',
                'budget',
                // A date without time, serialized as the calendar date so that no time zone shifts it
                { name: 'statusDate', type: 'date', format: 'YYYY-MM-DD' }
            ];
        }
    }

    class DashboardResource extends ResourceModel {
        static get fields() {
            return [
                'role',
                'department',
                'city',
                'email',
                'hourlyRate',
                'maxUnits'
            ];
        }
    }

    const generalCalendar = data.calendars.rows.find(
        (calendar) => calendar.name === 'General'
    );

    // The project has no transport of its own, the changes are sent to Apex by the Saver below
    const project = new ProjectModel({
        taskModelClass: DashboardTask,
        resourceModelClass: DashboardResource,
        calendar: generalCalendar?.id,
        hoursPerDay: 24,
        daysPerWeek: 5,
        daysPerMonth: 20,
        // Keeps the stored start dates of tasks without predecessors
        autoSetConstraints: true,
        calendars: data.calendars.rows,
        tasks: buildTaskTree(data.tasks.rows),
        resources: data.resources.rows,
        assignments: data.assignments.rows,
        dependencies: data.dependencies.rows
    });

    const taskDates = data.tasks.rows.filter((task) => task.startDate);
    const firstDate = new Date(
        Math.min(...taskDates.map((task) => new Date(task.startDate).getTime()))
    );
    const lastDate = new Date(
        Math.max(...taskDates.map((task) => new Date(task.endDate).getTime()))
    );

    const portfolio = {
        project,
        data,
        firstDate,
        lastDate,
        saveChangesEnabled,
        // The date the progress line, the overdue counts and the KPI tiles refer to, see initialStatusDate()
        statusDate: null,
        // The project the views are filtered to, see selectProject()
        selectedProjectId: null,
        // The first load: the engine schedules the loaded tasks, which also sets the constraints of the tasks and
        // rolls the dates up to the parent nodes. That is not a user edit, so the result is accepted as the saved
        // state before the saving starts, and the status date can only be derived from the scheduled dates.
        ready: project.commitAsync().then(() => {
            portfolio.statusDate = initialStatusDate(project);
            project.acceptChanges();
            // With saving disabled the edits stay in the browser, for public demos
            if (saveChangesEnabled) {
                portfolio.saver = new Saver(project, onSaveFail);
            }
        })
    };
    return portfolio;
}

/**
 * Returns the shared portfolio, creating it on the first call. The component passed loads the Bryntum script, the
 * static resource is only fetched once by the platform. The options of the first caller apply to the whole page:
 * saveChanges (default true) switches the saving to Salesforce on or off.
 */
export function getPortfolio(component, onSaveFail, options = {}) {
    if (!portfolioPromise) {
        portfolioPromise = Promise.all([
            // Resolves to null when the org has no key, the component then runs in trial mode
            getLicenseKey().catch(() => null),
            loadScript(component, GANTT + '/gantt.lwc.min.js'),
            getPortfolioData()
        ]).then(([licenseKey, , data]) => {
            // Register your Bryntum Enterprise license key here, without a key the component runs in trial mode.
            // This showcase reads the key from the Bryntum_License__c record in the org, replace it with your own:
            // bryntum.licenseKey = 'key-goes-here';
            if (licenseKey) {
                bryntum.licenseKey = licenseKey;
            } else {
                console.warn(
                    'No Bryntum license key found in the org (Bryntum_License__c), running in trial mode'
                );
            }
            return createPortfolio(
                JSON.parse(data),
                onSaveFail,
                options.saveChanges !== false
            );
        });
        portfolioPromise.catch(() => {
            // Let the next component try again
            portfolioPromise = null;
        });
    }
    return portfolioPromise;
}

/**
 * The status date the dashboard starts with: the progress line of the Gantt, the overdue counts and the KPI tiles
 * refer to it. A status date saved on the project records (with the picker in the Gantt toolbar) wins. Without one,
 * the middle of the first project (the first top level node of the task tree) is used, rounded to the start of the
 * day.
 *
 * The fallback only exists because the showcase runs on a generated dataset whose dates are spread around a
 * reference date. A real application would use the current date, or a fixed status date stored with the project.
 */
function initialStatusDate(project) {
    const { DateHelper } = bryntum.gantt;
    const stored = project.taskStore.allRecords
        .filter((task) => task.isProject && task.statusDate)
        .map((task) => DateHelper.clearTime(task.statusDate))
        .filter((date) => date && !isNaN(date));
    if (stored.length) {
        return new Date(Math.max(...stored.map((date) => date.getTime())));
    }
    const firstProject = project.taskStore.rootNode.children?.find(
        (task) => task.startDate && task.endDate
    );
    if (firstProject) {
        return DateHelper.clearTime(
            new Date(
                (firstProject.startDate.getTime() +
                    firstProject.endDate.getTime()) /
                    2
            )
        );
    }
    return DateHelper.clearTime(new Date());
}

/**
 * Moves the status date: the progress line, the overdue counts and the KPI tiles follow it, and the project records
 * store it so that it survives a reload
 */
export function setStatusDate(portfolio, date) {
    const { DateHelper } = bryntum.gantt;
    portfolio.statusDate = DateHelper.clearTime(date);
    portfolio.project.taskStore.allRecords
        .filter((task) => task.isProject)
        .forEach((node) => (node.statusDate = portfolio.statusDate));
}

/**
 * Shows the tasks and the resources of one project in every view, or everything when no project is selected
 */
export function selectProject(portfolio, projectId = null) {
    if (portfolio.selectedProjectId === projectId) {
        return;
    }
    portfolio.selectedProjectId = projectId;
    const { taskStore, resourceStore } = portfolio.project;
    if (projectId) {
        taskStore.filter({
            id: 'project',
            filterBy: (task) => task.projectId === projectId
        });
        resourceStore.filter({
            id: 'project',
            filterBy: (resource) =>
                resource.assignments.some(
                    (assignment) => assignment.event?.projectId === projectId
                )
        });
    } else {
        taskStore.removeFilter('project');
        resourceStore.removeFilter('project');
    }
}
