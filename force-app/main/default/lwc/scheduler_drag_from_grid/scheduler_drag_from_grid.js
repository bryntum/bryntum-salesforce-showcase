/* globals bryntum : true */
import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import SCHEDULER from "@salesforce/resourceUrl/bryntum_scheduler";
import ScheduleMixin from "./lib/Schedule";
import UnplannedGridMixin from "./lib/UnplannedGrid";
import TaskMixin from "./lib/Task";
import TaskStoreMixin from "./lib/TaskStore";
import IconComboMixin from "./lib/IconCombo";
import DragMixin from "./lib/Drag";
import { projectData } from "./projectData";
import { unplannedData } from "./unplannedData";

export default class SchedulerDragFromGirdDemo extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, SCHEDULER + "/scheduler.lwc.module.js"),
            loadStyle(this, SCHEDULER + "/scheduler.stockholm.css")
        ])
        .then(() => {
            console.log(`Bryntum Core version: ${bryntum.getVersion('core')}`);
            this.createScheduler();
        })
        .catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error loading Bryntum Scheduler",
                    message: error,
                    variant: "error"
                })
            );
        });
    }

    createScheduler() {
        const {
            Grid,
            Scheduler,
            EventModel,
            EventStore,
            ResourceModel,
            Splitter,
            Combo,
            DragHelper
        } = bryntum.scheduler;

        window.appendTo = this.template.querySelector(".container");

        class CustomResourceModel extends ResourceModel {
            static get $name() {
                return 'CustomResourceModel';
            }
        
            static get fields() {
                return [
                    // Do not persist `cls` field because we change its value on dragging unplanned resources to highlight the row
                    { name : 'cls', persist : false }
                ];
            }
        }
        

        const Task = TaskMixin(EventModel);
        const TaskStore = TaskStoreMixin(EventStore, Task);
        const IconCombo = IconComboMixin(Combo);
        const Schedule = ScheduleMixin(Scheduler);
        const UnplannedGrid = UnplannedGridMixin(Grid);
        const Drag = DragMixin(DragHelper);

        const schedule = window.schedule = new Schedule({
            ref         : "schedule",
            appendTo    : appendTo,
            startDate   : new Date(2025, 11, 1, 8),
            endDate     : new Date(2025, 11, 1, 18),
            flex        : 4,
            crudManager : {
                autoLoad         : true,
                // This config enables response validation and dumping of found errors to the browser console.
                // It's meant to be used as a development stage helper only so please set it to false for production systems.
                validateResponse : true,
                eventStore       : {
                    storeClass : TaskStore
                },
                resourceStore : {
                    modelClass : CustomResourceModel
                }
            },

            tbar : [
                'Schedule view',
                '->',
                { type : 'viewpresetcombo' },
                {
                    type        : 'button',
                    toggleable  : true,
                    icon        : 'b-fa-calendar',
                    pressedIcon : 'b-fa-calendar-check',
                    text        : 'Automatic rescheduling',
                    tooltip     : 'Toggles whether to automatically reschedule overlapping tasks',
                    cls         : 'reschedule-button',
                    onToggle({ pressed }) {
                        schedule.autoRescheduleTasks = pressed;
                    }
                },
                {
                    type        : 'buttonGroup',
                    toggleGroup : true,
                    items       : [
                        {
                            icon            : 'b-fa-fw b-fa-arrows-alt-v',
                            pressed         : 'up.isVertical',
                            tooltip         : 'Vertical mode',
                            schedulerConfig : {
                                mode           : 'vertical',
                                subGridConfigs : {
                                    locked : {
                                        minWidth : 100,
                                        flex     : null
                                    }
                                }
                            }
                        },
                        {
                            icon            : 'b-fa-fw b-fa-arrows-alt-h',
                            pressed         : 'up.isHorizontal',
                            tooltip         : 'Horizontal mode',
                            schedulerConfig : {
                                mode : 'horizontal'
                            }
                        }
                    ],
                    onAction({ source : button }) {
                        const newConfig = { ...schedule.initialConfig, ...button.schedulerConfig };

                        // Recreate the scheduler to switch orientation
                        schedule.destroy();
                        schedule = new Schedule(newConfig);

                        // Provide drag helper a reference to the new instance
                        drag.schedule = schedule;
                    }
                }
            ]
        });

        window.splitter = new Splitter({
        appendTo
        });

        const unplannedGrid = window.unplannedGrid = new UnplannedGrid({
            ref: "unplanned",
            flex: "0 1 400px",
            appendTo: appendTo,
            title       : 'Unplanned Tasks',
            collapsible : true,
            flex        : '0 0 300px',
            ui          : 'toolbar',

            // Schedulers stores are contained by a project, pass it to the grid to allow it to access them
            project : schedule.project,
            store   : {
                modelClass : Task
            }
        });

        // Handles dragging
        window.drag = new Drag({
            grid: unplannedGrid,
            schedule,
            constrain: false,
            outerElement: unplannedGrid.element
        });

        schedule.project.loadInlineData(projectData);
        unplannedGrid.store.loadData(unplannedData);

        schedule.assignmentStore.on({
            // When a task is unassigned move it back to the unplanned tasks grid
            remove({ records }) {
                records.forEach(({ event }) => {
                    schedule.eventStore.remove(event);
                    unplannedGrid.store.add(event);
                });
            },
            thisObj : this
        });

    }
}
