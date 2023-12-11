export default (base) => {
    const { DateHelper, DomHelper, Tooltip } = window.bryntum.scheduler;

    return class Drag extends base {
        static get configurable() {
            return {
                callOnFunctions      : true,
                // Don't drag the actual row element, clone it
                cloneTarget          : true,
                // We size the cloned element manually
                autoSizeClonedTarget : false,
                // Only allow drops on the schedule area
                dropTargetSelector   : '.b-timeline-subgrid',
                // Only allow drag of row elements inside on the unplanned grid
                targetSelector       : '.b-grid-row:not(.b-group-row)'
            };
        }
    
        afterConstruct() {
            // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
            this.scrollManager = this.schedule.scrollManager;
        }
    
        createProxy(element) {
            const
                proxy        = document.createElement('div'),
                { schedule } = this,
                task         = this.grid.getRecordFromElement(element),
                durationInPx = schedule.timeAxisViewModel.getDistanceForDuration(task.durationMS);
    
            // Fake an event bar
            proxy.classList.add('b-sch-event-wrap', 'b-sch-event', 'b-unassigned-class', `b-sch-${schedule.mode}`);
            proxy.innerHTML = `<div class="b-sch-event b-has-content b-sch-event-withicon">
                <div class="b-sch-event-content">
                    <i class="${task.iconCls}"></i> ${task.name}
                </div>
            </div>`;
    
            if (schedule.isHorizontal) {
                proxy.style.height = `${schedule.rowHeight - (2 * schedule.resourceMargin)}px`;
                proxy.style.width  = `${durationInPx}px`;
            }
            else {
                proxy.style.height = `${durationInPx}px`;
                proxy.style.width  = `${schedule.resourceColumnWidth}px`;
            }
    
            return proxy;
        }
    
        onDragStart({ context }) {
            const
                me                          = this,
                { schedule }                = me,
                { eventTooltip, eventDrag } = schedule.features;
    
            // save a reference to the task so we can access it later
            context.task = me.grid.getRecordFromElement(context.grabbed);
    
            // Prevent tooltips from showing while dragging
            eventTooltip.disabled = true;
    
            schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);
    
            if (eventDrag.showTooltip && !me.tip) {
                me.tip = new Tooltip({
                    align      : 'b-t',
                    forElement : context.element,
                    rootElement  : window.appendTo,
                    cls        : 'b-popup b-sch-event-tooltip'
                });
            }
        }
    
        onDrag({ event, context }) {
            const
                me           = this,
                { schedule } = me,
                { task }     = context,
                coordinate   = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
                startDate    = schedule.getDateFromCoordinate(coordinate, 'round', false, true),
                endDate      = startDate && DateHelper.add(startDate, task.duration, task.durationUnit),
                // Coordinates required when used in vertical mode, since it does not use actual columns
                resource     = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]);
    
            // Don't allow drops anywhere, only allow drops if the drop is on the timeaxis and on top of a Resource
            context.valid = Boolean(startDate && resource) &&
                (schedule.allowOverlap || schedule.isDateRangeAvailable(startDate, endDate, null, resource));
    
            // Save reference to resource so we can use it in onTaskDrop
            context.resource  = resource;
            context.startDate = startDate;
    
            if (me.tip && context.valid) {
                const
                    dateFormat         = schedule.displayDateFormat,
                    formattedStartDate = DateHelper.format(startDate, dateFormat),
                    formattedEndDate   = DateHelper.format(endDate, dateFormat);
    
                me.tip.html = `
                    <div class="b-sch-event-title">${task.name}</div>
                    <div class="b-sch-tooltip-startdate">Starts: ${formattedStartDate}</div>
                    <div class="b-sch-tooltip-enddate">Ends: ${formattedEndDate}</div>
                `;
                me.tip.showBy(context.element);
            }
            else {
                me.tip?.hide();
            }
        }
    
        // Drop callback after a mouse up, take action and transfer the unplanned task to the real EventStore (if it's valid)
        onDrop({ context, event }) {
            const
                me                                         = this,
                { schedule }                               = me,
                { task, target, resource, valid, element, startDate } = context;
    
            me.tip?.hide();
    
            schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);
    
            // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
            if (valid && target && startDate) {
                const
                    coordinate        = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](element),
                    // Try resolving event record from target element, to determine if drop was on another event
                    targetEventRecord = schedule.resolveEventRecord(target);
    
                // Remove from grid first so that the data change
                // below does not fire events into the grid.
                me.grid.store.remove(task);
    
                task.startDate = startDate;
    
                task.assign(resource);
                schedule.eventStore.add(task);
    
                // Dropped on a scheduled event, display toast
                if (targetEventRecord) {
                    Toast.show(`Dropped on ${targetEventRecord.name}`);
                }
            }
    
            if (resource) {
                resource.cls = '';
            }
    
            schedule.features.eventTooltip.disabled = false;
        }
    
        set schedule(schedule) {
            this._schedule = schedule;
    
            // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
            this.scrollManager = schedule.scrollManager;
        }
    
        get schedule() {
            return this._schedule;
        }
    
        onDragAbort() {
            this.tip?.hide();
        }
    };
};
