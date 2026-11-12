/* globals bryntum : true */
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {
    getPortfolio,
    loadStyles,
    registerWidget,
    findWidget,
    selectProject,
    TASK_STATUSES,
    TASK_PRIORITIES,
    DEPARTMENTS,
    currencyFormat,
    errorMessage,
    childrenOf,
    leavesOf
} from 'c/bryntumPortfolio';

/**
 * One view of the Bryntum dashboard: the projects grid, the Gantt timeline or the resource histogram, chosen with
 * the "view" property in the Lightning App Builder. The Bryntum Dashboard page shows the Salesforce portfolio
 * dashboard in its first tab and one instance of this component in each of the other tabs. All instances share the
 * project model of the c/bryntumPortfolio module, so an edit in one tab shows up in the others and every change is
 * saved to Salesforce through the project's auto sync.
 */
export default class Bryntum_dashboard extends LightningElement {
    // projects | timeline | resources
    @api view = 'projects';
    loading = true;

    renderedCallback() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        Promise.all([
            loadStyles(this),
            getPortfolio(this, (message) =>
                this.toast('Could not save the changes to Salesforce', message)
            )
        ])
            .then(([, portfolio]) => {
                this.portfolio = portfolio;
                this.createWidget();
                return portfolio.ready;
            })
            .then(() => this.afterReady())
            .catch((error) =>
                this.toast('Error loading the Bryntum dashboard', error)
            )
            .finally(() => {
                this.loading = false;
            });
    }

    disconnectedCallback() {
        this.detachDataReady?.();
        this.unregister?.();
        this.widget?.destroy();
    }

    toast(title, error) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message: errorMessage(error),
                variant: 'error'
            })
        );
    }

    createWidget() {
        const root = this.template.querySelector('.bryntum-root-element');
        if (this.view === 'timeline') {
            this.widget = this.createGantt(root);
        } else if (this.view === 'resources') {
            this.widget = this.createHistogram(root);
        } else {
            this.widget = this.createGrid(root);
        }
        this.unregister = registerWidget(this.widget);
    }

    afterReady() {
        const { widget, portfolio } = this;
        if (this.view === 'timeline') {
            widget.scrollToDate(portfolio.today, { block: 'center' });
        } else if (this.view === 'projects') {
            widget.refreshRows();
        }
    }

    statusRenderer({ value }) {
        if (!value) {
            return '';
        }
        const cls = value.toLowerCase().replace(/\s+/g, '-');
        return `<span class="dashboard-status dashboard-status-${cls}">${bryntum.gantt.StringHelper.encodeHtml(value)}</span>`;
    }

    pickColumn(text, field, values, extra = {}) {
        return {
            text,
            field,
            editor: { type: 'combo', editable: false, items: values },
            ...extra
        };
    }

    // Lookup columns show the name of the related record and offer the allowed records in a combo, no free text
    lookupColumn(text, field, entities, extra = {}) {
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
    }

    /**
     * The projects grid lists the project nodes of the shared task store, edits go straight into the same records
     */
    createGrid(root) {
        const { Grid } = bryntum.gantt;
        const { project, data, statusNames, today } = this.portfolio;
        const projectStore = project.taskStore.chain(
            (record) => record.isProject
        );
        const plannedCostOf = (node) =>
            childrenOf(node).reduce(
                (sum, child) => sum + (child.plannedCost || 0),
                0
            );
        const overdueOf = (node) =>
            leavesOf(node).filter(
                (task) =>
                    !task.isProject &&
                    task.endDate < today &&
                    task.percentDone < 100
            ).length;

        const grid = new Grid({
            appendTo: root,
            cls: 'dashboard-projects',
            flex: '1 1 0',
            rowHeight: 36,
            store: projectStore,
            selectionMode: { row: true, multiSelect: false },
            columns: [
                { text: 'Project', field: 'name', flex: 2, minWidth: 180 },
                this.lookupColumn('Type', 'typeId', data.projectTypes, {
                    width: 120
                }),
                this.lookupColumn('Status', 'statusId', data.projectStatuses, {
                    width: 110,
                    htmlEncode: false,
                    renderer: ({ value }) =>
                        this.statusRenderer({ value: statusNames.get(value) })
                }),
                this.lookupColumn('Account', 'accountId', data.accounts, {
                    flex: 1,
                    minWidth: 130
                }),
                this.lookupColumn('Manager', 'managerId', data.managers, {
                    width: 150
                }),
                {
                    type: 'date',
                    text: 'Start',
                    field: 'startDate',
                    width: 110,
                    format: 'MMM D, YYYY',
                    // Calculated from the tasks by the scheduling engine
                    editor: false
                },
                {
                    type: 'date',
                    text: 'End',
                    field: 'endDate',
                    width: 110,
                    format: 'MMM D, YYYY',
                    editor: false
                },
                {
                    type: 'percent',
                    text: 'Progress',
                    field: 'percentDone',
                    width: 120,
                    editor: false
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
                    width: 120,
                    format: currencyFormat,
                    editor: false,
                    renderer({ record, cellElement, column }) {
                        const value = plannedCostOf(record);
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
                    width: 80,
                    editor: false,
                    renderer: ({ record }) =>
                        leavesOf(record).filter((task) => !task.isProject)
                            .length
                },
                {
                    type: 'number',
                    text: 'Overdue',
                    width: 90,
                    editor: false,
                    renderer({ record, cellElement }) {
                        const value = overdueOf(record);
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
                    selectProject(this.portfolio, selected[0]?.id)
            }
        });

        // The engine fills in the dates and progress of the project nodes after the grid first painted them
        this.detachDataReady = project.on({
            dataReady: () => grid.refreshRows(),
            thisObj: this
        });
        return grid;
    }

    createGantt(root) {
        const { Gantt, DateHelper } = bryntum.gantt;
        const { project, today, firstDate, lastDate } = this.portfolio;

        const gantt = new Gantt({
            appendTo: root,
            flex: 1,
            project,
            dependencyIdField: 'sequenceNumber',
            // A fixed width for the columns leaves room for the timeline
            subGridConfigs: { locked: { width: 620 } },
            startDate: DateHelper.add(firstDate, -7, 'day'),
            endDate: DateHelper.add(lastDate, 14, 'day'),
            viewPreset: 'weekAndDayLetter',
            columnLines: false,
            rowHeight: 36,
            columns: [
                { type: 'name', width: 280 },
                this.pickColumn('Status', 'status', TASK_STATUSES, {
                    width: 110,
                    htmlEncode: false,
                    renderer: this.statusRenderer
                }),
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
                this.pickColumn('Priority', 'priority', TASK_PRIORITIES, {
                    width: 90
                })
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
                    tooltip: 'Show the tasks of all projects',
                    onClick: () => {
                        findWidget(
                            (widget) => widget.type === 'grid'
                        )?.deselectAll();
                        selectProject(this.portfolio, null);
                    }
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
        });
        return gantt;
    }

    createHistogram(root) {
        const { ResourceHistogram, DateHelper } = bryntum.gantt;
        const { project, firstDate, lastDate } = this.portfolio;

        return new ResourceHistogram({
            appendTo: root,
            flex: 1,
            project,
            subGridConfigs: { locked: { width: 420 } },
            startDate: DateHelper.add(firstDate, -7, 'day'),
            endDate: DateHelper.add(lastDate, 14, 'day'),
            viewPreset: 'weekAndDayLetter',
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
                    width: 200
                },
                this.pickColumn('Department', 'department', DEPARTMENTS, {
                    width: 110
                }),
                { text: 'City', field: 'city', width: 100 }
            ],
            features: {
                group: 'department',
                scheduleTooltip: false
            }
        });
    }
}
