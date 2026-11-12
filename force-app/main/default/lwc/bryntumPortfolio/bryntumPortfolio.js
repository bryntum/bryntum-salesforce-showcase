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
 * every change is saved to Salesforce through one auto sync.
 */

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

let portfolioPromise = null;
const widgets = new Set();

/**
 * Loads the Bryntum styles into the template of a component, every component needs its own copy
 */
export function loadStyles(component) {
    return Promise.all(
        STYLES.map((file) => loadStyle(component, GANTT + file))
    );
}

/**
 * Nests the flat task rows (linked with parentId) into a tree with children arrays
 */
function buildTaskTree(rows) {
    const byId = new Map(rows.map((row) => [row.id, { ...row, children: [] }]));
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

function createPortfolio(data, onSyncFail, saveChangesEnabled) {
    const { ProjectModel, TaskModel, ResourceModel, DateHelper } =
        bryntum.gantt;

    // Extra fields that come from the Salesforce records. Project nodes also carry the project record fields.
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
                'statusId',
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

    // The project's crud manager sends its sync package here instead of to a URL. The handlers expect a
    // fetch-like response that can be read as text.
    class DashboardProject extends ProjectModel {
        sendRequest(request) {
            const call =
                request.type === 'sync'
                    ? saveChanges({ changes: request.data })
                    : getPortfolioData();
            call.then(
                (text) =>
                    request.success.call(
                        request.thisObj,
                        {
                            ok: true,
                            status: 200,
                            text: () => Promise.resolve(text)
                        },
                        {},
                        request
                    ),
                (error) =>
                    request.failure.call(
                        request.thisObj,
                        {
                            ok: false,
                            status: 500,
                            text: () =>
                                Promise.resolve(
                                    JSON.stringify({
                                        success: false,
                                        message: errorMessage(error)
                                    })
                                )
                        },
                        {},
                        request
                    )
            );
            return { abortController: new AbortController() };
        }
    }

    const generalCalendar = data.calendars.rows.find(
        (calendar) => calendar.name === 'General'
    );

    const project = new DashboardProject({
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
        dependencies: data.dependencies.rows,
        // Changes are collected for a moment and then sent to Apex as one package
        autoSyncTimeout: 500,
        listeners: {
            syncFail: ({ response, rawResponse }) =>
                onSyncFail(
                    response?.message || rawResponse?.message || 'Unknown error'
                )
        }
    });

    const statusNames = new Map(
        data.projectStatuses.map((status) => [status.id, status.name])
    );

    const statusIds = new Map(
        data.projectStatuses.map((status) => [status.name, status.id])
    );

    // A project node carries its status twice: the id for the grid lookup and the name for the Gantt column. Keep
    // the two in step whichever one an editor changes.
    project.taskStore.on({
        update: ({ record, changes }) => {
            if (!record.isProject) {
                return;
            }
            if ('statusId' in changes) {
                record.status = statusNames.get(record.statusId) || '';
            } else if ('status' in changes && statusIds.has(record.status)) {
                record.statusId = statusIds.get(record.status);
            }
        }
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
        statusNames,
        projectStatusNames: data.projectStatuses.map((status) => status.name),
        // The status date, set once the engine has scheduled the tasks, see below
        today: DateHelper.clearTime(new Date()),
        firstDate,
        lastDate,
        // Resolves once the engine has calculated the schedule. Whatever the engine adjusted while loading is not a
        // user change, so the sync starts with a clean slate afterwards.
        saveChangesEnabled,
        ready: project.commitAsync().then(() => {
            portfolio.today = initialStatusDate(project);
            project.acceptChanges();
            // With saving disabled the edits stay in the browser, for public demos
            project.autoSync = saveChangesEnabled;
        })
    };
    return portfolio;
}

/**
 * Returns the shared portfolio, creating it on the first call. The component passed loads the Bryntum script, the
 * static resource is only fetched once by the platform. The options of the first caller apply to the whole page:
 * saveChanges (default true) switches the auto sync to Salesforce on or off.
 */
export function getPortfolio(component, onSyncFail, options = {}) {
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
                onSyncFail,
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
    portfolio.today = DateHelper.clearTime(date);
    portfolio.project.taskStore.allRecords
        .filter((task) => task.isProject)
        .forEach((node) => (node.statusDate = portfolio.today));
}

/**
 * The widgets currently shown on the page, so that a view can reach the others (the Gantt deselects the grid)
 */
export function registerWidget(widget) {
    widgets.add(widget);
    return () => widgets.delete(widget);
}

export function findWidget(predicate) {
    return [...widgets].find(predicate);
}

/**
 * Shows the tasks and the resources of one project in every view, or everything when no project is selected
 */
export function selectProject(portfolio, projectId) {
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
