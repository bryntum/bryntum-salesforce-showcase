export default (base) => {
    const { StringHelper } = window.bryntum.scheduler;

    return class UnplnnedGrid extends base {
        static get configurable() {
            return {
                features : {
                    stripe : true,
                    sort   : 'name'
                },

                columns: [{
                    text       : 'Tasks',
                    flex       : 1,
                    field      : 'name',
                    htmlEncode : false,
                    minWidth   : 200,
                    renderer   : data => StringHelper.xss`<i class="${data.record.iconCls}"></i>${data.record.name}`
                }, {
                    type  : 'duration',
                    text  : 'Duration',
                    width : 80,
                    align : 'right'
                }],

                rowHeight : 50
            };
        }

        static get $name() {
            return 'UnplannedGrid';
        }

        // Factoryable type name
        static get type() {
            return 'unplannedgrid';
        }
    };
};
