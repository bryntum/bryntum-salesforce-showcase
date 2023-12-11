export default (SchedulerProClass) => {

  return class Schedule extends SchedulerProClass {
    // Customized scheduler displaying hospital appointments
    static get $name() {
      return "Schedule";
    }

    static get configurable() {
        return {
            // Custom property for this demo, set to true to reschedule any conflicting tasks automatically
            autoRescheduleTasks : false,
            eventStyle          : 'colored',
            subGridConfigs      : {
                locked : {
                    width : 300
                },
                normal : {
                    flex : 1
                }
            },
            features : {
                stripe     : true,
                timeRanges : true,
                eventMenu  : {
                    items : {
                        // Custom item with inline handler
                        unassign : {
                            text   : 'Unassign',
                            icon   : 'b-fa b-fa-user-times',
                            weight : 200,
                            onItem : ({ eventRecord }) => eventRecord.unassign()
                        }
                    }
                },
                eventEdit : {
                    items : {
                        // Custom field for picking icon
                        iconCls : {
                            type   : 'iconcombo',
                            // Name should match a record field, to read and write value from that field
                            name   : 'iconCls',
                            label  : 'Icon',
                            weight : 200
                        }
                    }
                }
            },

            rowHeight  : 50,
            barMargin  : 4,
            eventColor : 'indigo',
            //allowOverlap : false,

            columns : [
                {
                    type           : 'resourceInfo',
                    text           : 'Name',
                    flex           : 1,
                    showEventCount : false,
                    showRole       : true
                },
                {
                    text     : 'Nbr tasks',
                    editor   : false,
                    width    : 100,
                    renderer : data => `${data.record.events.length || ''}`,
                    align    : 'center',
                    sortable : (a, b) => a.events.length < b.events.length ? -1 : 1
                }
            ],

            // Custom view preset with header configuration
            viewPreset : {
                base           : 'hourAndDay',
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

            // Only used in vertical mode
            resourceColumns : {
                columnWidth : 120
            },

            // Do not remove event when unassigning, we want to add it to grid instead
            removeUnassignedEvent : false,

            resourceImagePath : '../_shared/images/users/'
        };
    }

    updateAutoRescheduleTasks(autoRescheduleTasks) {
        this.eventStore.autoRescheduleTasks = autoRescheduleTasks;
    }
  };
};
