/* globals bryntum : true */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import GRID from '@salesforce/resourceUrl/bryntum_grid';

export default class Grid_temp_demo extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, GRID + '/grid.lwc.module.js'),
            loadStyle(this, GRID + '/grid.stockholm.css')
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
        const
            btnCfg = {
                type        : 'button',
                icon        : 'b-fa-square',
                iconAlign   : 'start',
                toggleable  : true,
                pressedIcon : 'b-fa-check-square',
                onToggle({ pressed, source }) {
                    source.up('grid').selectionMode[source.ref] = pressed;
                }
            },
            selectionConfigs = ['cell', 'column', 'rowNumber', 'multiSelect', 'dragSelect', 'selectOnKeyboardNavigation',
                'checkbox', 'checkboxOnly', 'showCheckAll', 'deselectOnClick', 'deselectFilteredOutRecords'];

        
        window.grid = new bryntum.grid.Grid({
            appendTo: this.template.querySelector('.container'),
            features : {
                group        : true,
                filter       : true,
                cellEdit     : true,
                rowCopyPaste : false,
                cellCopyPaste : true,
                fillHandle    : true
            },
        
            selectionMode : {
                cell       : true,
                dragSelect : true,
                rowNumber  : true
            },
        
            columns : [
                {
                    text  : 'Name',
                    field : 'name',
                    flex  : 2
                }, {
                    text  : 'Age',
                    field : 'age',
                    width : 100,
                    type  : 'number'
                }, {
                    text  : 'City',
                    field : 'city',
                    flex  : 1
                }, {
                    text  : 'Food',
                    field : 'food',
                    flex  : 1
                }, {
                    text  : 'Color',
                    field : 'color',
                    flex  : 1
                }
            ],
        
            tbar : [
                {
                    type  : 'container',
                    cls   : 'toolbar-group',
                    width : '15em',
                    ref   : 'selectables',
                    items : [
                        {
                            type    : 'container',
                            content : 'Selectables',
                            style   : { 'grid-column' : 'span 2' },
                            cls     : 'header'
                        },
                        {
                            ref     : 'cell',
                            text    : 'Cell',
                            pressed : true,
                            tooltip : `<code>selectionMode.cell</code> - Toggles cell selection. This takes precedence over row selection, but rows can still
                                'be selected selected programmatically or with checkbox or RowNumber selection. Required for
                                'column' selection`,
                            ...btnCfg
                        },
                        {
                            ref     : 'column',
                            text    : 'Column',
                            tooltip : '<code>selectionMode.column</code> - Enables selection of whole columns of cells. Requires cell to be set to `true`',
                            ...btnCfg
                        },
                        {
                            ref     : 'rowNumber',
                            text    : 'Row number',
                            style   : 'grid-column:span 2',
                            pressed : true,
                            tooltip : '<code>selectionMode.rowNumber</code> - Adds a RowNumberColumn which, when clicked, selects the row.',
                            ...btnCfg
                        }
                    ]
                },
                {
                    type  : 'container',
                    ref   : 'features',
                    cls   : 'toolbar-group',
                    width : '19em',
                    items : [
                        {
                            type    : 'container',
                            content : 'Features',
                            style   : { 'grid-column' : 'span 2' },
                            cls     : 'header'
                        },
                        {
                            ref     : 'multiSelect',
                            text    : 'Multi-select',
                            pressed : true,
                            tooltip : `<code>selectionMode.multiSelect</code> - Allow multiple selection with Ctrl and Shift+click or with 'checkbox selection. Also 
                                 required for 'dragSelect' and 'column' selection`,
                            ...btnCfg
                        },
                        {
                            ref     : 'dragSelect',
                            text    : 'Drag select',
                            pressed : true,
                            tooltip : '<code>selectionMode.dragSelect</code> - Set to `true` to enable multiple selection by dragging. Also requires `multiSelect`',
                            ...btnCfg
                        },
                        {
                            ref     : 'selectOnKeyboardNavigation',
                            text    : 'Select on keyboard navigation',
                            pressed : true,
                            style   : { 'grid-column' : 'span 2' },
                            tooltip : '<code>selectionMode.selectOnKeyboardNavigation</code> - Toggles auto-selection by keyboard navigation',
                            ...btnCfg
                        }
                    ]
                },
                {
                    ref   : 'checkbox',
                    type  : 'container',
                    cls   : 'toolbar-group',
                    width : '21em',
                    items : [
                        {
                            type    : 'container',
                            content : 'Checkbox',
                            style   : { 'grid-column' : 'span 2' },
                            cls     : 'header'
                        },
                        {
                            ref     : 'checkbox',
                            text    : 'Checkbox',
                            style   : { 'grid-column' : 'span 2' },
                            tooltip : '<code>selectionMode.checkbox</code> - This adds a checkbox selection column to the grid.',
                            ...btnCfg
                        },
                        {
                            ref     : 'checkboxOnly',
                            text    : 'Checkbox only',
                            tooltip : `<code>selectionMode.checkboxOnly</code> - Select rows only when clicking in the checkbox column. Requires 'cell' selection to be 
                                'false' and 'checkbox' to be set to 'true'.`,
                            ...btnCfg
                        },
                        {
                            ref     : 'showCheckAll',
                            text    : 'Show check all',
                            tooltip : `<code>selectionMode.showCheckAll</code> - Adds a checkbox to the selection column header to select/deselect all rows. Requires
                                'checkbox' selection`,
                            ...btnCfg
                        }]
                },
                {
                    type  : 'container',
                    ref   : 'settings',
                    cls   : 'toolbar-group',
                    width : '18em',
                    style : 'grid-template-columns: 1fr',
                    items : [
                        {
                            type    : 'container',
                            content : 'Settings',
                            cls     : 'header'
                        },
                        {
                            ref     : 'deselectOnClick',
                            text    : 'Deselect on click',
                            tooltip : '<code>selectionMode.deselectOnClick</code> - Toggles whether the Grid should deselect a selected row or cell when clicking it',
                            ...btnCfg
                        }, {
                            ref     : 'deselectFilteredOutRecords',
                            text    : 'Deselect filtered-out records',
                            tooltip : '<code>selectionMode.deselectFilteredOutRecords</code> - When active, records will be deselected when they are filtered out',
                            ...btnCfg
                        }]
                },
                '->',
                {
                    type  : 'container',
                    ref   : 'info',
                    cls   : 'toolbar-group selection-info',
                    width : '13em',
                    items : [
                        {
                            type    : 'container',
                            content : 'Current selection',
                            cls     : 'header'
                        },
                        {
                            type    : 'container',
                            ref     : 'recordsHeader',
                            cls     : 'subheader',
                            content : '0 records'
                        },
                        {
                            type    : 'container',
                            ref     : 'records',
                            cls     : 'line',
                            content : '&nbsp;'
                        },
                        {
                            type    : 'container',
                            ref     : 'cellsHeader',
                            cls     : 'subheader',
                            content : '0 cells'
                        },
                        {
                            type    : 'container',
                            ref     : 'cells',
                            cls     : 'line',
                            content : '&nbsp;'
                        }
                    ]
                }
            ],
        
            data : bryntum.grid.DataGenerator.generateData(50),
        
            listeners : {
                selectionModeChange(selectionMode) {
                    // Update button's pressed state with it corresponding selectionMode config.
                    for (const config of selectionConfigs) {
                        this.widgetMap[config].pressed = selectionMode[config];
                    }
                },
        
                // When selection changes, this updates selection information
                selectionChange() {
                    const { widgetMap, selectedRows, selectedCells } = this;
        
                    widgetMap.recordsHeader.content = `${selectedRows.length} records`;
        
                    // Calculate row ranges
                    const
                        sortedRecords   = selectedRows.sort((a, b) => a.id - b.id);
                    let isRange         = false,
                        recordSelection = '&nbsp;';
        
                    for (let i = 0; i < sortedRecords.length; i++) {
                        const curId = sortedRecords[i].id;
                        if (i === 0) {
                            recordSelection = curId;
                        }
                        else {
                            const prevId = sortedRecords[i - 1].id;
                            // If current id is one more than previous, we got a range
                            if (curId === prevId + 1) {
                                // End of selection, finish range
                                if (i === sortedRecords.length - 1) {
                                    recordSelection += '-' + curId;
                                }
                                isRange = true;
                            }
                            // No range or range aborted
                            else {
                                // Range aborted, finish range
                                if (isRange) {
                                    recordSelection += '-' + prevId;
                                    isRange = false;
                                }
                                // Otherwise, just add current id as single
                                recordSelection += ',' + curId;
                            }
                        }
                    }
        
                    widgetMap.records.content =  recordSelection;
        
                    widgetMap.cellsHeader.content =  `${selectedCells.length} cells`;
        
                    // Calculate cell ranges
                    const
                        colCount       = this.columns.visibleColumns.length,
                        rowCount       = this.store.count,
                        // Sort selected cells by row and then by column
                        cellsAvailable = selectedCells.map(c => [c.columnIndex, c.rowIndex]).sort((a, b) => a[1] - b[1] || a[0] - b[0]),
                        cellSelections = [];
        
                    // Loop until all selected cells have been processed
                    while (cellsAvailable.length) {
                        const
                            [startCol, startRow] = cellsAvailable.shift();
                        let endCol               = startCol,
                            endRow               = startRow;
        
                        // Check selection for each column
                        for (let x = startCol + 1; x < colCount; x++) {
                            const foundIndex = cellsAvailable.findIndex(cell => cell[0] === x && cell[1] === startRow);
                            // If column is selected, check next
                            if (foundIndex >= 0) {
                                endCol = cellsAvailable[foundIndex][0];
                                cellsAvailable.splice(foundIndex, 1);
                            }
                            // Column not selected, abort loop as we got an end column to this particular range
                            else {
                                break;
                            }
                        }
        
                        // Check selection for each row between start and end column calculated above
                        for (let y = startRow + 1; y < rowCount - startRow; y++) {
                            let addToRange = false;
                            // In each column in range found above
                            for (let x = startCol; x <= endCol; x++) {
                                const foundIndex = cellsAvailable.findIndex(cell => cell[0] === x && cell[1] === y);
                                if (foundIndex >= 0) {
                                    addToRange = true;
                                    endRow = cellsAvailable[foundIndex][1];
                                    cellsAvailable.splice(foundIndex, 1);
                                }
                                // A row that's not selected in current range's columns, is not a part of current range
                                else {
                                    addToRange = false;
                                    break;
                                }
                            }
                            if (!addToRange) {
                                break;
                            }
                        }
        
                        // Build string output
                        let str = startCol + ':' + startRow;
                        if (startCol < endCol || startRow < endRow) {
                            str += '-' + endCol + ':' + endRow;
                        }
                        cellSelections.push(str);
                    }
        
                    widgetMap.cells.content =  cellSelections.join(', ');
        
                }
            }
        });
    }
}
