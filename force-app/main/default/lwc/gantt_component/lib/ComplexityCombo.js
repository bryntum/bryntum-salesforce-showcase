/* globals bryntum : true */
export default function complexityComboInitializer() {
    class ComplexityCombo extends bryntum.gantt.Combo {
        static type          = 'complexitycombo';
        static get configurable() {
            return {
                items       : [
                    {
                        value : 0,
                        text  : 'Easy'
                    },
                    {
                        value : 1,
                        text  : 'Normal'
                    },
                    {
                        value : 2,
                        text  : 'Hard'
                    },
                    {
                        value : 3,
                        text  : 'Impossible'
                    }
                ],
                picker      : {
                    minWidth : '8em'
                },
                listItemTpl : ({ text }) => `
            <div>
                <i style="margin-inline-end: 0.5em" class="fa fa-square ${text}"></i>
                <small>${text}</small>
            </div>
            `
            }
        };

        syncInputFieldValue(...args) {
            const complexity = this.store.getById(this.value)?.text;
            this.icon.className = `fa fa-square ${complexity}`;
            super.syncInputFieldValue(...args);
        }

        get innerElements() {
            return [
                {
                    reference : 'icon',
                    tag       : 'i',
                    style     : {
                        marginInlineStart : '.8em',
                        marginInlineEnd   : '-.3em'
                    }
                },
                ...super.innerElements
            ];
        }
    }

    // Register class to be able to create widget by type
    ComplexityCombo.initClass();

    return ComplexityCombo;
}