#!/usr/bin/env node
/**
 * Uploads the generated dataset to a Salesforce org with Bulk API upserts, in dependency order.
 *
 * Usage: node scripts/data/import-data.js [--target-org alias]
 *
 * Records are matched on their external ID, so the import can be repeated. Run `npm run data:clean` first to remove
 * the records of a previous, larger dataset.
 */
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const config = require('./config');

const outputDir = path.resolve(__dirname, '../..', config.outputDir);
const args = process.argv.slice(2);

const steps = [
    ['Account', 'Bryntum_External_Id__c', 'accounts.csv'],
    ['BryntumCalendar__c', 'ExternalId__c', 'calendars.csv'],
    ['BryntumCalendar__c', 'ExternalId__c', 'calendar-parents.csv'],
    ['BryntumCalendarInterval__c', 'ExternalId__c', 'calendar-intervals.csv'],
    ['BryntumResource__c', 'ExternalId__c', 'resources.csv'],
    ['BryntumProjectType__c', 'ExternalId__c', 'project-types.csv'],
    ['BryntumProjectStatus__c', 'ExternalId__c', 'project-statuses.csv'],
    ['BryntumProject__c', 'ExternalId__c', 'projects.csv'],
    ['BryntumTask__c', 'ExternalId__c', 'tasks.csv'],
    ['BryntumTask__c', 'ExternalId__c', 'task-parents.csv'],
    ['BryntumAssignment__c', 'ExternalId__c', 'assignments.csv'],
    ['BryntumDependency__c', 'ExternalId__c', 'dependencies.csv']
];

for (const [sobject, externalId, file] of steps) {
    const filePath = path.join(outputDir, file);
    if (!fs.existsSync(filePath)) {
        console.error(`${filePath} not found, run "npm run data:generate" first`);
        process.exit(1);
    }
    console.log(`\nUpserting ${sobject} from ${file}`);
    const result = spawnSync('sf', ['data', 'upsert', 'bulk', '--sobject', sobject, '--external-id', externalId, '--file', filePath, '--wait', '10', ...args], { stdio : 'inherit' });
    if (result.status !== 0) {
        console.error(`Import of ${file} failed`);
        process.exit(result.status || 1);
    }
}

console.log('\nImport complete');
