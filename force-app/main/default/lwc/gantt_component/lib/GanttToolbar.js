/* globals bryntum : true */
export default function ganttToolbarInitializer() {
    class GanttToolbar extends bryntum.gantt.Toolbar {
        // Factoryable type name
        static type = 'gantttoolbar';

        static $name = 'GanttToolbar';

        static configurable = {
            items : {
                views : {
                    type        : 'buttongroup',
                    toggleGroup : true,
                    rendition   : 'padded',
                    items       : {
                        ganttButton : {
                            icon       : 'fa fa-chart-gantt',
                            text       : 'Gantt',
                            tooltip    : 'Gantt view',
                            pressed    : true,
                            toggleable : true
                        },
                        resourceViewButton : {
                            icon     : 'fa fa-users',
                            text     : 'Resources',
                            tooltip  : 'Resource grid',
                            onAction : 'up.onResourceViewButtonClick'
                        }
                    }
                },
                addTaskButton : {
                    color    : 'b-green',
                    icon     : 'fa fa-plus',
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
                            icon     : 'fa fa-angle-double-down',
                            tooltip  : 'Expand all',
                            onAction : 'up.onExpandAllClick'
                        },
                        collapseAllButton : {
                            icon     : 'fa fa-angle-double-up',
                            tooltip  : 'Collapse all',
                            onAction : 'up.onCollapseAllClick'
                        }
                    }
                },
                zoomButtons : {
                    type  : 'buttonGroup',
                    items : {
                        zoomInButton : {
                            icon     : 'fa fa-search-plus',
                            tooltip  : 'Zoom in',
                            onAction : 'up.onZoomInClick'
                        },
                        zoomOutButton : {
                            icon     : 'fa fa-search-minus',
                            tooltip  : 'Zoom out',
                            onAction : 'up.onZoomOutClick'
                        },
                        zoomToFitButton : {
                            icon     : 'fa fa-compress-arrows-alt',
                            tooltip  : 'Zoom to fit',
                            onAction : 'up.onZoomToFitClick'
                        },
                        previousButton : {
                            icon     : 'fa fa-angle-left',
                            tooltip  : 'Previous time span',
                            onAction : 'up.onShiftPreviousClick'
                        },
                        nextButton : {
                            icon     : 'fa fa-angle-right',
                            tooltip  : 'Next time span',
                            onAction : 'up.onShiftNextClick'
                        }
                    }
                },
                projectEditorButton : {
                    type     : 'button',
                    text     : 'Edit project',
                    icon     : 'fa fa-edit',
                    onAction : 'up.onProjectEditorButtonClick'
                },
                spacer       : {  type : 'widget', cls : 'b-toolbar-fill' },
                filterByName : {
                    type                 : 'textfield',
                    cls                  : 'filter-by-name',
                    flex                 : '0 0 14em',
                    placeholder          : 'Find tasks by name',
                    clearable            : true,
                    keyStrokeChangeDelay : 100,
                    triggers             : {
                        filter : {
                            align : 'end',
                            cls   : 'fa fa-filter'
                        }
                    },
                    onChange : 'up.onFilterChange'
                },
                featuresButton : {
                    type    : 'button',
                    icon    : 'fa fa-tasks',
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
                                icon : 'fa fa-sliders-h',
                                menu : {
                                    cls          : 'settings-menu',
                                    layout       : 'vbox',
                                    onBeforeShow : 'up.onSettingsShow',
                                    defaults     : {
                                        type       : 'slider',
                                        showValue  : true,
                                        labelWidth : '10em',
                                        width      : '25em'
                                    },
                                    items : {
                                        rowHeight : {
                                            text    : 'Row height',
                                            unit    : 'px',
                                            min     : 30,
                                            max     : 70,
                                            onInput : 'up.onRowHeightChange'
                                        },
                                        barMargin : {
                                            text    : 'Bar margin',
                                            unit    : 'px',
                                            min     : 0,
                                            max     : 10,
                                            onInput : 'up.onBarMarginChange'
                                        },
                                        radius : {
                                            text    : 'Dependency radius',
                                            unit    : 'px',
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

        get gantt() {
            return this._gantt || (this._gantt = this.owner);
        }

        // region controller methods

        onResourceViewButtonClick() {
            this.widgetMap.ganttButton.pressed = true;
            this.gantt.hidden = true;
            this.resourceGrid.hidden = false;
        }

        async onAddTaskClick() {
            const
                { gantt } = this,
                added     = gantt.taskStore.rootNode.appendChild({
                    name     : this.L('New task'),
                    duration : 1
                });

            // run propagation to calculate new task fields
            await gantt.project.commitAsync();

            // scroll to the added task
            await gantt.scrollRowIntoView(added);

            gantt.features.cellEdit.startEditing({
                record : added,
                field  : 'name'
            });
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

        onProjectEditorButtonClick() {
            this.gantt.editProject();
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
                { gantt } = this,
                {
                    rowHeight,
                    barMargin,
                    radius
                }         = menu.widgetMap;

            rowHeight.value = gantt.rowHeight;
            barMargin.value = gantt.barMargin;
            barMargin.max = (gantt.rowHeight / 2) - 5;
            radius.value = gantt.features.dependencies.radius ?? 0;
        }

        onRowHeightChange({
            value,
            source
        }) {
            this.gantt.rowHeight = value;
            source.owner.widgetMap.barMargin.max = (value / 2) - 5;
        }

        onBarMarginChange({ value }) {
            this.gantt.barMargin = value;
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
