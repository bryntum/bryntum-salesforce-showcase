this.bryntum = {
    ...(this.bryntum || {}),
    
    scheduler : {
        Scheduler : class Scheduler {
            constructor({ appendTo }) {
                const div = document.createElement('div');
                div.innerHTML = 'To enable this component please see Readme.md for instructions';
                div.style.backgroundColor = 'white';
                div.style.padding = '1em';
                appendTo.appendChild(div);
            }
        },

        ResourceStore   : class ResourceStore {},
        EventStore      : class EventStore {},
        DependencyStore : class DependencyStore {}
    }
}
