export default (ComboClass) => {
  
    class IconCombo extends ComboClass {

        static get type() {
            return 'iconcombo';
        }

        static get defaultConfig() {
            return {
                items : [
                    { value : 'b-fa b-fa-asterisk', text : 'Asterisk' },
                    { value : 'b-fa b-fa-fw b-fa-beer', text : 'Beer' },
                    { value : 'b-fa b-fa-fw b-fa-book', text : 'Book' },
                    { value : 'b-fa b-fa-fw b-fa-bug', text : 'Bug' },
                    { value : 'b-fa b-fa-building', text : 'Building' },
                    { value : 'b-fa b-fa-coffee', text : 'Coffee' },
                    { value : 'b-fa b-fa-fw b-fa-cog', text : 'Cog' },
                    { value : 'b-fa b-fa-fw b-fa-dumbbell', text : 'Dumbbell' },
                    { value : 'b-fa b-fa-laptop', text : 'Laptop' },
                    { value : 'b-fa b-fa-fw b-fa-plane', text : 'Plane' },
                    { value : 'b-fa b-fa-fw b-fa-phone', text : 'Phone' },
                    { value : 'b-fa b-fa-fw b-fa-question', text : 'Question' },
                    { value : 'b-fa b-fa-fw b-fa-life-ring', text : 'Ring' },
                    { value : 'b-fa b-fa-sync', text : 'Sync' },
                    { value : 'b-fa b-fa-user', text : 'User' },
                    { value : 'b-fa b-fa-users', text : 'Users' },
                    { value : 'b-fa b-fa-video', text : 'Video' }
                ],

                listItemTpl : item => `<i class="${item.value}" style="margin-right: .5em"></i>${item.text}`
            };
        }

        syncInputFieldValue(...args) {
            this.icon.className = this.value;
            super.syncInputFieldValue(...args);
        }

        get innerElements() {
            return [
                {
                    reference : 'icon',
                    tag       : 'i',
                    className : 'b-fa b-fa-cog',
                    style     : {
                        marginLeft  : '.8em',
                        marginRight : '-.3em'
                    }
                },
                ...super.innerElements
            ];
        }
    }
    // Register class to be able to create widget by type
    IconCombo.initClass();

    return IconCombo;
}
