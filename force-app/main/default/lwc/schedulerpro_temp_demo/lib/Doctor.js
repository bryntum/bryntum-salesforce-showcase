export default ResourceModelClass => class Doctor extends ResourceModelClass {
    static get fields() {
        return [
            'role',
            'roleIconCls'
        ];
    }
}