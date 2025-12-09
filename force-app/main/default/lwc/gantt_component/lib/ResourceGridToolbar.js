/* globals bryntum : true */
export default function resourceGridToolbarInitializer() {
    class ResourceGridToolbar extends bryntum.gantt.Toolbar {
        // Factoryable type name
        static type = 'resourcegridtoolbar';

        static $name = 'ResourceGridToolbar';

        static configurable = {
            items : {
                views : {
                    type        : 'buttongroup',
                    toggleGroup : true,
                    rendition   : 'padded',
                    items       : {
                        viewButton         : {
                            icon     : 'fa fa-chart-gantt',
                            text     : 'Gantt',
                            tooltip  : 'Gantt view',
                            onAction : 'up.onGanttButtonClick'
                        },
                        resourceViewButton : {
                            icon    : 'fa fa-users',
                            text    : 'Resources',
                            tooltip : 'Resource grid',
                            pressed : true
                        }
                    }
                },

                addResourceButton   : {
                    color    : 'b-green',
                    icon     : 'fa fa-plus',
                    text     : 'Create',
                    tooltip  : 'Create new resource',
                    onAction : 'up.onAddResourceClick'
                },
                undoRedo            : {
                    type  : 'undoredo',
                    items : {
                        transactionsCombo : null
                    }
                },
                label               : {
                    type : 'label',
                    text : 'Display resource types'
                },
                filterByTypeButtons : {
                    type       : 'buttonGroup',
                    onChange   : 'up.onFilterByTypeChange',
                    toggleable : true,
                    rendition  : 'padded',
                    items      : {
                        workResources     : {
                            icon : 'fa fa-users',
                            // use ResourceType.work locale for the button
                            text    : 'L{ResourceType.work}',
                            pressed : true,
                            value   : 'work'
                        },
                        materialResources : {
                            icon : 'fa fa-cubes-stacked',
                            // use ResourceType.material locale for the button
                            text    : 'L{ResourceType.material}',
                            pressed : true,
                            value   : 'material'
                        },
                        costResources     : {
                            icon : 'fa fa-sack-dollar',
                            // use ResourceType.cost locale for the button
                            text    : 'L{ResourceType.cost}',
                            pressed : true,
                            value   : 'cost'
                        }
                    }
                },
                // Dummy text field to give toolbar same height as in Gantt
                dummyTextField : {
                    type  : 'textfield',
                    cls   : 'b-hide-visibility',
                    label : 'Dummy'
                }
            }
        };

        get resourceGrid() {
            return this._resourceGrid || (this._resourceGrid = this.owner);
        }

        onFilterByTypeChange({ value }) {
            this.resourceGrid.store.addFilter({
                id       : 'resource-type-filter',
                property : 'type',
                value    : value.split(','),
                operator : 'isIncludedIn'
            });
        }

        onGanttButtonClick() {
            this.widgetMap.resourceViewButton.pressed = true;
            this.resourceGrid.hidden = true;
            this.gantt.hidden = false;
        }

        async onAddResourceClick() {
            const
                { resourceGrid } = this,
                [added]          = resourceGrid.store.add({ name : 'New resource' });

            // run propagation to calculate new task fields
            await resourceGrid.project.commitAsync();

            // scroll to the added task
            await resourceGrid.scrollRowIntoView(added);

            resourceGrid.features.cellEdit.startEditing({
                record : added,
                field  : 'name'
            });
        }
    }

    // Register this widget type with its Factory
    ResourceGridToolbar.initClass();

    return ResourceGridToolbar
}