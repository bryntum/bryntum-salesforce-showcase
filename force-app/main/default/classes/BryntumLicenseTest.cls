@IsTest
private class BryntumLicenseTest {
    // The object is referenced through the describe API so the test compiles in an org without it
    private static SObjectType licenseType() {
        return Schema.getGlobalDescribe().get('Bryntum_License__c');
    }

    @IsTest
    static void returnsNullWhenNoRecord() {
        System.assertEquals(null, BryntumLicense.getKey());
    }

    @IsTest
    static void returnsStoredKey() {
        SObjectType type = licenseType();
        if (type == null) {
            return;
        }
        SObject license = type.newSObject();
        license.put('Name', 'Showcase');
        license.put('Key__c', '  my-key  ');
        insert license;

        System.assertEquals('my-key', BryntumLicense.getKey());
    }
}
