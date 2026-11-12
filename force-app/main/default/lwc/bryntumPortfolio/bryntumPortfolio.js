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

function createPortfolio(data, onSyncFail) {
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
                'budget'
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

    // The Gantt shows the status name of a project node, keep it in step with the status chosen in the grid
    project.taskStore.on({
        update: ({ record, changes }) => {
            if (record.isProject && 'statusId' in changes) {
                record.status = statusNames.get(record.statusId) || '';
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
        today: DateHelper.clearTime(new Date()),
        firstDate,
        lastDate,
        // Resolves once the engine has calculated the schedule. Whatever the engine adjusted while loading is not a
        // user change, so the sync starts with a clean slate afterwards.
        ready: project.commitAsync().then(() => {
            project.acceptChanges();
            project.autoSync = true;
        })
    };
    return portfolio;
}

/**
 * Returns the shared portfolio, creating it on the first call. The component passed loads the Bryntum script, the
 * static resource is only fetched once by the platform.
 */
export function getPortfolio(component, onSyncFail) {
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
            return createPortfolio(JSON.parse(data), onSyncFail);
        });
        portfolioPromise.catch(() => {
            // Let the next component try again
            portfolioPromise = null;
        });
    }
    return portfolioPromise;
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
