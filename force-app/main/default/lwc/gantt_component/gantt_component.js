/* globals bryntum : true */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import GANTT from '@salesforce/resourceUrl/bryntum_gantt';
import initWidgets from './lib/WidgetInitializer.js';
import TaskModelMixin from './lib/Task';
import data from './data/launch-saas'

export default class Gantt_component extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, GANTT + '/gantt.lwc.module.js'),
            loadStyle(this, GANTT + '/gantt.css'),
            loadStyle(this, GANTT + '/svalbard-light.css'),
            loadStyle(this, GANTT + '/fontawesome/css/fontawesome.css'),
            loadStyle(this, GANTT + '/fontawesome/css/solid.css')
        ])
            .then(() => {
                console.log(`Bryntum Core version: ${bryntum.getVersion('core')}`);
                this.createGantt();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading Bryntum Gantt',
                        message: error,
                        variant: 'error'
                    })
                );
            });
    }

    createGantt() {
        initWidgets()

        const project = new bryntum.gantt.ProjectModel({
            taskModelClass: TaskModelMixin(bryntum.gantt.TaskModel),
            calendar: data.project.calendar,
            startDate: data.project.startDate,
            tasks: data.tasks.rows,
            resources: data.resources.rows,
            assignments: data.assignments.rows,
            dependencies: data.dependencies.rows,
            calendars: data.calendars.rows
        });

        const appendTo = this.template.querySelector('.container');

        const gantt = new bryntum.gantt.Gantt({
            project,
            appendTo,
            dependencyIdField : 'wbsCode',
            showDirty         : true,
            selectionMode     : {
                cell       : true,
                dragSelect : true,
                rowNumber  : true
            },

            flex : 1,

            // display cost related UI controls
            showCostControls : true,

            // For best initial performance, configure startDate & endDate to determine the date range that needs to be
            // rendered initially
            startDate                     : '2025-01-05',
            endDate                       : '2025-03-24',
            resourceImagePath             : '../_shared/images/transparent-users/',
            scrollTaskIntoViewOnCellClick : true,

            columns : [
                { type : 'wbs', hidden : true },
                { type : 'name', width : 250, showWbs : true },
                { type : 'cost' },
                { type : 'startdate' },
                { type : 'duration' },
                { type : 'resourceassignment', width : 120, showAvatars : true },
                { type : 'percentdone', mode : 'circle', width : 70 },
                { type : 'predecessor', width : 112 },
                { type : 'successor', width : 112 },
                { type : 'schedulingmodecolumn' },
                { type : 'calendar' },
                { type : 'constrainttype' },
                { type : 'constraintdate' },
                { type : 'statuscolumn' },
                { type : 'complexitycolumn' },
                { type : 'deadlinedate' },
                { type : 'addnew' }
            ],

            viewPreset : {
                base      : 'weekAndDayLetter',
                tickWidth : 35
            },

            subGridConfigs : {
                locked : {
                    flex : 3
                },
                normal : {
                    flex : 4
                }
            },

            columnLines : false,

            // Shows a color field in the task editor and a color picker in the task menu.
            // Both lets the user select the Task bar's background color
            showTaskColorPickers : true,

            features : {
                projectEdit : true,
                baselines   : {
                    disabled : true
                },
                dependencies : {
                    showLagInTooltip : true,
                    // Soften up dependency line corners
                    radius           : 3,
                    // Make dependencies easier to reach using the mouse
                    clickWidth       : 5
                },
                dependencyEdit : true,
                filter         : true,
                labels         : {
                    before : {
                        field  : 'name',
                        editor : {
                            type : 'textfield'
                        }
                    }
                },
                parentArea : {
                    disabled : true
                },
                progressLine : {
                    disabled   : true,
                    statusDate : new Date(2025, 0, 25)
                },
                rollups : {
                    disabled : true
                },
                rowResize : {
                    cellSelector : '.b-sequence-cell'
                },
                rowReorder : {
                    showGrip        : 'hover',
                    preserveSorters : true
                },
                timeRanges : {
                    showCurrentTimeLine : true
                },
                fillHandle    : true,
                cellCopyPaste : true,
                taskCopyPaste : {
                    useNativeClipboard : true
                },
                taskDrag : {
                    dragAllSelectedTasks : true
                }
            },

            tbar : {
                type : 'gantttoolbar'
            }
        });

        let resourceGrid;

        // Let toolbars know of other view references
        Object.defineProperty(gantt.tbar, 'resourceGrid', {
            get() {
                if (!resourceGrid) {
                    resourceGrid = new bryntum.gantt.ResourceGrid({
                        appendTo,
                        project,

                        flex : 1,
                        // resource grid is hidden initially
                        hidden            : true,
                        columns           : {
                            data : {
                                // override default cost column
                                cost : {
                                    // rollup cost to the groups
                                    sum : 'sum'
                                },
                                // override default name column
                                name : {
                                    // change its type to resourceInfo to show resource images
                                    type           : 'resourceInfo',
                                    // don't use event count - it works for Scheduler based views only
                                    showEventCount : false,
                                    width          : 200
                                },
                                // add new "City" column
                                city : {
                                    text  : 'City',
                                    field : 'city'
                                }
                            }
                        },
                        features : {
                            // group by resource type (work, material or cost)
                            group : {
                                field : 'type'
                            },
                            // display groups summary (used for rolling up cost)
                            groupSummary : {
                                target : 'header'
                            },
                            // enable resource editor dialog
                            resourceEdit : true
                        },
                        tbar : {
                            type : 'resourcegridtoolbar',
                            gantt
                        }
                    });
                }
                return resourceGrid;
            }
        });
    }
}
