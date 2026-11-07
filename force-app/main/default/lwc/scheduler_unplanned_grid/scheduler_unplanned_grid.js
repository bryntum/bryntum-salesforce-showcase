/* globals bryntum : true */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import getLicenseKey from '@salesforce/apex/BryntumLicense.getKey';
import SCHEDULER from '@salesforce/resourceUrl/bryntum_scheduler';
import ScheduleMixin from './lib/Schedule';
import UnplannedGridMixin from './lib/UnplannedGrid';
import AppointmentMixin from './lib/Appointment';
import DoctorMixin from './lib/Doctor';
import DragMixin from './lib/Drag';
import { data } from './data';

export default class Scheduler_unplanned_grid extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            // Resolves to null when the org has no key, the component then runs in trial mode
            getLicenseKey().catch(() => null),
            loadScript(this, SCHEDULER + '/scheduler.lwc.min.js'),
            loadStyle(this, SCHEDULER + '/scheduler.css'),
            loadStyle(this, SCHEDULER + '/svalbard.css'),
            loadStyle(this, SCHEDULER + '/fontawesome/css/fontawesome.css'),
            loadStyle(this, SCHEDULER + '/fontawesome/css/solid.css')
        ])
            .then(([licenseKey]) => {
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
                console.log(
                    `Bryntum Core version: ${bryntum.getVersion('core')}`
                );
                this.createScheduler();
            })
            .catch((error) => {
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
        const {
            Grid,
            Scheduler,
            EventModel,
            ResourceModel,
            Splitter,
            DragHelper
        } = bryntum.scheduler;

        const appendTo = this.template.querySelector('.bryntum-root-element');

        const Schedule = ScheduleMixin(Scheduler);
        const UnplannedGrid = UnplannedGridMixin(Grid);
        const Appointment = AppointmentMixin(EventModel);
        const Doctor = DoctorMixin(ResourceModel);
        const Drag = DragMixin(DragHelper);

        const schedule = (window.schedule = new Schedule({
            ref: 'schedule',
            appendTo: appendTo,
            startDate: new Date(2022, 2, 1, 7),
            endDate: new Date(2022, 2, 1, 19),
            flex: 1,

            // Some variables used in this demo
            startHour: 7,
            endHour: 20,

            project: {
                autoLoad: true,
                eventModelClass: Appointment,
                resourceModelClass: Doctor,
                resourceStore: {
                    sorters: [{ field: 'name', ascending: true }]
                },
                eventStore: {
                    // Unassigned events should remain in store
                    removeUnassignedEvent: false
                },

                listeners: {
                    change() {
                        schedule.widgetMap.saveButton.disabled =
                            !this.eventStore.changes;
                    }
                }
            },
            listeners: {
                selectionChange() {
                    const { selectedRecords } = this,
                        { calendarHighlight } = schedule.features;

                    if (selectedRecords.length > 0) {
                        calendarHighlight.highlightResourceCalendars(
                            selectedRecords
                        );
                    } else {
                        calendarHighlight.unhighlightCalendars();
                    }
                }
            }
        }));

        window.splitter = new Splitter({
            appendTo
        });

        const unplannedGrid = (window.unplannedGrid = new UnplannedGrid({
            ref: 'unplanned',
            flex: '0 1 400px',
            appendTo: appendTo,
            project: schedule.project,
            listeners: {
                selectionChange() {
                    const { selectedRecords } = this,
                        { calendarHighlight } = schedule.features,
                        requiredRoles = {};

                    selectedRecords.forEach((task) => {
                        requiredRoles[task.requiredRole] = 1;
                    });

                    if (Object.keys(requiredRoles).length === 1) {
                        const appointment = selectedRecords[0],
                            availableResources = schedule.resourceStore.query(
                                (resourceRecord) =>
                                    resourceRecord.role ===
                                        appointment.requiredRole ||
                                    !appointment.requiredRole
                            );

                        calendarHighlight.highlightResourceCalendars(
                            availableResources
                        );
                    } else {
                        calendarHighlight.unhighlightCalendars();
                    }
                }
            }
        }));

        // Handles dragging
        window.drag = new Drag({
            grid: unplannedGrid,
            schedule,
            constrain: false,
            outerElement: unplannedGrid.element,
            dragWithin: appendTo
        });

        schedule.project.loadCrudManagerData(data);
    }
}
