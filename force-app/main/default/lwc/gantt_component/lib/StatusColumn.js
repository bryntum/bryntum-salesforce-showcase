/* globals bryntum : true */
export default function statusColumnInitializer() {
    class StatusColumn extends bryntum.gantt.Column {

        static $name = 'StatusColumn';

        static type = 'statuscolumn';

        static get isGanttColumn() {
            return true;
        }

        static get defaults() {
            return {
                // Set your default instance config properties here
                field      : 'status',
                text       : 'Status',
                editor     : false,
                readOnly   : true, // For FillHandle etc.
                cellCls    : 'b-status-column-cell',
                htmlEncode : false,
                width      : 120,
                filterable : {
                    filterField : {
                        type  : 'combo',
                        items : ['Not Started', 'Started', 'Completed', 'Late']
                    }
                }
            };
        }

        //endregion

        renderer({ record }) {
            const status = record.status;

            return status ? [{
                tag       : 'i',
                className : `fa fa-circle ${status}`
            }, status] : '';
        }
    }

    bryntum.gantt.ColumnStore.registerColumnType(StatusColumn);

    return StatusColumn;
}