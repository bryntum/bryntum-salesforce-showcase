export default (base) => {
  const { StringHelper } = window.bryntum.schedulerpro;

  return class UnplnnedGrid extends base {
    static get configurable() {
      return {
        selectionMode: {
          cell: false
        },
        features: {
          stripe: true,
          sort: "name",
          group: {
            field: "requiredRole",
            renderer({ groupRowFor, column }) {
              if (column.parentIndex === 0) {
                return `Tasks for ${groupRowFor}`;
              }
              return "";
            }
          }
        },

        columns: [
          {
            type: "template",
            text: "Appointment",
            flex: 1,
            cellCls: "unscheduledNameCell",
            template: ({ record: appointment }) => `
                <i class="b-fa b-fa-${appointment.iconCls}"></i>
                <div class="name-container">
                    <span>${StringHelper.encodeHtml(appointment.name)}</span>
                    <span class="patient-name">Patient: ${
                      appointment.patient
                    }</span>
                </div>
            `
          },
          {
            text: "Required role",
            field: "requiredRole"
          },
          {
            icon: "b-icon b-fa-clock",
            width: 80,
            align: "center",
            editor: "duration",
            field: "fullDuration",
            renderer: ({ record }) =>
              `${record.duration} ${record.durationUnit}`
          }
        ],

        tbar: [
          {
            type: "widget",
            tag: "strong",
            html: "Unplanned appointments",
            flex: 1
          },
          {
            icon: "b-fa b-fa-angle-double-down",
            cls: "b-transparent",
            tooltip: "Expand all groups",
            onAction: "up.expandAll"
          },
          {
            icon: "b-fa b-fa-angle-double-up",
            cls: "b-transparent",
            tooltip: "Collapse all groups",
            onAction: "up.collapseAll"
          }
        ],

        rowHeight: 65,

        disableGridRowModelWarning: true
      };
    }

    static get $name() {
      return "UnplannedGrid";
    }

    set project(project) {
      // Create a chained version of the event store as our store. It will be filtered to only display events that
      // lack assignments
      this.store = project.eventStore.chain(
        (eventRecord) => !eventRecord.assignments.length
      );

      // When assignments change, update our chained store to reflect the changes
      project.assignmentStore.on({
        change() {
          this.store.fillFromMaster();
        },
        thisObj: this
      });
    }
  };
};
