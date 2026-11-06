@isTest
private class BryntumDashboardControllerTest {
    @isTest
    static void loadsPortfolioInBryntumFormat() {
        BryntumCalendar__c calendar = new BryntumCalendar__c(Name = 'General', ExternalId__c = 'cal-general');
        insert calendar;
        insert new BryntumCalendarInterval__c(Name = 'Weekend', Calendar__c = calendar.Id, RecurrentStartDate__c = 'on Sat', RecurrentEndDate__c = 'on Mon', IsWorking__c = false);

        BryntumResource__c resource = new BryntumResource__c(Name = 'Alice Andersson', Role__c = 'Project Manager', Department__c = 'Engineering', HourlyRate__c = 80, MaxUnits__c = 100);
        insert resource;

        BryntumProjectType__c projectType = new BryntumProjectType__c(Name = 'Software', ExternalId__c = 'ptype-software');
        insert projectType;
        BryntumProjectStatus__c status = new BryntumProjectStatus__c(Name = 'Active', ExternalId__c = 'pstatus-active', SortOrder__c = 2);
        insert status;

        BryntumProject__c project = new BryntumProject__c(Name = 'Customer Portal', ProjectType__c = projectType.Id, ProjectStatus__c = status.Id, Manager__c = resource.Id, StartDate__c = Date.newInstance(2026, 1, 5), Budget__c = 10000, Calendar__c = calendar.Id);
        insert project;

        BryntumTask__c phase = new BryntumTask__c(Name = 'Design', Project__c = project.Id, OrderIndex__c = 0, StartDate__c = DateTime.newInstanceGmt(2026, 1, 5), EndDate__c = DateTime.newInstanceGmt(2026, 1, 12), Duration__c = 5, DurationUnit__c = 'day', PercentDone__c = 50, Status__c = 'In Progress');
        insert phase;
        BryntumTask__c first = new BryntumTask__c(Name = 'Wireframes', Project__c = project.Id, Parent__c = phase.Id, OrderIndex__c = 0, StartDate__c = DateTime.newInstanceGmt(2026, 1, 5), EndDate__c = DateTime.newInstanceGmt(2026, 1, 7), Duration__c = 2, DurationUnit__c = 'day', PercentDone__c = 100, Status__c = 'Completed');
        BryntumTask__c second = new BryntumTask__c(Name = 'Visual design', Project__c = project.Id, Parent__c = phase.Id, OrderIndex__c = 1, StartDate__c = DateTime.newInstanceGmt(2026, 1, 7), EndDate__c = DateTime.newInstanceGmt(2026, 1, 12), Duration__c = 3, DurationUnit__c = 'day', PercentDone__c = 0, Status__c = 'Not Started');
        insert new List<BryntumTask__c>{ first, second };

        insert new BryntumAssignment__c(Task__c = first.Id, Resource__c = resource.Id, Units__c = 100);
        insert new BryntumDependency__c(FromTask__c = first.Id, ToTask__c = second.Id, Type__c = 'FS', Lag__c = 0, LagUnit__c = 'day', Active__c = true);

        Test.startTest();
        Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(BryntumDashboardController.getPortfolioData());
        Test.stopTest();

        List<Object> projects = (List<Object>) data.get('projects');
        System.assertEquals(1, projects.size(), 'One project is loaded');
        Map<String, Object> projectRow = (Map<String, Object>) projects[0];
        System.assertEquals('Customer Portal', projectRow.get('name'));
        System.assertEquals('Software', projectRow.get('type'), 'The type name comes from the related record');
        System.assertEquals(status.Id, projectRow.get('statusId'));

        System.assertEquals(1, ((List<Object>) data.get('projectTypes')).size());
        System.assertEquals(1, ((List<Object>) data.get('projectStatuses')).size());
        System.assertEquals(1, ((List<Object>) data.get('managers')).size(), 'Project managers are offered as managers');

        List<Object> tasks = (List<Object>) ((Map<String, Object>) data.get('tasks')).get('rows');
        System.assertEquals(4, tasks.size(), 'The project node and its three tasks are loaded');
        Map<String, Object> projectNode = (Map<String, Object>) tasks[0];
        System.assertEquals(project.Id, projectNode.get('id'));
        System.assertEquals(true, projectNode.get('isProject'));

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
        System.assertEquals(1, ((List<Object>) ((Map<String, Object>) calendars[0]).get('intervals')).size());

        List<Object> resources = (List<Object>) ((Map<String, Object>) data.get('resources')).get('rows');
        System.assertEquals(1, resources.size());
    }
}
