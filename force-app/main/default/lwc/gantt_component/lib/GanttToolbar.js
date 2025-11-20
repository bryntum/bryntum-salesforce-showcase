/* globals bryntum : true */

export default base => {
    class GanttToolbar extends base {
        // Factoryable type name
        static type = 'gantttoolbar';

        static $name = 'GanttToolbar';

        static configurable = {
            items : {
                addTaskButton : {
                    color    : 'b-green',
                    icon     : 'b-fa b-fa-plus',
                    text     : 'Create',
                    tooltip  : 'Create new task',
                    onAction : 'up.onAddTaskClick'
                },
                undoRedo : {
                    type  : 'undoredo',
                    items : {
                        transactionsCombo : null
                    }
                },
                toggleButtons : {
                    type  : 'buttonGroup',
                    items : {
                        expandAllButton : {
                            icon     : 'b-fa b-fa-angle-double-down',
                            tooltip  : 'Expand all',
                            onAction : 'up.onExpandAllClick'
                        },
                        collapseAllButton : {
                            icon     : 'b-fa b-fa-angle-double-up',
                            tooltip  : 'Collapse all',
                            onAction : 'up.onCollapseAllClick'
                        }
                    }
                },
                zoomButtons : {
                    type  : 'buttonGroup',
                    items : {
                        zoomInButton : {
                            icon     : 'b-fa b-fa-search-plus',
                            tooltip  : 'Zoom in',
                            onAction : 'up.onZoomInClick'
                        },
                        zoomOutButton : {
                            icon     : 'b-fa b-fa-search-minus',
                            tooltip  : 'Zoom out',
                            onAction : 'up.onZoomOutClick'
                        },
                        zoomToFitButton : {
                            icon     : 'b-fa b-fa-compress-arrows-alt',
                            tooltip  : 'Zoom to fit',
                            onAction : 'up.onZoomToFitClick'
                        },
                        previousButton : {
                            icon     : 'b-fa b-fa-angle-left',
                            tooltip  : 'Previous time span',
                            onAction : 'up.onShiftPreviousClick'
                        },
                        nextButton : {
                            icon     : 'b-fa b-fa-angle-right',
                            tooltip  : 'Next time span',
                            onAction : 'up.onShiftNextClick'
                        }
                    }
                },
                spacer       : {  type : 'widget', cls : 'b-toolbar-fill' },
                filterByName : {
                    type                 : 'textfield',
                    cls                  : 'filter-by-name',
                    flex                 : '0 0 13.5em',
                    // Label used for material, hidden in other themes
                    label                : 'Find tasks by name',
                    // Placeholder for others
                    placeholder          : 'Find tasks by name',
                    clearable            : true,
                    keyStrokeChangeDelay : 100,
                    triggers             : {
                        filter : {
                            align : 'end',
                            cls   : 'b-fa b-fa-filter'
                        }
                    },
                    onChange : 'up.onFilterChange'
                },
                featuresButton : {
                    type    : 'button',
                    icon    : 'b-fa b-fa-tasks',
                    text    : 'Settings',
                    tooltip : 'Toggle features',
                    menu    : {
                        onItem       : 'up.onFeaturesClick',
                        onBeforeShow : 'up.onFeaturesShow',
                        // "checked" is set to a boolean value to display a checkbox for menu items. No matter if it is true or false.
                        // The real value is set dynamically depending on the "disabled" config of the feature it is bound to.
                        items        : {
                            settings : {
                                text : 'UI settings',
                                icon : 'b-fa-sliders-h',
                                menu : {
                                    cls         : 'settings-menu',
                                    layoutStyle : {
                                        flexDirection : 'column'
                                    },
                                    onBeforeShow : 'up.onSettingsShow',
                                    defaults     : {
                                        type      : 'slider',
                                        showValue : true
                                    },
                                    items : {
                                        rowHeight : {
                                            text    : 'Row height',
                                            min     : 30,
                                            max     : 70,
                                            onInput : 'up.onRowHeightChange'
                                        },
                                        barMargin : {
                                            text    : 'Bar margin',
                                            min     : 0,
                                            max     : 10,
                                            onInput : 'up.onBarMarginChange'
                                        },
                                        duration : {
                                            text    : 'Animation duration',
                                            min     : 0,
                                            max     : 2000,
                                            step    : 100,
                                            onInput : 'up.onAnimationDurationChange'
                                        },
                                        radius : {
                                            text    : 'Dependency radius',
                                            min     : 0,
                                            max     : 10,
                                            onInput : 'up.onDependencyRadiusChange'
                                        }
                                    }
                                }
                            },
                            showWbs : {
                                text    : 'Show WBS code',
                                checked : true,
                                onItem  : 'up.onShowWBSToggle'
                            },
                            drawDeps : {
                                text    : 'Draw dependencies',
                                feature : 'dependencies',
                                checked : false
                            },
                            taskLabels : {
                                text    : 'Task labels',
                                feature : 'labels',
                                checked : false
                            },
                            criticalPaths : {
                                text    : 'Critical paths',
                                feature : 'criticalPaths',
                                tooltip : 'Highlight critical paths',
                                checked : false
                            },
                            projectLines : {
                                text    : 'Project lines',
                                feature : 'projectLines',
                                checked : false
                            },
                            nonWorkingTime : {
                                text    : 'Highlight non-working time',
                                feature : 'nonWorkingTime',
                                checked : false
                            },
                            cellEdit : {
                                text    : 'Enable cell editing',
                                feature : 'cellEdit',
                                checked : false
                            },
                            autoEdit : {
                                text    : 'Auto edit',
                                checked : false,
                                onItem  : 'up.onAutoEditToggle'
                            },
                            columnLines : {
                                text    : 'Show column lines',
                                feature : 'columnLines',
                                checked : true
                            },
                            rowLines : {
                                text    : 'Show row lines',
                                onItem  : 'up.onRowLinesToggle',
                                checked : true
                            },
                            baselines : {
                                text    : 'Show baselines',
                                feature : 'baselines',
                                checked : false
                            },
                            rollups : {
                                text    : 'Show rollups',
                                feature : 'rollups',
                                checked : false
                            },
                            progressLine : {
                                text    : 'Show progress line',
                                feature : 'progressLine',
                                checked : false
                            },
                            parentArea : {
                                text    : 'Show parent area',
                                feature : 'parentArea',
                                checked : false
                            },
                            fillTicks : {
                                text         : 'Stretch tasks to fill ticks',
                                toggleConfig : 'fillTicks',
                                checked      : false
                            },
                            hideSchedule : {
                                text    : 'Hide schedule',
                                cls     : 'b-separator',
                                subGrid : 'normal',
                                checked : false
                            }
                        }
                    }
                }
            }
        };

        construct(...args) {
            super.construct(...args);

            this.gantt = this.parent;

            this.styleNode = document.createElement('style');
            document.head.appendChild(this.styleNode);
        }

        setAnimationDuration(value) {
            const
                me      = this,
                cssText = `.b-animating .b-gantt-task-wrap { transition-duration: ${value / 1000}s !important; }`;

            me.gantt.transitionDuration = value;

            if (me.transitionRule) {
                me.transitionRule.cssText = cssText;
            }
            else {
                me.transitionRule = CSSHelper.insertRule(cssText);
            }
        }

        // region controller methods

        async onAddTaskClick() {
            const
                { gantt } = this,
                added     = gantt.taskStore.rootNode.appendChild({ name : this.L('New task'), duration : 1 });

            // run propagation to calculate new task fields
            await gantt.project.commitAsync();

            // scroll to the added task
            await gantt.scrollRowIntoView(added);

            gantt.features.cellEdit.startEditing({
                record : added,
                field  : 'name'
            });
        }

        onEditTaskClick() {
            const { gantt } = this;

            if (gantt.selectedRecord) {
                gantt.editTask(gantt.selectedRecord);
            }
            else {
                Toast.show(this.L('First select the task you want to edit'));
            }
        }

        onExpandAllClick() {
            this.gantt.expandAll();
        }

        onCollapseAllClick() {
            this.gantt.collapseAll();
        }

        onZoomInClick() {
            this.gantt.zoomIn();
        }

        onZoomOutClick() {
            this.gantt.zoomOut();
        }

        onZoomToFitClick() {
            this.gantt.zoomToFit({
                leftMargin  : 50,
                rightMargin : 50
            });
        }

        onShiftPreviousClick() {
            this.gantt.shiftPrevious();
        }

        onShiftNextClick() {
            this.gantt.shiftNext();
        }

        onAutoEditToggle({ item }) {
            this.gantt.features.cellEdit.autoEdit = item.checked;
        }

        onRowLinesToggle({ item }) {
            this.gantt.rowLines = item.checked;
        }

        onBeforeEditCalendar({ calendarEditor }) {
            calendarEditor.activeDate = this.gantt.project.startDate;
        }

        onProjectCalendarSelected({ record }) {
            this.gantt.project.calendar = record;
        }

        onFilterChange({ value }) {
            if (value === '') {
                this.gantt.taskStore.clearFilters();
            }
            else {
                value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                this.gantt.taskStore.filter({
                    filters : task => task.name && task.name.match(new RegExp(value, 'i')),
                    replace : true
                });
            }
        }

        onFeaturesClick({ source : item }) {
            const { gantt } = this;

            if (item.feature) {
                const feature = gantt.features[item.feature];
                feature.disabled = !feature.disabled;
            }
            else if (item.subGrid) {
                const subGrid = gantt.subGrids[item.subGrid];
                subGrid.collapsed = !subGrid.collapsed;
            }
            else if (item.toggleConfig) {
                gantt[item.toggleConfig] = item.checked;
            }
        }

        onFeaturesShow({ source : menu }) {
            const { gantt } = this;

            menu.items.map(item => {
                const { feature } = item;

                if (feature) {
                    // a feature might be not presented in the gantt
                    // (the code is shared between "advanced" and "php" demos which use a bit different set of features)
                    if (gantt.features[feature]) {
                        item.checked = !gantt.features[feature].disabled;
                    }
                    // hide not existing features
                    else {
                        item.hide();
                    }
                }
                else if (item.subGrid) {
                    item.checked = gantt.subGrids[item.subGrid].collapsed;
                }
            });
        }

        onSettingsShow({ source : menu }) {
            const
                { gantt }                                  = this,
                { rowHeight, barMargin, duration, radius } = menu.widgetMap;

            rowHeight.value = gantt.rowHeight;
            barMargin.value = gantt.barMargin;
            barMargin.max = (gantt.rowHeight / 2) - 5;
            duration.value = gantt.transitionDuration;
            radius.value = gantt.features.dependencies.radius ?? 0;
        }

        onRowHeightChange({ value, source }) {
            this.gantt.rowHeight = value;
            source.owner.widgetMap.barMargin.max = (value / 2) - 5;
        }

        onBarMarginChange({ value }) {
            this.gantt.barMargin = value;
        }

        onAnimationDurationChange({ value }) {
            this.gantt.transitionDuration = value;
            this.styleNode.innerHTML = `.b-animating .b-gantt-task-wrap { transition-duration: ${value / 1000}s !important; }`;
        }

        onDependencyRadiusChange({ value }) {
            this.gantt.features.dependencies.radius = value;
        }

        onCriticalPathsClick({ source }) {
            this.gantt.features.criticalPaths.disabled = !source.pressed;
        }

        onShowWBSToggle({ item }) {
            this.gantt.columns.get('name').showWbs = item.checked;
        }

    // endregion
    }

    GanttToolbar.initClass();

    return GanttToolbar;
};
