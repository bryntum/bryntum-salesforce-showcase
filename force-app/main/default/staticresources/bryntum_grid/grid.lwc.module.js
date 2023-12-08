this.bryntum = {
    ...(this.bryntum || {}),
    
    getVersion : function() {
        return 'stub';
    },
    
    grid : {
        Grid : class Grid {
            constructor({ appendTo }) {
                const div = document.createElement('div');
                div.innerHTML = 'To enable this component please see Readme.md for instructions';
                div.style.backgroundColor = 'white';
                div.style.padding = '1em';
                appendTo.appendChild(div);
            }
        }
    }
}
