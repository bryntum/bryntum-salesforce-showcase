export default (SchedulerProClass) => {
  const { DateHelper, Toast } = window.bryntum.schedulerpro;

  return class Schedule extends SchedulerProClass {
    // Customized scheduler displaying hospital appointments
    static get $name() {
      return "Schedule";
    }

    static get configurable() {
      return {
        resourceImagePath: "../_shared/images/users/",
        features: {
          stripe: true,
          columnLines: true,
          filterBar: {
            compactMode: true
          },
          calendarHighlight: {
            calendar: "resource",
            // This method is provided to determine which resources are available for one or more eventRecords,
            // in order to highlight the right availability intervals
            collectAvailableResources({ scheduler, eventRecords }) {
              const draggedAppointment = eventRecords[0];
              return scheduler.resourceStore.query(
                (resourceRecord) =>
                  resourceRecord.role === draggedAppointment.requiredRole ||
                  !draggedAppointment.requiredRole
              );
            }
          },
          // Configure event menu items with correct phrases (could also be done through localization)
          eventMenu: {
            items: {
              deleteEvent: {
                text: "Delete appointment"
              },
              unassignEvent: {
                text: "Unschedule appointment"
              }
            }
          },
          eventDrag: {
            // Validation method, called as you drag events around in the schedule
            validatorFn({ eventRecords, newResource, startDate, endDate }) {
              const task = eventRecords[0],
                { calendar } = newResource,
                valid =
                  newResource.role === task.requiredRole &&
                  (!calendar ||
                    calendar.isWorkingTime(startDate, endDate, true)),
                message = valid ? "" : "No available slot";

              return {
                valid,
                message:
                  (valid
                    ? ""
                    : '<i class="b-icon b-fa-exclamation-triangle"></i>') +
                  message
              };
            }
          },
          taskEdit: {
            editorConfig: {
              title: "Appointment"
            },

            // Customize its contents inside the General tab
            items: {
              generalTab: {
                items: {
                  // Add a patient field
                  orderField: {
                    type: "text",
                    name: "patient",
                    label: "Patient",
                    // Place after name field
                    weight: 150
                  }
                }
              }
            }
          }
        },

        rowHeight: 80,
        barMargin: 10,
        eventStyle: "border",
        eventColor: "indigo",
        allowOverlap: false,
        useInitialAnimation: false,
        // Define the columns to use
        columns: [
          {
            type: "resourceInfo",
            text: "Doctor",
            width: 200,
            showEventCount: false,
            showMeta: ({ role, roleIconCls }) =>
              `<i class="${roleIconCls}"></i>${role}`,
            filterable: {
              filterField: {
                triggers: {
                  search: {
                    cls: "b-icon b-fa-filter"
                  }
                },
                placeholder: "Filter staff"
              }
            }
          },
          {
            text: "Hours",
            editor: false,
            filterable: false,
            sortable: false,
            align: "right",
            renderer: ({ record, grid: scheduler }) => {
              const { calendar } = record;

              if (calendar?.isCalendarModel) {
                const ranges = calendar.getWorkingTimeRanges(
                  scheduler.startDate,
                  scheduler.endDate
                );

                if (ranges.length > 0) {
                  const range = ranges[0];

                  return `${DateHelper.format(
                    range.startDate,
                    "K"
                  )} - ${DateHelper.format(range.endDate, "K")}`;
                }
              }

              return "";
            }
          }
        ],

        // Custom view preset with header configuration
        viewPreset: {
          base: "hourAndDay",
          columnLinesFor: 1,
          headers: [
            {
              unit: "d",
              align: "center",
              dateFormat: "dddd"
            },
            {
              unit: "h",
              align: "center",
              dateFormat: "HH"
            }
          ]
        },

        tbar: [
          {
            text: "Save",
            width: 100,
            cls: "b-raised b-blue",
            ref: "saveButton",
            disabled: true,
            onAction: "up.onSave"
          },
          {
            type: "combo",
            ref: "preset",
            editable: false,
            label: "Show",
            value: 1,
            valueField: "value",
            displayField: "name",
            items: [
              {
                name: "1 day",
                value: 1,
                preset: {
                  base: "hourAndDay",
                  tickWidth: 45
                }
              },
              {
                name: "3 days",
                value: 3,
                preset: {
                  base: "dayAndWeek"
                }
              },
              {
                name: "1 week",
                value: 7,
                preset: {
                  base: "dayAndWeek"
                }
              }
            ],
            onSelect: "up.onRangeSelect"
          },
          {
            type: "buttongroup",
            items: [
              {
                icon: "b-icon b-fa-chevron-left",
                cls: "b-transparent",
                onAction: "up.onPreviousDayClick"
              },
              {
                type: "button",
                text: "Today",
                cls: "b-transparent",
                onAction: "up.onTodayClick"
              },
              {
                icon: "b-icon b-fa-chevron-right",
                cls: "b-transparent",
                onAction: "up.onNextDayClick"
              }
            ]
          },
          {
            icon: "b-fa b-fa-columns",
            tooltip: "Toggle layout",
            cls: "b-transparent",
            toggleable: true,
            onAction: "up.onLayoutToggle",
            style: "margin-left: auto"
          }
        ],

        onLayoutToggle() {
          this.element.parentElement.classList.toggle("b-side-by-side");
        },

        onSave() {
          Toast.show("TODO: Save data (see onSave() event for SchedulerPro)");
          // console.log('Changes:', this.project.changes);
        },

        onRangeSelect({ record }) {
          const me = this,
            value = record.value,
            startDate = DateHelper.add(
              DateHelper.clearTime(me.startDate),
              me.startHour,
              "h"
            ),
            endDate = DateHelper.add(startDate, value - 1, "d");

          endDate.setHours(me.endHour);

          me.viewPreset = record.preset;
          me.setTimeSpan(startDate, endDate);
          // reset scroll
          me.scrollLeft = 0;
        },

        onNextDayClick() {
          this.shiftNext();
        },

        onTodayClick() {
          const startDate = DateHelper.clearTime(new Date());

          this.setTimeSpan(
            DateHelper.add(startDate, this.startHour, "h"),
            DateHelper.add(startDate, this.endHour, "h")
          );
        },

        onPreviousDayClick() {
          this.shiftPrevious();
        }
      };
    }

    // Return a DOM config object for what to show inside the event bar (you can return an HTML string too)
    eventRenderer({ eventRecord }) {
      return [
        {
          children: [
            {
              class: "b-event-name",
              text: eventRecord.name
            },
            {
              class: "b-patient",
              html: window.bryntum.schedulerpro.StringHelper
                .xss`<div>Patient: ${eventRecord.patient || ""}</div>`
            }
          ]
        }
      ];
    }
  };
};
