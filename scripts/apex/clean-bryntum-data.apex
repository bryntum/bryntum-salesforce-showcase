// Removes all records of the generated dashboard dataset. Run with: npm run data:clean
// Tasks, assignments and calendar intervals are deleted through their master-detail relationships.
delete [SELECT Id FROM BryntumDependency__c];
delete [SELECT Id FROM BryntumProject__c];
delete [SELECT Id FROM BryntumProjectType__c];
delete [SELECT Id FROM BryntumResource__c];
delete [SELECT Id FROM BryntumCalendar__c];
delete [SELECT Id FROM Account WHERE Bryntum_External_Id__c != null];
System.debug('Bryntum dashboard data removed');
