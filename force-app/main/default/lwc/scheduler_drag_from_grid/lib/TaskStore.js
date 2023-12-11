export default (EventStoreClass, Task) => {
    const { DateHelper } = window.bryntum.scheduler;


    return class TaskStore extends EventStoreClass {

        static $name = 'TaskStore';

        static get defaultConfig() {
            return {
                modelClass : Task
            };
        }

        // Override add to reschedule any overlapping events caused by the add
        add(records, silent = false) {
            const me = this;

            if (me.autoRescheduleTasks) {
                // Flag to avoid rescheduling during rescheduling
                me.isRescheduling = true;
                me.beginBatch();
            }

            if (!Array.isArray(records)) {
                records = [records];
            }

            super.add(records, silent);

            if (me.autoRescheduleTasks) {
                me.endBatch();
                me.isRescheduling = false;
            }
        }

        // Auto called when triggering the update event.
        // Reschedule if the update caused the event to overlap any others.
        onUpdate({ record }) {
            if (this.autoRescheduleTasks && !this.isRescheduling)  {
                this.rescheduleOverlappingTasks(record);
            }
        }

        rescheduleOverlappingTasks(eventRecord) {
            if (eventRecord.resource) {
                const
                    futureEvents  = [],
                    earlierEvents = [];

                // Split tasks into future and earlier tasks
                eventRecord.resource.events.forEach(event => {
                    if (event !== eventRecord) {
                        if (event.startDate >= eventRecord.startDate) {
                            futureEvents.push(event);
                        }
                        else {
                            earlierEvents.push(event);
                        }
                    }
                });

                if (futureEvents.length || earlierEvents.length) {
                    futureEvents.sort((a, b) => a.startDate > b.startDate ? 1 : -1);
                    earlierEvents.sort((a, b) => a.startDate > b.startDate ? -1 : 1);

                    futureEvents.forEach((ev, i) => {
                        const prev = futureEvents[i - 1] || eventRecord;

                        ev.startDate = DateHelper.max(prev.endDate, ev.startDate);
                    });

                    // Walk backwards and remove any overlap
                    [eventRecord, ...earlierEvents].forEach((ev, i, all) => {
                        const prev = all[i - 1];

                        if (ev.endDate > Date.now() && ev !== eventRecord && prev) {
                            ev.setEndDate(DateHelper.min(prev.startDate, ev.endDate), true);
                        }
                    });

                    this.isRescheduling = false;
                }
            }
        }
    };
}