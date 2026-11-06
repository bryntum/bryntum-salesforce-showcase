/* globals bryntum : true */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import GANTT from '@salesforce/resourceUrl/bryntum_gantt';
import getPortfolioData from '@salesforce/apex/BryntumDashboardController.getPortfolioData';

const DAY = 24 * 60 * 60 * 1000;

const currencyFormat = {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
};

/**
 * Portfolio dashboard: KPI tiles, a grid of projects, a Gantt chart of all tasks and a resource histogram, all built
 * from the records of the Bryntum custom objects. The Bryntum widgets come from the bryntum_gantt static resource,
 * which also contains the Grid and the Scheduler Pro classes.
 */
export default class Bryntum_dashboard extends LightningElement {
    kpis = [];
    loading = true;
    view = 'overview';

    views = [
        { name: 'overview', label: 'Overview' },
        { name: 'projects', label: 'Projects' },
        { name: 'gantt', label: 'Gantt' },
        { name: 'resources', label: 'Resources' }
    ];

    get viewButtons() {
        return this.views.map((view) => ({
            ...view,
            variant: view.name === this.view ? 'brand' : 'neutral'
        }));
    }

    handleViewClick(event) {
        this.showView(event.currentTarget.dataset.view);
    }

    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, GANTT + '/gantt.lwc.min.js'),
            loadStyle(this, GANTT + '/gantt.css'),
            loadStyle(this, GANTT + '/svalbard.css'),
            loadStyle(this, GANTT + '/fontawesome/css/fontawesome.css'),
            loadStyle(this, GANTT + '/fontawesome/css/solid.css'),
            getPortfolioData()
        ])
            .then((results) => {
                this.createDashboard(JSON.parse(results[5]));
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading the Bryntum dashboard',
                        message:
                            error?.body?.message ||
                            error?.message ||
                            String(error),
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.loading = false;
            });
    }

    disconnectedCallback() {
        this.histogram?.destroy();
        this.gantt?.destroy();
        this.grid?.destroy();
        this.project?.destroy();
    }

    createDashboard(data) {
        // Register your Bryntum Enterprise license key here, without a key the component runs in trial mode
        bryntum.licenseKey = 'key-goes-here';

        const {
            ProjectModel,
            TaskModel,
            ResourceModel,
            Grid,
            Gantt,
            ResourceHistogram,
            Splitter,
            DateHelper,
            StringHelper
        } = bryntum.gantt;
        const root = this.template.querySelector('.bryntum-root-element');
        const today = DateHelper.clearTime(new Date());

        // Extra fields that come from the Salesforce records
        class DashboardTask extends TaskModel {
            static get fields() {
                return [
                    'projectId',
                    'isProject',
                    'status',
                    'priority',
                    'complexity',
                    'plannedCost'
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

        const project = (this.project = new ProjectModel({
            taskModelClass: DashboardTask,
            resourceModelClass: DashboardResource,
            calendar: generalCalendar?.id,
            hoursPerDay: 24,
            daysPerWeek: 5,
            daysPerMonth: 20,
            // Keeps the stored start dates of tasks without predecessors
            autoSetConstraints: true,
            calendars: data.calendars.rows,
            tasks: this.buildTaskTree(data.tasks.rows),
            resources: data.resources.rows,
            assignments: data.assignments.rows,
            dependencies: data.dependencies.rows
        }));

        const summaries = this.summarizeProjects(data, today);
        this.kpis = this.calculateKpis(data, summaries, today);

        const statusRenderer = ({ value }) => {
            if (!value) {
                return '';
            }
            const cls = value.toLowerCase().replace(/\s+/g, '-');
            return `<span class="dashboard-status dashboard-status-${cls}">${StringHelper.encodeHtml(value)}</span>`;
        };

        // Lookup columns show the name of the related record and offer the allowed records in a combo, no free text
        const lookupColumn = (text, field, entities, extra = {}) => {
            const names = new Map(
                entities.map((entity) => [entity.id, entity.name])
            );
            return {
                text,
                field,
                renderer: ({ value }) => names.get(value) || '',
                editor: {
                    type: 'combo',
                    editable: false,
                    items: entities.map((entity) => ({
                        id: entity.id,
                        text: entity.name
                    }))
                },
                ...extra
            };
        };
        const statusNames = new Map(
            data.projectStatuses.map((status) => [status.id, status.name])
        );

        const grid = (this.grid = new Grid({
            appendTo: root,
            cls: 'dashboard-projects',
            flex: '0 0 230px',
            minHeight: 150,
            rowHeight: 36,
            store: { data: summaries },
            selectionMode: { row: true, multiSelect: false },
            columns: [
                { text: 'Project', field: 'name', flex: 2, minWidth: 180 },
                lookupColumn('Type', 'typeId', data.projectTypes, {
                    width: 120
                }),
                lookupColumn('Status', 'statusId', data.projectStatuses, {
                    width: 110,
                    htmlEncode: false,
                    renderer: ({ value }) =>
                        statusRenderer({ value: statusNames.get(value) })
                }),
                lookupColumn('Account', 'accountId', data.accounts, {
                    flex: 1,
                    minWidth: 130
                }),
                lookupColumn('Manager', 'managerId', data.managers, {
                    width: 150
                }),
                {
                    type: 'date',
                    text: 'Start',
                    field: 'startDate',
                    width: 110,
                    format: 'MMM D, YYYY'
                },
                {
                    type: 'date',
                    text: 'End',
                    field: 'endDate',
                    width: 110,
                    format: 'MMM D, YYYY'
                },
                {
                    type: 'percent',
                    text: 'Progress',
                    field: 'percentDone',
                    width: 120
                },
                {
                    type: 'number',
                    text: 'Budget',
                    field: 'budget',
                    width: 110,
                    format: currencyFormat
                },
                {
                    type: 'number',
                    text: 'Planned cost',
                    field: 'plannedCost',
                    width: 120,
                    format: currencyFormat,
                    renderer({ value, record, cellElement, column }) {
                        cellElement.classList.toggle(
                            'dashboard-over-budget',
                            value > record.budget
                        );
                        return column.formatValue(value);
                    }
                },
                {
                    type: 'number',
                    text: 'Tasks',
                    field: 'taskCount',
                    width: 80
                },
                {
                    type: 'number',
                    text: 'Overdue',
                    field: 'overdue',
                    width: 90,
                    renderer({ value, cellElement }) {
                        cellElement.classList.toggle(
                            'dashboard-over-budget',
                            value > 0
                        );
                        return value;
                    }
                }
            ],
            listeners: {
                selectionChange: ({ selected }) =>
                    this.selectProject(selected[0]?.id)
            }
        }));

        this.splitters = [new Splitter({ appendTo: root })];

        const taskDates = data.tasks.rows.filter((task) => task.startDate);
        const firstDate = new Date(
            Math.min(
                ...taskDates.map((task) => new Date(task.startDate).getTime())
            )
        );
        const lastDate = new Date(
            Math.max(
                ...taskDates.map((task) => new Date(task.endDate).getTime())
            )
        );

        const gantt = (this.gantt = new Gantt({
            appendTo: root,
            flex: 2,
            minHeight: 250,
            project,
            readOnly: true,
            dependencyIdField: 'sequenceNumber',
            startDate: DateHelper.add(firstDate, -7, 'day'),
            endDate: DateHelper.add(lastDate, 14, 'day'),
            viewPreset: 'weekAndDayLetter',
            columnLines: false,
            rowHeight: 36,
            columns: [
                { type: 'name', width: 280 },
                {
                    text: 'Status',
                    field: 'status',
                    width: 110,
                    htmlEncode: false,
                    renderer: statusRenderer
                },
                { type: 'startdate', width: 110 },
                { type: 'enddate', width: 110 },
                { type: 'duration', width: 90 },
                { type: 'percentdone', mode: 'circle', width: 70 },
                { type: 'resourceassignment', width: 180, showAvatars: false },
                {
                    type: 'number',
                    text: 'Planned cost',
                    field: 'plannedCost',
                    width: 120,
                    format: currencyFormat
                },
                { type: 'deadlinedate', width: 110 },
                { text: 'Priority', field: 'priority', width: 90 }
            ],
            features: {
                baselines: false,
                criticalPaths: { disabled: true },
                progressLine: { statusDate: today },
                timelineChart: { disabled: true },
                rollups: true,
                filter: true,
                projectLines: false
            },
            tbar: [
                {
                    type: 'button',
                    text: 'All projects',
                    icon: 'fa fa-layer-group',
                    onClick: () => grid.deselectAll()
                },
                {
                    type: 'button',
                    text: 'Today',
                    icon: 'fa fa-calendar-day',
                    onClick: () =>
                        gantt.scrollToDate(today, { block: 'center' })
                },
                {
                    type: 'button',
                    icon: 'fa fa-angles-down',
                    tooltip: 'Expand all',
                    onClick: () => gantt.expandAll()
                },
                {
                    type: 'button',
                    icon: 'fa fa-angles-up',
                    tooltip: 'Collapse all',
                    onClick: () => gantt.collapseAll()
                },
                '->',
                {
                    type: 'button',
                    text: 'Critical path',
                    icon: 'fa fa-fire',
                    toggleable: true,
                    onToggle: ({ pressed }) =>
                        (gantt.features.criticalPaths.disabled = !pressed)
                },
                {
                    type: 'button',
                    text: 'S-curve',
                    icon: 'fa fa-chart-line',
                    toggleable: true,
                    onToggle: ({ pressed }) =>
                        (gantt.features.timelineChart.disabled = !pressed)
                },
                {
                    type: 'button',
                    icon: 'fa fa-magnifying-glass-minus',
                    tooltip: 'Zoom out',
                    onClick: () => gantt.zoomOut()
                },
                {
                    type: 'button',
                    icon: 'fa fa-magnifying-glass-plus',
                    tooltip: 'Zoom in',
                    onClick: () => gantt.zoomIn()
                }
            ]
        }));

        this.splitters.push(new Splitter({ appendTo: root }));

        this.histogram = new ResourceHistogram({
            appendTo: root,
            flex: 1,
            minHeight: 180,
            project,
            partner: gantt,
            readOnly: true,
            rowHeight: 40,
            showBarTip: true,
            showMaxEffort: true,
            columns: [
                {
                    type: 'resourceInfo',
                    text: 'Resource',
                    field: 'name',
                    showEventCount: false,
                    showImage: false,
                    showRole: 'role',
                    width: 240
                },
                { text: 'Department', field: 'department', width: 120 },
                { text: 'City', field: 'city', width: 110 }
            ],
            features: {
                group: 'department',
                scheduleTooltip: false
            }
        });

        // Open the timeline around today once the engine has calculated the schedule
        project
            .commitAsync()
            .then(() => gantt.scrollToDate(today, { block: 'center' }));
    }

    /**
     * Nests the flat task rows (linked with parentId) into a tree with children arrays
     */
    buildTaskTree(rows) {
        const byId = new Map(
            rows.map((row) => [row.id, { ...row, children: [] }])
        );
        const roots = [];
        byId.forEach((node) => {
            const parent = node.parentId ? byId.get(node.parentId) : null;
            if (parent) {
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        });
        const byIndex = (a, b) =>
            (a.orderedParentIndex || 0) - (b.orderedParentIndex || 0);
        byId.forEach((node) => {
            node.children.sort(byIndex);
            if (!node.children.length) {
                delete node.children;
            }
        });
        return roots.sort(byIndex);
    }

    /**
     * Rolls the task data up per project for the projects grid
     */
    summarizeProjects(data, today) {
        const tasks = data.tasks.rows.filter((task) => !task.isProject);
        const parentIds = new Set(tasks.map((task) => task.parentId));

        return data.projects.map((project) => {
            const projectTasks = tasks.filter(
                (task) => task.projectId === project.id
            );
            const leaves = projectTasks.filter(
                (task) => !parentIds.has(task.id)
            );
            const phases = projectTasks.filter(
                (task) => task.parentId === project.id
            );
            const totalDuration = phases.reduce(
                (sum, task) => sum + (task.duration || 0),
                0
            );

            return {
                ...project,
                startDate: project.startDate
                    ? new Date(project.startDate)
                    : null,
                endDate: project.endDate ? new Date(project.endDate) : null,
                taskCount: leaves.length,
                overdue: leaves.filter(
                    (task) =>
                        new Date(task.endDate) < today && task.percentDone < 100
                ).length,
                plannedCost: phases.reduce(
                    (sum, task) => sum + (task.plannedCost || 0),
                    0
                ),
                percentDone: totalDuration
                    ? Math.round(
                          phases.reduce(
                              (sum, task) =>
                                  sum +
                                  (task.percentDone || 0) *
                                      (task.duration || 0),
                              0
                          ) / totalDuration
                      )
                    : 0
            };
        });
    }

    /**
     * Calculates the numbers for the KPI tiles
     */
    calculateKpis(data, summaries, today) {
        const tasks = data.tasks.rows.filter((task) => !task.isProject);
        const parentIds = new Set(tasks.map((task) => task.parentId));
        const leaves = tasks.filter((task) => !parentIds.has(task.id));
        const taskById = new Map(leaves.map((task) => [task.id, task]));
        const resourceById = new Map(
            data.resources.rows.map((resource) => [resource.id, resource])
        );

        // Allocation per resource and day in the next 30 days, to find the overallocated resources
        const windowStart = today.getTime();
        const windowEnd = windowStart + 30 * DAY;
        const allocation = new Map();
        data.assignments.rows.forEach((assignment) => {
            const task = taskById.get(assignment.event);
            if (!task || task.percentDone >= 100) {
                return;
            }
            const days = allocation.get(assignment.resource) || new Map();
            allocation.set(assignment.resource, days);
            const start = Math.max(
                new Date(task.startDate).getTime(),
                windowStart
            );
            const end = Math.min(new Date(task.endDate).getTime(), windowEnd);
            for (let time = start; time < end; time += DAY) {
                days.set(
                    time,
                    (days.get(time) || 0) + (assignment.units || 100)
                );
            }
        });
        let overallocated = 0;
        allocation.forEach((days, resourceId) => {
            const maxUnits = resourceById.get(resourceId)?.maxUnits || 100;
            if ([...days.values()].some((units) => units > maxUnits)) {
                overallocated++;
            }
        });

        const budget = summaries.reduce(
            (sum, project) => sum + (project.budget || 0),
            0
        );
        const plannedCost = summaries.reduce(
            (sum, project) => sum + project.plannedCost,
            0
        );
        const overdue = summaries.reduce(
            (sum, project) => sum + project.overdue,
            0
        );
        const inProgress = leaves.filter(
            (task) => task.status === 'In Progress'
        ).length;
        const completed = leaves.filter(
            (task) => task.percentDone >= 100
        ).length;
        const dueThisMonth = leaves.filter((task) => {
            const end = new Date(task.endDate);
            return (
                task.percentDone < 100 &&
                end >= today &&
                end < new Date(today.getFullYear(), today.getMonth() + 1, 1)
            );
        }).length;
        const money = new Intl.NumberFormat('en-US', currencyFormat);

        return [
            {
                key: 'projects',
                label: 'Active projects',
                value: summaries.filter(
                    (project) => project.status === 'Active'
                ).length,
                hint: `${summaries.length} projects in total`
            },
            {
                key: 'tasks',
                label: 'Tasks in progress',
                value: inProgress,
                hint: `${completed} of ${leaves.length} tasks completed`
            },
            {
                key: 'overdue',
                label: 'Overdue tasks',
                value: overdue,
                hint: `${dueThisMonth} more due this month`,
                cls: overdue ? 'kpi kpi-alert' : 'kpi'
            },
            {
                key: 'budget',
                label: 'Planned cost vs budget',
                value: budget
                    ? `${Math.round((plannedCost / budget) * 100)}%`
                    : '-',
                hint: `${money.format(plannedCost)} of ${money.format(budget)}`,
                cls: plannedCost > budget ? 'kpi kpi-alert' : 'kpi'
            },
            {
                key: 'resources',
                label: 'Overallocated next 30 days',
                value: overallocated,
                hint: `${data.resources.rows.length} resources in the pool`,
                cls: overallocated ? 'kpi kpi-alert' : 'kpi'
            }
        ].map((kpi) => ({ cls: 'kpi', ...kpi }));
    }

    /**
     * Shows all widgets (overview) or one of them using the full height
     */
    showView(view) {
        this.view = view;
        if (!this.grid) {
            return;
        }
        const overview = view === 'overview';
        this.grid.hidden = !overview && view !== 'projects';
        this.gantt.hidden = !overview && view !== 'gantt';
        this.histogram.hidden = !overview && view !== 'resources';
        this.splitters.forEach((splitter) => (splitter.hidden = !overview));
        // The projects grid has a fixed height in the overview and fills the dashboard on its own
        this.grid.element.style.flex = overview ? '0 0 230px' : '1 1 0';
    }

    /**
     * Shows the tasks and the resources of one project, or everything when no project is selected
     */
    selectProject(projectId) {
        const { taskStore, resourceStore } = this.project;

        if (projectId) {
            taskStore.filter({
                id: 'project',
                filterBy: (task) => task.projectId === projectId
            });
            resourceStore.filter({
                id: 'project',
                filterBy: (resource) =>
                    resource.assignments.some(
                        (assignment) =>
                            assignment.event?.projectId === projectId
                    )
            });
            const projectNode = taskStore.getById(projectId);
            if (projectNode) {
                this.gantt.scrollTaskIntoView(projectNode);
            }
        } else {
            taskStore.removeFilter('project');
            resourceStore.removeFilter('project');
        }
    }
}
