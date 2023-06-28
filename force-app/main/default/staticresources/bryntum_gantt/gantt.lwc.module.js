this.bryntum = {
    ...(this.bryntum || {}),
    
    gantt : {
        Gantt : class Gantt {
            constructor({ appendTo }) {
                const div = document.createElement('div');
                div.innerHTML = 'To enable this component please see Readme.md for instructions';
                div.style.backgroundColor = 'white';
                div.style.padding = '1em';
                appendTo.appendChild(div);
            }
        },

        Toolbar : class Toolbar {},

        ProjectModel : class ProjectModel {
            commitAsync() {
                return {
                    then() {}
                };
            }
        }
    }
}
