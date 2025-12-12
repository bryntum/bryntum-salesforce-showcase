/* globals bryntum: true */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import CALENDAR from '@salesforce/resourceUrl/bryntum_calendar';
import { data } from './data/data';

export default class Calendar_component extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, CALENDAR + '/calendar.lwc.module.js'),
            loadStyle(this, CALENDAR + '/calendar.css'),
            loadStyle(this, CALENDAR + '/svalbard-light.css'),
            loadStyle(this, CALENDAR + '/fontawesome/css/fontawesome.css'),
            loadStyle(this, CALENDAR + '/fontawesome/css/solid.css')
        ])
            .then(() => {
                console.log(`Bryntum Core version: ${bryntum.getVersion('core')}`);
                this.createCalendar();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading Bryntum Calendar',
                        message: error,
                        variant: 'error'
                    })
                );
            });
    }

    createCalendar() {
        const calendar = window.calendar = new bryntum.calendar.Calendar({
            appendTo : this.template.querySelector('.container'),

            // Start life looking at this date
            date : new Date(2020, 9, 12),

            // 'day', 'week', 'month', etc.
            mode : 'week',

            crudManager : {},

            sidebar : {
                items : {
                    datePicker : {
                        // highlight the selected cell's week row
                        highlightSelectedWeek : true
                    },
                    compactHeader : {
                        weight : 100,
                        type   : 'slidetoggle',
                        text   : 'Show compact header',

                        // "up." means resolve in owner will call on the Calendar
                        onChange : 'up.onToggleCompactHeader'
                    }
                }
            },

            // Features named by the properties are included.
            // An object is used to configure the feature.
            features : {
                eventTooltip : {
                    // Configuration options are passed on to the tooltip instance
                    // We want the tooltip's left edge aligned to the right edge of the event if possible.
                    align : 'l-r'
                }
            },

            onToggleCompactHeader({ checked }) {
                this.eachView(v => {
                    if (v.isDayView) {
                        v.compactHeader = checked;
                    }
                });
            }
        });

        calendar.crudManager.loadCrudManagerData(data).then(() => {});
    }
}
