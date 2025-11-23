/* globals bryntum : true */
import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import SCHEDULERPRO from "@salesforce/resourceUrl/bryntum_schedulerpro";
import { CALENDARS, EVENTS, RESOURCES, ASSIGNMENTS } from "./data.js";

export default class Schedulerpro_component extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, SCHEDULERPRO + "/schedulerpro.lwc.module.js"),
            loadStyle(this, SCHEDULERPRO + "/schedulerpro.css"),
            loadStyle(this, SCHEDULERPRO + "/svalbard-light.css")
        ])
            .then(() => {
                console.log(`Bryntum Core version: ${bryntum.getVersion('core')}`);
                this.createScheduler();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error loading Bryntum Scheduler Pro",
                        message: error,
                        variant: "error"
                    })
                );
            });
    }

    createScheduler() {
        const container = this.template.querySelector(".container");

        const scheduler = window.schedulerpro = new bryntum.schedulerpro.SchedulerPro({
            project: {
                calendar: "weekends",
                eventsData: EVENTS,
                resourcesData: RESOURCES,
                assignmentsData: ASSIGNMENTS,
                calendarsData: CALENDARS
            },

            startDate: new Date(2020, 10, 29),
            endDate: new Date(2021, 0, 10),
            rowHeight: 50,
            barMargin: 2,

            viewPreset: "weekAndDay",

            columns: [
                {
                    text: "Resource",
                    field: "name",
                    width: 200
                }
            ],

            features: {
                // Configuring task edit feature adding checkbox
                taskEdit: {
                    items: {
                        // Adding it to the general tab
                        generalTab: {
                            items: {
                                // field name
                                showInTimelineField: {
                                    type: "checkbox",
                                    name: "showInTimeline",
                                    // Text is shown to the right of the checkbox
                                    text: "Show in timeline",
                                    // use empty label to align checkbox with other fields
                                    label: "&nbsp;"
                                }
                            }
                        }
                    }
                }
            },

            eventRenderer({ eventRecord: task, renderData }) {
                if (task.showInTimeline) {
                    renderData.eventColor = "red";
                } else {
                    renderData.eventColor = "green";
                }

                return task.name;
            }
        });

        window.timeline = new bryntum.schedulerpro.Timeline({
            appendTo : container,
            project  : scheduler.project
        });

        scheduler.render(container);
    }
}
