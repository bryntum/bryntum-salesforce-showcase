/* globals bryntum : true */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import SCHEDULERPRO from '@salesforce/resourceUrl/bryntum_schedulerpro';
import { data } from './data.js';

export default class Schedulerpro_component extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, SCHEDULERPRO + '/schedulerpro.lwc.module.js'),
            loadStyle(this, SCHEDULERPRO + '/schedulerpro.css'),
            loadStyle(this, SCHEDULERPRO + '/svalbard-light.css'),
            loadStyle(this, SCHEDULERPRO + '/fontawesome/css/fontawesome.css'),
            loadStyle(this, SCHEDULERPRO + '/fontawesome/css/solid.css')
        ])
            .then(() => {
                console.log(`Bryntum Core version: ${bryntum.getVersion('core')}`);
                this.createScheduler();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading Bryntum Scheduler Pro',
                        message: error,
                        variant: 'error'
                    })
                );
            });
    }

    createScheduler() {
        const { ProjectModel, Timeline, SchedulerPro, StringHelper } = bryntum.schedulerpro;

        const appendTo = this.template.querySelector('.container');

        const project = new ProjectModel();

        project.loadCrudManagerData(data);

        const timeline = new Timeline({
            appendTo,
            project,
            minHeight : '11em'
        });

        const scheduler = new SchedulerPro({
            appendTo,
            project,

            flex : 1,

            startDate : new Date(2020, 10, 29),
            endDate   : new Date(2021, 0, 10),
            rowHeight : 50,
            barMargin : 2,
            style     : 'margin-top : 0',

            viewPreset : 'weekAndDay',

            columns : [
                {
                    text  : 'Resource',
                    field : 'name',
                    width : 200
                },
                {
                    text   : 'Type',
                    field  : 'type',
                    hidden : true
                },
                {
                    text   : 'Tasks',
                    field  : 'events.length',
                    width  : 70,
                    align  : 'right',
                    editor : false
                }
            ],

            features : {
                // Configuring task edit feature adding checkbox
                taskEdit : {
                    items : {
                        // Adding it to the general tab
                        generalTab : {
                            items : {
                                // field name
                                showInTimelineField : {
                                    type  : 'checkbox',
                                    name  : 'showInTimeline',
                                    // Text is shown to the right of the checkbox
                                    text  : 'Show in timeline',
                                    // use empty label to align checkbox with other fields
                                    label : '&nbsp;'
                                }
                            }
                        }
                    }
                }
            },

            eventRenderer({ eventRecord : task, renderData }) {
                if (task.showInTimeline) {
                    renderData.eventColor = 'green';
                }
                else {
                    renderData.eventColor = 'blue';
                }

                return StringHelper.encodeHtml(task.name);
            }
        });
    }
}
