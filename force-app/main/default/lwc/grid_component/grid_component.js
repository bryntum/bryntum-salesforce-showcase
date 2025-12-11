/* globals bryntum : true */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import GRID from '@salesforce/resourceUrl/bryntum_grid';

export default class Grid_component extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, GRID + '/grid.lwc.module.js'),
            loadStyle(this, GRID + '/grid.css'),
            loadStyle(this, GRID + '/svalbard-light.css'),
            loadStyle(this, GRID + '/fontawesome/css/fontawesome.css'),
            loadStyle(this, GRID + '/fontawesome/css/solid.css')
        ]).then(() => {
            console.log(`Bryntum Core version: ${bryntum.getVersion('core')}`);
            this.createGrid();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Bryntum Grid',
                    message: error,
                    variant: 'error'
                })
            );
        });
    }

    createGrid() {
        const {
            Column,
            ColumnStore,
            DataGenerator,
            Grid,
            StringHelper,
            Toast
        } = bryntum.grid;
        //region Register custom column

        // Extend Column to create your own custom column class
        class StatusColumn extends Column {
            // Define the type for this column, used in your columns config to add this column
            static type = 'status';

            // Override default values
            static defaults = {
                align  : 'center',
                field  : 'status',
                editor : {
                    type       : 'combo',
                    editable   : false,
                    autoExpand : true,
                    items      : [
                        [0, 'Todo'],
                        [1, 'In progress'],
                        [2, 'Review'],
                        [3, 'Finished']
                    ]
                }
            };

            renderer({ value }) {
                const colors = {
                    0 : 'blue',
                    1 : 'orange',
                    2 : 'red',
                    3 : 'green',
                    4 : 'purple'
                };

                if (typeof value === 'number') {
                    return {
                        className : {
                            'status-tag' : true
                        },
                        style : {
                            '--color' : `var(--b-color-${colors[value] || 'gray'})`
                        },
                        text : this.editor.items[value]?.text
                    };
                }

                return '';
            }
        }

        // Register with ColumnStore to make the column available to the grid
        ColumnStore.registerColumnType(StatusColumn);

        window.grid = new Grid({
            appendTo: this.template.querySelector('.container'),

            selectionMode : {
                row      : true,
                checkbox : {
                    // These configs are applied to the checkbox selection column
                    checkCls : 'b-my-checkbox'
                },
                showCheckAll : true
            },

            columns : [
                { type : 'rownumber' },
                {
                    text     : 'Template',
                    minWidth : 185,
                    flex     : 1,
                    field    : 'name',
                    type     : 'template',
                    template : data => StringHelper.xss`Hi ${data.record.name}!`,
                    // Cheaper measuring when sizing to fit content
                    fitMode  : 'value',
                    editor   : {
                        label : 'Name'
                    }
                },
                {
                    type    : 'widget',
                    text    : 'Chips',
                    field   : 'skills',
                    width   : 300,
                    widgets : [
                        {
                            type           : 'chipview',
                            valueProperty  : 'items',
                            itemsFocusable : false,
                            navigator      : null,
                            closable       : false,
                            scrollable     : null,
                            style          : {
                                flexFlow : 'row wrap',
                                display  : 'flex',
                                padding  : '5px 0 3px 0'
                            }
                        }
                    ],
                    cellEditor : {
                        // The editable ChipView auto heights and may overflow the cell height.
                        matchSize : {
                            height : false
                        }
                    },
                    editor : {
                        type        : 'combo',
                        multiSelect : true,
                        editable    : false,
                        items       : DataGenerator.skills
                    },
                    finalizeCellEdit({ value }) {
                        const valid = value.length < 4;

                        if (!valid) {
                            Toast.show('Pick max 3 skills');
                        }
                        return valid;
                    }
                },
                {
                    text     : 'Percent',
                    field    : 'percent',
                    flex     : 1,
                    minWidth : 150,
                    type     : 'percent'
                },
                {
                    text    : 'Widget',
                    width   : 90,
                    type    : 'widget',
                    align   : 'center',
                    widgets : [
                        {
                            type      : 'button',
                            icon      : 'fa fa-plus',
                            height    : '2.3em',
                            width     : '2.3em',
                            minHeight : 0,
                            rendition : 'filled',
                            color     : 'b-blue',
                            onAction  : ({ source : btn }) => {
                                btn.cellInfo.record.age++;
                            }
                        }
                    ]
                },
                {
                    text          : 'Number',
                    field         : 'age',
                    width         : 90,
                    align         : 'right',
                    type          : 'number',
                    instantUpdate : true
                },
                {
                    text  : 'Custom rendering',
                    width : 160,
                    type  : 'status'
                },
                {
                    text   : 'Date',
                    field  : 'start',
                    width  : 135,
                    type   : 'date',
                    format : 'MMMM D YYYY'
                },
                {
                    text   : 'Time',
                    field  : 'time',
                    type   : 'time',
                    format : 'LT'
                },

                {
                    text     : 'Link',
                    field    : 'name',
                    type     : 'template',
                    width    : 120,
                    editor   : false,
                    template : data => `<a href="https://bryntum.com" target="_blank">Click me</a>`
                },
                {
                    type    : 'rating',
                    text    : 'Rating',
                    cellCls : 'satisfaction',
                    max     : 5,
                    field   : 'rating'
                },
                {
                    type    : 'action',
                    field   : 'rating',
                    width   : 90,
                    text    : 'Actions',
                    align   : 'center',
                    actions : [
                        {
                            cls     : 'fa fa-minus',
                            tooltip : 'Decrease rating',
                            onClick : ({ record }) => {
                                if (record.rating > 1) {
                                    record.rating--;
                                }
                            }
                        }, {
                            cls     : 'fa fa-plus',
                            tooltip : 'Increase rating',
                            onClick : ({ record }) => {
                                if (record.rating < 5) {
                                    record.rating++;
                                }
                            }
                        }
                    ]
                },
                {
                    text     : 'Notes',
                    field    : 'notes',
                    minWidth : 200,
                    flex     : 1,
                    editor   : {
                        type : 'textareapickerfield'
                    }
                },
                {
                    type    : 'check',
                    text    : 'Enabled',
                    field   : 'active',
                    widgets : [
                        {
                            type      : 'slidetoggle',
                            ariaLabel : 'Toggle enabled state'
                        }
                    ]
                },
                {
                    text  : 'String',
                    field : 'firstName'
                },
                {
                    text     : 'Calculated field',
                    minWidth : 160,
                    field    : 'fullName'
                }
            ],

            features : {
                headerMenu : {
                    moveColumns : true
                }
            },

            store : {
                fields : [
                    'title',
                    'title',
                    'name',
                    'firstName',
                    'surName',
                    'city',
                    'team',
                    'food',
                    'color',
                    'relatedTo',
                    'notes',
                    { name : 'skills', type : 'array' },
                    { name : 'rank', type : 'number' },
                    { name : 'age', type : 'number' },
                    { name : 'percent', type : 'number' },
                    { name : 'active', type : 'boolean' },
                    { name : 'done', type : 'boolean' },
                    { name : 'rating', type : 'int' },
                    { name : 'score', type : 'int' },
                    { name : 'start', type : 'date' },
                    { name : 'time', type : 'date' },
                    { name : 'finish', type : 'date' },
                    // Calculated field
                    { name : 'fullName', calculate : record => `${record.firstName || ''} ${record.surName || ''}` }
                ],

                data : DataGenerator.generateData({
                    count     : 50,
                    addSkills : 3,
                    rowCallback(data) {
                        data.status = (data.id % 5) % 4;
                    }
                })
            }
        });
    }
}
