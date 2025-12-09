/* globals bryntum : true */
export default function complexityColumnInitializer() {
    class ComplexityColumn extends bryntum.gantt.Column {
        static $name         = 'ComplexityColumn';
        static type          = 'complexitycolumn';
        static isGanttColumn = true;
        static defaults      = {
            // Set your default instance config properties here
            field   : 'complexity',
            text    : 'Complexity',
            cellCls : 'b-complexity-column-cell',
            editor  : { type : 'complexitycombo' }
        };

        //endregion

        renderer({ column, value }) {
            const
                { store } = column.editor,
                complexity = store.getById(value)?.text;

            return complexity ? [{
                tag       : 'i',
                className : `fa fa-square ${complexity}`
            }, complexity] : '';
        }
    }

    bryntum.gantt.ColumnStore.registerColumnType(ComplexityColumn);

    return ComplexityColumn;
}