@isTest
private class BryntumDashboardControllerTest {
    // A small portfolio: one project with a phase and two tasks, one resource, one assignment and one dependency
    private static Map<String, SObject> createPortfolio() {
        BryntumCalendar__c calendar = new BryntumCalendar__c(Name = 'General', ExternalId__c = 'cal-general');
        insert calendar;
        insert new BryntumCalendarInterval__c(Name = 'Weekend', Calendar__c = calendar.Id, RecurrentStartDate__c = 'on Sat', RecurrentEndDate__c = 'on Mon', IsWorking__c = false);

        BryntumResource__c resource = new BryntumResource__c(Name = 'Alice Andersson', Role__c = 'Project Manager', Department__c = 'Engineering', HourlyRate__c = 80, MaxUnits__c = 100);
        insert resource;

        BryntumProjectType__c projectType = new BryntumProjectType__c(Name = 'Software', ExternalId__c = 'ptype-software');
        insert projectType;

        BryntumProject__c project = new BryntumProject__c(Name = 'Customer Portal', ProjectType__c = projectType.Id, Status__c = 'Active', Manager__c = resource.Id, StartDate__c = Date.newInstance(2026, 1, 5), StatusDate__c = Date.newInstance(2026, 1, 8), Budget__c = 10000, Calendar__c = calendar.Id);
        insert project;

        BryntumTask__c phase = new BryntumTask__c(Name = 'Design', Project__c = project.Id, OrderIndex__c = 0, StartDate__c = DateTime.newInstanceGmt(2026, 1, 5), EndDate__c = DateTime.newInstanceGmt(2026, 1, 12), Duration__c = 5, DurationUnit__c = 'day', PercentDone__c = 50, Status__c = 'In Progress');
        insert phase;
        BryntumTask__c first = new BryntumTask__c(Name = 'Wireframes', Project__c = project.Id, Parent__c = phase.Id, OrderIndex__c = 0, StartDate__c = DateTime.newInstanceGmt(2026, 1, 5), EndDate__c = DateTime.newInstanceGmt(2026, 1, 7), Duration__c = 2, DurationUnit__c = 'day', PercentDone__c = 100, Status__c = 'Completed');
        BryntumTask__c second = new BryntumTask__c(Name = 'Visual design', Project__c = project.Id, Parent__c = phase.Id, OrderIndex__c = 1, StartDate__c = DateTime.newInstanceGmt(2026, 1, 7), EndDate__c = DateTime.newInstanceGmt(2026, 1, 12), Duration__c = 3, DurationUnit__c = 'day', PercentDone__c = 0, Status__c = 'Not Started');
        insert new List<BryntumTask__c>{ first, second };

        BryntumAssignment__c assignment = new BryntumAssignment__c(Task__c = first.Id, Resource__c = resource.Id, Units__c = 100);
        insert assignment;
        BryntumDependency__c dependency = new BryntumDependency__c(FromTask__c = first.Id, ToTask__c = second.Id, Type__c = 'FS', Lag__c = 0, LagUnit__c = 'day', Active__c = true);
        insert dependency;

        return new Map<String, SObject>{
            'calendar' => calendar, 'resource' => resource, 'projectType' => projectType, 'project' => project,
            'phase' => phase, 'first' => first, 'second' => second, 'assignment' => assignment, 'dependency' => dependency
        };
    }

    private static Map<String, Object> store(List<Object> added, List<Object> updated, List<Object> removed) {
        return new Map<String, Object>{ 'added' => added, 'updated' => updated, 'removed' => removed };
    }

    @isTest
    static void loadsPortfolioInBryntumFormat() {
        Map<String, SObject> records = createPortfolio();
        BryntumProject__c project = (BryntumProject__c) records.get('project');
        BryntumTask__c phase = (BryntumTask__c) records.get('phase');
        BryntumTask__c first = (BryntumTask__c) records.get('first');

        Test.startTest();
        Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(BryntumDashboardController.getPortfolioData());
        Test.stopTest();

        List<Object> projects = (List<Object>) data.get('projects');
        System.assertEquals(1, projects.size(), 'One project is loaded');
        Map<String, Object> projectRow = (Map<String, Object>) projects[0];
        System.assertEquals('Customer Portal', projectRow.get('name'));
        System.assertEquals('Software', projectRow.get('type'), 'The type name comes from the related record');
        System.assertEquals('Active', projectRow.get('status'));

        System.assertEquals(1, ((List<Object>) data.get('projectTypes')).size());
        System.assertEquals(1, ((List<Object>) data.get('managers')).size(), 'Project managers are offered as managers');

        List<Object> tasks = (List<Object>) ((Map<String, Object>) data.get('tasks')).get('rows');
        System.assertEquals(4, tasks.size(), 'The project node and its three tasks are loaded');
        Map<String, Object> projectNode = (Map<String, Object>) tasks[0];
        System.assertEquals(project.Id, projectNode.get('id'));
        System.assertEquals(true, projectNode.get('isProject'));
        System.assertEquals('Active', projectNode.get('status'), 'The project node carries the fields the grid edits');
        System.assertEquals(10000, projectNode.get('budget'));
        System.assertEquals('2026-01-08', projectNode.get('statusDate'), 'The project node carries the status date of the progress line');

        Map<String, Object> phaseRow;
        Map<String, Object> wireframes;
        for (Object row : tasks) {
            Map<String, Object> task = (Map<String, Object>) row;
            if (task.get('id') == phase.Id) {
                phaseRow = task;
            }
            if (task.get('id') == first.Id) {
                wireframes = task;
            }
        }
        System.assertEquals(project.Id, phaseRow.get('parentId'), 'Phases are nested under the project node');
        System.assertEquals(phase.Id, wireframes.get('parentId'), 'Tasks are nested under their parent');
        System.assertEquals('hour', wireframes.get('effortUnit'));

        List<Object> assignments = (List<Object>) ((Map<String, Object>) data.get('assignments')).get('rows');
        System.assertEquals(1, assignments.size());
        System.assertEquals(first.Id, ((Map<String, Object>) assignments[0]).get('event'));

        List<Object> dependencies = (List<Object>) ((Map<String, Object>) data.get('dependencies')).get('rows');
        System.assertEquals(1, dependencies.size());
        System.assertEquals(2, ((Map<String, Object>) dependencies[0]).get('type'), 'FS maps to Bryntum type 2');

        List<Object> calendars = (List<Object>) ((Map<String, Object>) data.get('calendars')).get('rows');
        System.assertEquals(1, calendars.size());
        List<Object> intervals = (List<Object>) ((Map<String, Object>) calendars[0]).get('intervals');
        System.assertEquals(1, intervals.size());
        System.assertEquals(null, ((Map<String, Object>) intervals[0]).get('name'), 'A recurring interval is sent without its name');

        List<Object> resources = (List<Object>) ((Map<String, Object>) data.get('resources')).get('rows');
        System.assertEquals(1, resources.size());
    }

    @isTest
    static void savesSyncPackage() {
        Map<String, SObject> records = createPortfolio();
        Id projectId = records.get('project').Id;
        Id phaseId = records.get('phase').Id;
        Id secondId = records.get('second').Id;
        Id resourceId = records.get('resource').Id;

        Map<String, Object> pack = new Map<String, Object>{
            'tasks' => store(
                new List<Object>{
                    new Map<String, Object>{ '$PhantomId' => '_generatedTask1', 'parentId' => phaseId, 'name' => 'Review', 'startDate' => '2026-01-12T08:00:00', 'duration' => 1, 'durationUnit' => 'day', 'percentDone' => 0, 'orderedParentIndex' => 2, 'status' => 'Not Started' },
                    new Map<String, Object>{ '$PhantomId' => '_generatedTask2', 'parentId' => '_generatedTask1', 'name' => 'Sign off', 'duration' => 1, 'durationUnit' => 'day' }
                },
                new List<Object>{
                    new Map<String, Object>{ 'id' => phaseId, 'name' => 'Design phase', 'percentDone' => 60, 'deadlineDate' => '2026-02-01T00:00:00Z' },
                    new Map<String, Object>{ 'id' => projectId, 'name' => 'Portal', 'status' => 'On Hold', 'budget' => 12000, 'startDate' => '2026-01-06T00:00:00', 'endDate' => '2026-03-01T00:00:00', 'statusDate' => '2026-02-10T00:00:00+01:00' }
                },
                new List<Object>()
            ),
            'assignments' => store(
                new List<Object>{ new Map<String, Object>{ '$PhantomId' => '_generatedAssignment1', 'event' => '_generatedTask1', 'resource' => resourceId, 'units' => 50 } },
                new List<Object>(),
                new List<Object>()
            ),
            'dependencies' => store(
                new List<Object>{ new Map<String, Object>{ '$PhantomId' => '_generatedDependency1', 'fromEvent' => secondId, 'toEvent' => '_generatedTask1', 'type' => 2, 'lag' => 1, 'lagUnit' => 'day', 'active' => true } },
                new List<Object>(),
                new List<Object>{ new Map<String, Object>{ 'id' => records.get('dependency').Id } }
            ),
            'resources' => store(
                new List<Object>(),
                new List<Object>{ new Map<String, Object>{ 'id' => resourceId, 'department' => 'Marketing' } },
                new List<Object>()
            )
        };

        Test.startTest();
        Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(BryntumDashboardController.saveChanges(JSON.serialize(pack)));
        Test.stopTest();

        Map<String, Object> savedTasks = (Map<String, Object>) response.get('tasks');
        List<Object> taskRows = (List<Object>) savedTasks.get('added');
        System.assertEquals(2, taskRows.size(), 'Every new task is returned with its id');
        Map<String, Object> reviewRow = (Map<String, Object>) taskRows[0];
        System.assertEquals('_generatedTask1', reviewRow.get('$PhantomId'));
        System.assertEquals('Review', reviewRow.get('name'), 'The saved fields are returned');
        System.assertEquals(projectId, reviewRow.get('projectId'), 'The project of a new task is returned');
        System.assertEquals(false, reviewRow.containsKey('parentId'), 'The tree position is not returned');
        System.assertEquals(reviewRow.get('id'), ((Map<String, Object>) ((List<Object>) ((Map<String, Object>) response.get('assignments')).get('added'))[0]).get('event'), 'References to new records are resolved');
        System.assertEquals(2, ((List<Object>) savedTasks.get('updated')).size());
        System.assertEquals(1, ((List<Object>) ((Map<String, Object>) response.get('dependencies')).get('removed')).size(), 'Removed rows are returned');

        BryntumTask__c review = [SELECT Id, Name, Project__c, Parent__c, OrderIndex__c, StartDate__c, Status__c FROM BryntumTask__c WHERE Id = :(Id) reviewRow.get('id')];
        System.assertEquals('Review', review.Name);
        System.assertEquals(phaseId, review.Parent__c, 'The new task is nested under the phase');
        System.assertEquals(projectId, review.Project__c, 'The project is taken from the parent task');
        System.assertEquals(2, review.OrderIndex__c);
        System.assertEquals('Not Started', review.Status__c);
        System.assertNotEquals(null, review.StartDate__c);

        BryntumTask__c signOff = [SELECT Parent__c, Project__c FROM BryntumTask__c WHERE Name = 'Sign off'];
        System.assertEquals(review.Id, signOff.Parent__c, 'A new task under a new task resolves the phantom parent');
        System.assertEquals(projectId, signOff.Project__c);

        BryntumTask__c phase = [SELECT Name, PercentDone__c, Deadline__c FROM BryntumTask__c WHERE Id = :phaseId];
        System.assertEquals('Design phase', phase.Name);
        System.assertEquals(60, phase.PercentDone__c);
        System.assertEquals(DateTime.newInstanceGmt(2026, 2, 1), phase.Deadline__c);

        BryntumProject__c project = [SELECT Name, Status__c, Budget__c, StartDate__c, EndDate__c, StatusDate__c FROM BryntumProject__c WHERE Id = :projectId];
        System.assertEquals('Portal', project.Name, 'Updates of the project node go to the project record');
        System.assertEquals('On Hold', project.Status__c);
        System.assertEquals(12000, project.Budget__c);
        System.assertEquals(Date.newInstance(2026, 1, 6), project.StartDate__c);
        System.assertEquals(Date.newInstance(2026, 3, 1), project.EndDate__c);
        System.assertEquals(Date.newInstance(2026, 2, 10), project.StatusDate__c, 'The status date takes the calendar date of the local time sent');

        BryntumAssignment__c assignment = [SELECT Task__c, Resource__c, Units__c FROM BryntumAssignment__c WHERE Task__c = :review.Id];
        System.assertEquals(resourceId, assignment.Resource__c);
        System.assertEquals(50, assignment.Units__c);

        List<BryntumDependency__c> dependencies = [SELECT FromTask__c, ToTask__c, Type__c, Lag__c FROM BryntumDependency__c];
        System.assertEquals(1, dependencies.size(), 'The old dependency is removed and the new one inserted');
        System.assertEquals(secondId, dependencies[0].FromTask__c);
        System.assertEquals(review.Id, dependencies[0].ToTask__c);
        System.assertEquals('FS', dependencies[0].Type__c, 'Bryntum type 2 maps to FS');
        System.assertEquals(1, dependencies[0].Lag__c);

        System.assertEquals('Marketing', [SELECT Department__c FROM BryntumResource__c WHERE Id = :resourceId].Department__c);
    }

    @isTest
    static void removesTaskWithSubtasksAndRelatedRecords() {
        Map<String, SObject> records = createPortfolio();
        Map<String, Object> pack = new Map<String, Object>{
            'tasks' => store(new List<Object>(), new List<Object>(), new List<Object>{ new Map<String, Object>{ 'id' => records.get('phase').Id } })
        };

        Test.startTest();
        BryntumDashboardController.saveChanges(JSON.serialize(pack));
        Test.stopTest();

        System.assertEquals(0, [SELECT COUNT() FROM BryntumTask__c], 'The phase and its subtasks are deleted');
        System.assertEquals(0, [SELECT COUNT() FROM BryntumAssignment__c], 'Assignments of deleted tasks are deleted');
        System.assertEquals(0, [SELECT COUNT() FROM BryntumDependency__c], 'Dependencies of deleted tasks are deleted');
        System.assertEquals(1, [SELECT COUNT() FROM BryntumProject__c], 'The project stays');
    }

    @isTest
    static void rollsBackOnInvalidReference() {
        Map<String, SObject> records = createPortfolio();
        Map<String, Object> pack = new Map<String, Object>{
            'tasks' => store(
                new List<Object>{ new Map<String, Object>{ '$PhantomId' => '_generatedTask1', 'parentId' => records.get('phase').Id, 'name' => 'Orphan' } },
                new List<Object>(),
                new List<Object>()
            ),
            'assignments' => store(
                new List<Object>{ new Map<String, Object>{ '$PhantomId' => '_generatedAssignment1', 'event' => '_generatedTask1', 'resource' => 'no-such-resource' } },
                new List<Object>(),
                new List<Object>()
            )
        };

        Test.startTest();
        Boolean failed = false;
        try {
            BryntumDashboardController.saveChanges(JSON.serialize(pack));
        }
        catch (AuraHandledException e) {
            failed = true;
        }
        Test.stopTest();

        System.assert(failed, 'An unknown reference fails the whole package');
        System.assertEquals(0, [SELECT COUNT() FROM BryntumTask__c WHERE Name = 'Orphan'], 'The inserted task is rolled back');
    }
}
