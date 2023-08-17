export default EventModelClass => class Appointment extends EventModelClass {
    // Custom Appointment model, based on EventModel with additional fields and changed defaults
    static get fields() {
        return [
            'patient',
            'requiredRole',
            // override field defaultValue to hours
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }

    static get defaults() {
        return {
            // In this demo, default duration for sessions will be hours (instead of days)
            durationUnit : 'h'
        };
    }
}
