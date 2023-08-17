export default (base) => {
  const { DateHelper, StringHelper, DomHelper } = window.bryntum.schedulerpro;

  return class Drag extends base {
    static get defaultConfig() {
      return {
        callOnFunctions: true,
        autoSizeClonedTarget: false,
        unifiedProxy: true,

        // Prevent removing proxy on drop, we adopt it for usage in the Schedule
        removeProxyAfterDrop: false,

        // Don't drag the actual row element, clone it
        cloneTarget: true,
        // Only allow drops on the schedule area
        dropTargetSelector: ".b-timeline-subgrid",
        // Only allow drag of row elements inside on the unplanned grid
        targetSelector: ".b-grid-row:not(.b-group-row)"
      };
    }

    afterConstruct() {
      // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
      this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(grabbedElement) {
      const { context, schedule, grid } = this,
        draggedAppointment = grid.getRecordFromElement(grabbedElement),
        durationInPixels = schedule.timeAxisViewModel.getDistanceForDuration(
          draggedAppointment.durationMS
        ),
        proxy = document.createElement("div");

      proxy.style.cssText = "";

      proxy.style.width = `${durationInPixels}px`;
      proxy.style.height =
        schedule.rowHeight - 2 * schedule.resourceMargin + "px";

      // Fake an event bar
      proxy.classList.add(
        "b-sch-event-wrap",
        "b-sch-style-border",
        "b-unassigned-class",
        "b-sch-horizontal"
      );
      proxy.childNodes.forEach((el) => el.remove());

      const innerHTML = StringHelper.xss`
            <div class="b-sch-event b-has-content b-sch-event-withicon">
                <div class="b-sch-event-content">
                    <i class="b-icon b-${draggedAppointment.iconCls}"></i>
                    <div>
                        <div>${draggedAppointment.name}</div>
                        <div class="patient-name">Patient: ${
                          draggedAppointment.patient || ""
                        }</div>
                    </div>
                </div>
            </div>
        `;

      const parser = new DOMParser();
      const node = parser.parseFromString(innerHTML, 'text/html').body.firstChild;

      proxy.appendChild(node);

      let totalDuration = 0;

      grid.selectedRecords.forEach(
        (appointment) => (totalDuration += appointment.duration)
      );

      context.totalDuration = totalDuration;

      return proxy;
    }

    onDragStart({ context }) {
      const me = this,
        { schedule, grid } = me,
        { selectedRecords, store } = grid,
        appointment = grid.getRecordFromElement(context.grabbed);

      // save a reference to the appointments being dragged so we can access them later
      context.appointments = selectedRecords.slice();
      context.relatedElements = selectedRecords
        .sort((r1, r2) => store.indexOf(r1) - store.indexOf(r2))
        .map(
          (rec) => rec !== appointment && grid.rowManager.getRowFor(rec).element
        )
        .filter((el) => el);

      schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

      // Prevent tooltips from showing while dragging
      schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ context }) {
      const { schedule } = this,
        { appointments, totalDuration } = context,
        requiredRole = appointments[0].requiredRole,
        newStartDate = schedule.getDateFromCoordinate(
          context.newX,
          "round",
          false
        ),
        lastAppointmentEndDate =
          newStartDate &&
          DateHelper.add(
            newStartDate,
            totalDuration,
            appointments[0].durationUnit
          ),
        doctor =
          context.target && schedule.resolveResourceRecord(context.target),
        calendar = doctor?.calendar;

      // Only allow drops on the timeaxis
      context.valid =
        newStartDate &&
        // Require a resource with matching role
        (!requiredRole || doctor?.role === requiredRole) &&
        // Ensure we don't break allowOverlap config
        (schedule.allowOverlap ||
          (schedule.isDateRangeAvailable(
            newStartDate,
            lastAppointmentEndDate,
            null,
            doctor
          ) &&
            // Respect resource's working time
            (!calendar ||
              calendar.isWorkingTime(
                newStartDate,
                lastAppointmentEndDate,
                true
              ))));

      // Save reference to the doctor so we can use it in onAppointmentDrop
      context.doctor = doctor;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned appointment to the real EventStore (if it's valid)
    async onDrop({ context }) {
      const me = this,
        { schedule } = me;

      // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
      if (context.valid) {
        const { appointments, element, relatedElements = [], doctor } = context,
          coordinate = DomHelper.getTranslateX(element),
          dropDate = schedule.getDateFromCoordinate(coordinate, "round", false),
          eventBarEls = [element, ...relatedElements];

        for (let i = 0; i < appointments.length; i++) {
          // We hand over the data + existing element to the Scheduler so it do the scheduling
          // await is used so that we have a reliable end date in the case of multiple event drag
          // eslint-disable-next-line no-await-in-loop
          await schedule.scheduleEvent({
            eventRecord: appointments[i],
            // When dragging multiple appointments, add them back to back + assign to resource
            startDate: i === 0 ? dropDate : appointments[i - 1].endDate,
            // Assign to the doctor (resource) it was dropped on
            resourceRecord: doctor,
            element: eventBarEls[i]
          });
        }
      }

      schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
      schedule.features.eventTooltip.disabled = false;
    }
  };
};
