/* globals bryntum : true */
import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import SCHEDULER from "@salesforce/resourceUrl/bryntum_scheduler";
import {dependencies, events, resources} from './data';

export default class Scheduler_component extends LightningElement {
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
            this.createScheduler();
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title   : "Error loading Bryntum Scheduler",
                    message : error,
                    variant : "error"
                })
            );
        });
    }

    createScheduler() {
        const scheduler = window.scheduler = new bryntum.scheduler.Scheduler({
            appendTo : this.template.querySelector('.container'),

            eventStyle          : null,
            eventColor          : null,
            useInitialAnimation : 'slide-from-left',
            multiEventSelect    : true,

            features   : {
                stripe          : true,
                dependencies    : {
                    // Makes dependency lines easier to click
                    clickWidth : 5,
                    radius     : 10
                },
                dependencyEdit  : {
                    showLagField : false
                },
                timeRanges      : true,
                eventDrag       : {
                    constrainDragToResource : true
                },
                eventDragSelect : true
            },
            rowHeight  : 50,
            barMargin  : 8,
            columns    : [
                {
                    text  : 'Production line',
                    width : 150,
                    field : 'name'
                }
            ],
            startDate  : new Date(2017, 11, 1),
            endDate    : new Date(2017, 11, 3),
            viewPreset : {
                base           : 'hourAndDay',
                tickWidth      : 25,
                columnLinesFor : 0,
                headers        : [
                    {
                        unit       : 'd',
                        align      : 'center',
                        dateFormat : 'ddd DD MMM'
                    },
                    {
                        unit       : 'h',
                        align      : 'center',
                        dateFormat : 'HH'
                    }
                ]
            },
            eventRenderer({ eventRecord, resourceRecord, renderData }) {
                const bgColor = resourceRecord.bg || '';

                renderData.style = `background-color:${bgColor};border-color:${bgColor};color:${resourceRecord.textColor}`;
                renderData.iconCls.add('b-fa', `b-fa-${resourceRecord.icon}`);

                return bryntum.scheduler.StringHelper.encodeHtml(eventRecord.name);
            },

            listeners : {
                // Prevent showing terminals on milestones
                beforeShowTerminals({ source }) {
                    return !source.isMilestone;
                }
            },

            resourceStore   : new bryntum.scheduler.ResourceStore({
                data : resources
            }),
            eventStore      : new bryntum.scheduler.EventStore({
                data : events
            }),
            dependencyStore : new bryntum.scheduler.DependencyStore({
                data : dependencies
            }),

            tbar : [
                {
                    type : 'label',
                    text : 'Marker'
                },
                {
                    type        : 'buttongroup',
                    toggleGroup : true,
                    items       : [
                        { text : 'Default', pressed : true, markerDef : null },
                        // These buttons have custom marker definitions (SVG path definitions for the arrow heads)
                        { text : 'Thin', markerDef : 'M3,0 L8,3 L3,6' },
                        { text : 'Circle', markerDef : 'M2,3 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0' }
                    ],
                    onToggle({ source }) {
                        if (source.pressed) {
                            scheduler.features.dependencies.markerDef = source.markerDef;
                        }

                        scheduler.element.classList.toggle(`marker-${source.text.toLowerCase()}`, source.pressed);
                    }
                },
                {
                    ref   : 'radius',
                    type  : 'slider',
                    min   : 0,
                    max   : 10,
                    value : 10,
                    text  : 'Radius',
                    onInput({ value }) {
                        scheduler.features.dependencies.radius = value;
                    }
                },
                {
                    ref   : 'clickWidth',
                    type  : 'slider',
                    min   : 1,
                    max   : 10,
                    value : 5,
                    text  : 'Click width',
                    onInput({ value }) {
                        scheduler.features.dependencies.clickWidth = value;

                        bryntum.scheduler.DomHelper.addTemporaryClass(scheduler.element, 'b-highlight-click-area', 1000, scheduler);
                    }
                },
                '->',
                {
                    ref         : 'mouseUpAnywhere',
                    type        : 'checkbox',
                    checked     : true,
                    icon        : 'b-fa-square',
                    pressedIcon : 'b-fa-check-square',
                    text        : 'Mouse up anywhere on target',
                    tooltip     : `Uncheck to require a drop on a target event bar side circle to define the dependency type.
                       If dropped on the event bar, the defaultValue of the DependencyModel <code>type</code> field will be used to
                       determine the target task side.`,
                    onAction({ checked }) {
                        scheduler.features.dependencies.allowDropOnEventBar = checked;
                    }
                }
            ]
        });
    }
}
