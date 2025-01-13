// Extend default Task model class to provide additional CSS class
export default base => class Task extends base {

    static $name = 'Task';

    get cls() {
        // adds 'b-critical' CSS class to critical tasks
        return Object.assign(super.cls, { 'b-critical' : this.critical });
    }

}