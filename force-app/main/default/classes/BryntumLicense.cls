/**
 * Reads the Bryntum license key stored in the org (Bryntum_License__c.Key__c) so it never has to live in source.
 *
 * The query is dynamic on purpose: the class compiles and deploys to an org that does not have the object, and
 * at runtime any failure (object missing, no record, no read access) resolves to null so the components simply
 * run in trial mode.
 */
public with sharing class BryntumLicense {
    @TestVisible
    private static final String QUERY = 'SELECT Key__c FROM Bryntum_License__c WITH USER_MODE ORDER BY CreatedDate DESC LIMIT 1';

    @AuraEnabled(cacheable=true)
    public static String getKey() {
        try {
            List<SObject> rows = Database.query(QUERY);
            if (rows.isEmpty()) {
                return null;
            }
            String key = (String) rows[0].get('Key__c');
            return String.isBlank(key) ? null : key.trim();
        } catch (Exception e) {
            return null;
        }
    }
}
