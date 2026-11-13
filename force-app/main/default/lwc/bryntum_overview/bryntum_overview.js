import { LightningElement } from 'lwc';
import {
    getPortfolio,
    childrenOf,
    currencyFormat,
    errorMessage,
    PROJECT_STATUSES,
    TASK_STATUSES
} from 'c/bryntumPortfolio';

const DAY = 24 * 60 * 60 * 1000;
const PALETTE = [
    '#0176d3',
    '#2e844a',
    '#dd7a01',
    '#ba0517',
    '#747474',
    '#9050e9'
];
const STATUS_COLORS = {
    'Not Started': '#747474',
    'In Progress': '#0176d3',
    Late: '#ba0517',
    Completed: '#2e844a',
    Planned: '#0176d3',
    Active: '#2e844a',
    'On Hold': '#dd7a01'
};

/**
 * A dashboard-like overview of the portfolio for the Experience Cloud site: KPI tiles, a completion ring and bar
 * diagrams built from Lightning base components and plain HTML, no charting library. The numbers come from the
 * shared Bryntum project model of the c/bryntumPortfolio module, so they follow the data live whenever the project
 * changes on the same page. It only reads, so it works for guest visitors.
 */
export default class Bryntum_overview extends LightningElement {
    kpis = [];
    completion = 0;
    completionText = '';
    projectBars = [];
    breakdowns = [];
    error = null;

    renderedCallback() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        getPortfolio(this, () => {})
            .then((portfolio) => {
                this.portfolio = portfolio;
                return portfolio.ready;
            })
            .then(() => {
                this.refresh();
                this.detach = this.portfolio.project.on({
                    dataReady: () => this.scheduleRefresh(),
                    thisObj: this
                });
            })
            .catch((error) => {
                this.error = errorMessage(error);
            });
    }

    disconnectedCallback() {
        this.detach?.();
    }

    scheduleRefresh() {
        clearTimeout(this.refreshTimer);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.refreshTimer = setTimeout(() => this.refresh(), 300);
    }

    /**
     * Counts records by a field and turns the counts into the segments of a stacked bar, in a stable order
     */
    breakdown(key, title, records, field, order) {
        const counts = new Map(order ? order.map((name) => [name, 0]) : []);
        records.forEach((record) => {
            const name = record[field] || 'None';
            counts.set(name, (counts.get(name) || 0) + 1);
        });
        const total = records.length || 1;
        let index = 0;
        const segments = [...counts.entries()]
            .filter(([, count]) => count > 0)
            .map(([name, count]) => {
                const color =
                    STATUS_COLORS[name] || PALETTE[index++ % PALETTE.length];
                const percent = Math.round((count / total) * 100);
                return {
                    name,
                    count,
                    percent,
                    style: `width: ${(count / total) * 100}%; background: ${color};`,
                    swatch: `background: ${color};`,
                    title: `${name}: ${count} (${percent}%)`
                };
            });
        return { key, title, total: records.length, segments };
    }

    refresh() {
        const { project, statusDate } = this.portfolio;
        if (project.isDestroyed) {
            return;
        }
        const projects = project.taskStore.allRecords.filter(
            (task) => task.isProject
        );
        const leaves = project.taskStore.allRecords.filter(
            (task) => !task.isProject && !childrenOf(task).length
        );
        const resources = project.resourceStore.allRecords;
        const plannedCostOf = (node) =>
            childrenOf(node).reduce(
                (sum, child) => sum + (child.plannedCost || 0),
                0
            );
        const money = new Intl.NumberFormat('en-US', currencyFormat);

        // Budget against planned cost, every bar relative to the largest amount on the page
        const maxAmount = Math.max(
            1,
            ...projects.flatMap((node) => [
                node.budget || 0,
                plannedCostOf(node)
            ])
        );
        this.projectBars = projects.map((node) => {
            const budget = node.budget || 0;
            const cost = plannedCostOf(node);
            return {
                id: node.id,
                name: node.name,
                budgetStyle: `width: ${(budget / maxAmount) * 100}%;`,
                costStyle: `width: ${(cost / maxAmount) * 100}%;`,
                costClass: cost > budget ? 'bar cost over' : 'bar cost',
                values: `${money.format(cost)} of ${money.format(budget)}`
            };
        });

        this.breakdowns = [
            this.breakdown(
                'projectStatus',
                'Projects by status',
                projects,
                'status',
                PROJECT_STATUSES
            ),
            this.breakdown(
                'taskStatus',
                'Tasks by status',
                leaves,
                'status',
                TASK_STATUSES
            ),
            this.breakdown(
                'taskPriority',
                'Tasks by priority',
                leaves,
                'priority',
                ['Low', 'Medium', 'High', 'Critical']
            ),
            this.breakdown(
                'departments',
                'Resources by department',
                resources,
                'department'
            )
        ];

        const completed = leaves.filter(
            (task) => task.percentDone >= 100
        ).length;
        this.completion = leaves.length
            ? Math.round((completed / leaves.length) * 100)
            : 0;
        this.completionText = `${completed} of ${leaves.length} tasks completed`;

        this.updateKpis(
            projects,
            leaves,
            resources,
            plannedCostOf,
            statusDate,
            money
        );
    }

    updateKpis(projects, leaves, resources, plannedCostOf, statusDate, money) {
        const { project } = this.portfolio;
        const windowStart = statusDate.getTime();
        const windowEnd = windowStart + 30 * DAY;
        const allocation = new Map();
        project.assignmentStore.allRecords.forEach((assignment) => {
            const task = assignment.event;
            const resource = assignment.resource;
            if (
                !task ||
                !resource ||
                task.isProject ||
                childrenOf(task).length ||
                task.percentDone >= 100 ||
                !task.startDate ||
                !task.endDate
            ) {
                return;
            }
            const days = allocation.get(resource) || new Map();
            allocation.set(resource, days);
            const start = Math.max(task.startDate.getTime(), windowStart);
            const end = Math.min(task.endDate.getTime(), windowEnd);
            for (let time = start; time < end; time += DAY) {
                days.set(
                    time,
                    (days.get(time) || 0) + (assignment.units || 100)
                );
            }
        });
        let overallocated = 0;
        allocation.forEach((days, resource) => {
            const maxUnits = resource.maxUnits || 100;
            if ([...days.values()].some((units) => units > maxUnits)) {
                overallocated++;
            }
        });
        const totalBudget = projects.reduce(
            (sum, node) => sum + (node.budget || 0),
            0
        );
        const plannedCost = projects.reduce(
            (sum, node) => sum + plannedCostOf(node),
            0
        );
        const overdue = leaves.filter(
            (task) =>
                task.endDate &&
                task.endDate < statusDate &&
                task.percentDone < 100
        ).length;
        const inProgress = leaves.filter(
            (task) => task.status === 'In Progress'
        ).length;

        this.kpis = [
            {
                key: 'projects',
                label: 'Active projects',
                value: projects.filter((node) => node.status === 'Active')
                    .length,
                hint: `${projects.length} projects in total`
            },
            {
                key: 'tasks',
                label: 'Tasks in progress',
                value: inProgress,
                hint: `${leaves.length} tasks in total`
            },
            {
                key: 'overdue',
                label: 'Overdue tasks',
                value: overdue,
                hint: 'at the status date',
                cls: overdue ? 'kpi kpi-alert' : 'kpi'
            },
            {
                key: 'budget',
                label: 'Planned cost vs budget',
                value: totalBudget
                    ? `${Math.round((plannedCost / totalBudget) * 100)}%`
                    : '-',
                hint: `${money.format(plannedCost)} of ${money.format(totalBudget)}`,
                cls: plannedCost > totalBudget ? 'kpi kpi-alert' : 'kpi'
            },
            {
                key: 'resources',
                label: 'Overallocated next 30 days',
                value: overallocated,
                hint: `${resources.length} resources in the pool`,
                cls: overallocated ? 'kpi kpi-alert' : 'kpi'
            }
        ].map((kpi) => ({ cls: 'kpi', ...kpi }));
    }
}
