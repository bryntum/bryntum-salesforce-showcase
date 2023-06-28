/* globals bryntum: true */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import CALENDAR from "@salesforce/resourceUrl/bryntum_calendar";
import { RESOURCES, EVENTS } from "./data/data";

export default class Calendar_component extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, CALENDAR + "/calendar.lwc.module.js"),
            loadStyle(this, CALENDAR + "/calendar.stockholm.css")
        ])
            .then(() => {
                this.createCalendar();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error loading Bryntum Calendar",
                        message: error,
                        variant: "error"
                    })
                );
            });
    }

    createCalendar() {
        window.calendar = new bryntum.calendar.Calendar({
            appendTo : this.template.querySelector('.container'),

            // Start life looking at this date
            date : new Date(2020, 9, 12),

            eventStore : {
                data : EVENTS
            },
            resourceStore : {
                data : RESOURCES
            },

            // Features named by the properties are included.
            // An object is used to configure the feature.
            features : {
                eventTooltip : {
                    // Configuration options are passed on to the tooltip instance
                    // We want the tooltip's left edge aligned to the right edge of the event if possible.
                    align : 'l-r'
                }
            }
        });
    }
}
