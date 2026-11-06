/**
 * Loads the portfolio data for the Bryntum dashboard in the format of the Bryntum project model: calendars, tasks,
 * resources, assignments and dependencies. Projects become top level nodes of the task tree, their tasks are nested
 * under them with the parentId field. Read only.
 */
public with sharing class BryntumDashboardController {
    private static final Map<String, Integer> DEPENDENCY_TYPES = new Map<String, Integer>{
        'SS' => 0,
        'SF' => 1,
        'FS' => 2,
        'FF' => 3
    };

    @AuraEnabled(cacheable=true)
    public static String getPortfolioData() {
        Map<String, Object> result = new Map<String, Object>();
        result.put('calendars', new Map<String, Object>{ 'rows' => loadCalendars() });
        result.put('projects', loadProjects());
        result.put('projectTypes', loadProjectTypes());
        result.put('projectStatuses', loadProjectStatuses());
        result.put('accounts', loadAccounts());
        result.put('managers', loadManagers());
        result.put('tasks', new Map<String, Object>{ 'rows' => loadTasks() });
        result.put('resources', new Map<String, Object>{ 'rows' => loadResources() });
        result.put('assignments', new Map<String, Object>{ 'rows' => loadAssignments() });
        result.put('dependencies', new Map<String, Object>{ 'rows' => loadDependencies() });
        return JSON.serialize(result);
    }

    private static List<Map<String, Object>> loadCalendars() {
        Map<Id, Map<String, Object>> byId = new Map<Id, Map<String, Object>>();
        List<Map<String, Object>> roots = new List<Map<String, Object>>();
        List<BryntumCalendar__c> calendars = [
            SELECT Id, Name, Parent__c, UnspecifiedTimeIsWorking__c,
                (SELECT Id, Name, RecurrentStartDate__c, RecurrentEndDate__c, StartDate__c, EndDate__c, IsWorking__c FROM Intervals__r ORDER BY Name)
            FROM BryntumCalendar__c
            ORDER BY Name
        ];
        for (BryntumCalendar__c calendar : calendars) {
            List<Map<String, Object>> intervals = new List<Map<String, Object>>();
            for (BryntumCalendarInterval__c interval : calendar.Intervals__r) {
                intervals.add(new Map<String, Object>{
                    'id' => interval.Id,
                    'name' => interval.Name,
                    'recurrentStartDate' => interval.RecurrentStartDate__c,
                    'recurrentEndDate' => interval.RecurrentEndDate__c,
                    'startDate' => interval.StartDate__c,
                    'endDate' => interval.EndDate__c,
                    'isWorking' => interval.IsWorking__c
                });
            }
            byId.put(calendar.Id, new Map<String, Object>{
                'id' => calendar.Id,
                'name' => calendar.Name,
                'unspecifiedTimeIsWorking' => calendar.UnspecifiedTimeIsWorking__c,
                'intervals' => intervals,
                'children' => new List<Map<String, Object>>()
            });
        }
        for (BryntumCalendar__c calendar : calendars) {
            Map<String, Object> row = byId.get(calendar.Id);
            if (calendar.Parent__c != null && byId.containsKey(calendar.Parent__c)) {
                ((List<Map<String, Object>>) byId.get(calendar.Parent__c).get('children')).add(row);
            }
            else {
                roots.add(row);
            }
        }
        return roots;
    }

    private static List<Map<String, Object>> loadProjects() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        for (BryntumProject__c project : [
            SELECT Id, Name, ProjectType__c, ProjectType__r.Name, ProjectStatus__c, ProjectStatus__r.Name, Manager__c, Manager__r.Name,
                Account__c, Account__r.Name, StartDate__c, EndDate__c, Budget__c, Calendar__c, HoursPerDay__c, DaysPerWeek__c,
                DaysPerMonth__c, Description__c
            FROM BryntumProject__c
            ORDER BY StartDate__c, Name
        ]) {
            rows.add(new Map<String, Object>{
                'id' => project.Id,
                'name' => project.Name,
                'typeId' => project.ProjectType__c,
                'type' => project.ProjectType__r?.Name,
                'statusId' => project.ProjectStatus__c,
                'status' => project.ProjectStatus__r?.Name,
                'managerId' => project.Manager__c,
                'manager' => project.Manager__r?.Name,
                'accountId' => project.Account__c,
                'account' => project.Account__r?.Name,
                'startDate' => project.StartDate__c,
                'endDate' => project.EndDate__c,
                'budget' => project.Budget__c,
                'calendar' => project.Calendar__c,
                'hoursPerDay' => project.HoursPerDay__c,
                'daysPerWeek' => project.DaysPerWeek__c,
                'daysPerMonth' => project.DaysPerMonth__c,
                'description' => project.Description__c
            });
        }
        return rows;
    }

    private static List<Map<String, Object>> loadProjectTypes() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        for (BryntumProjectType__c projectType : [SELECT Id, Name, Description__c FROM BryntumProjectType__c ORDER BY Name]) {
            rows.add(new Map<String, Object>{ 'id' => projectType.Id, 'name' => projectType.Name, 'description' => projectType.Description__c });
        }
        return rows;
    }

    private static List<Map<String, Object>> loadProjectStatuses() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        for (BryntumProjectStatus__c status : [SELECT Id, Name, SortOrder__c, IsClosed__c FROM BryntumProjectStatus__c ORDER BY SortOrder__c, Name]) {
            rows.add(new Map<String, Object>{ 'id' => status.Id, 'name' => status.Name, 'sortOrder' => status.SortOrder__c, 'isClosed' => status.IsClosed__c });
        }
        return rows;
    }

    private static List<Map<String, Object>> loadAccounts() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        for (Account account : [SELECT Id, Name FROM Account ORDER BY Name LIMIT 500]) {
            rows.add(new Map<String, Object>{ 'id' => account.Id, 'name' => account.Name });
        }
        return rows;
    }

    // Resources that can manage a project
    private static List<Map<String, Object>> loadManagers() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        for (BryntumResource__c resource : [SELECT Id, Name, Department__c FROM BryntumResource__c WHERE Role__c = 'Project Manager' ORDER BY Name]) {
            rows.add(new Map<String, Object>{ 'id' => resource.Id, 'name' => resource.Name, 'department' => resource.Department__c });
        }
        return rows;
    }

    private static List<Map<String, Object>> loadTasks() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        Integer projectIndex = 0;
        // Projects are the top level nodes of the task tree
        for (BryntumProject__c project : [SELECT Id, Name, ProjectStatus__r.Name, Calendar__c FROM BryntumProject__c ORDER BY StartDate__c, Name]) {
            rows.add(new Map<String, Object>{
                'id' => project.Id,
                'name' => project.Name,
                'projectId' => project.Id,
                'isProject' => true,
                'status' => project.ProjectStatus__r?.Name,
                'orderedParentIndex' => projectIndex++,
                'expanded' => true
            });
        }
        for (BryntumTask__c task : [
            SELECT Id, Name, Project__c, Parent__c, OrderIndex__c, StartDate__c, EndDate__c, Duration__c, DurationUnit__c, Effort__c,
                PercentDone__c, Priority__c, Complexity__c, Status__c, Cost__c, ConstraintType__c, ConstraintDate__c, Deadline__c,
                ManuallyScheduled__c, Rollup__c, ShowInTimeline__c, Calendar__c, Note__c
            FROM BryntumTask__c
            ORDER BY OrderIndex__c
        ]) {
            rows.add(new Map<String, Object>{
                'id' => task.Id,
                'name' => task.Name,
                'projectId' => task.Project__c,
                'parentId' => task.Parent__c != null ? task.Parent__c : task.Project__c,
                'orderedParentIndex' => task.OrderIndex__c,
                'startDate' => task.StartDate__c,
                'endDate' => task.EndDate__c,
                'duration' => task.Duration__c,
                'durationUnit' => task.DurationUnit__c,
                'effort' => task.Effort__c,
                'effortUnit' => 'hour',
                'percentDone' => task.PercentDone__c,
                'priority' => task.Priority__c,
                'complexity' => task.Complexity__c,
                'status' => task.Status__c,
                'plannedCost' => task.Cost__c,
                'constraintType' => task.ConstraintType__c,
                'constraintDate' => task.ConstraintDate__c,
                'deadlineDate' => task.Deadline__c,
                'manuallyScheduled' => task.ManuallyScheduled__c,
                'rollup' => task.Rollup__c,
                'showInTimeline' => task.ShowInTimeline__c,
                'calendar' => task.Calendar__c,
                'note' => task.Note__c,
                // Phases (tasks directly under a project) are expanded, task groups are collapsed
                'expanded' => task.Parent__c == null
            });
        }
        return rows;
    }

    private static List<Map<String, Object>> loadResources() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        for (BryntumResource__c resource : [
            SELECT Id, Name, Role__c, Department__c, City__c, Email__c, HourlyRate__c, MaxUnits__c, Calendar__c
            FROM BryntumResource__c
            ORDER BY Department__c, Name
        ]) {
            rows.add(new Map<String, Object>{
                'id' => resource.Id,
                'name' => resource.Name,
                'role' => resource.Role__c,
                'department' => resource.Department__c,
                'city' => resource.City__c,
                'email' => resource.Email__c,
                'hourlyRate' => resource.HourlyRate__c,
                'maxUnits' => resource.MaxUnits__c,
                'calendar' => resource.Calendar__c
            });
        }
        return rows;
    }

    private static List<Map<String, Object>> loadAssignments() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        for (BryntumAssignment__c assignment : [SELECT Id, Task__c, Resource__c, Units__c FROM BryntumAssignment__c WHERE Resource__c != null]) {
            rows.add(new Map<String, Object>{
                'id' => assignment.Id,
                'event' => assignment.Task__c,
                'resource' => assignment.Resource__c,
                'units' => assignment.Units__c
            });
        }
        return rows;
    }

    private static List<Map<String, Object>> loadDependencies() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        for (BryntumDependency__c dependency : [
            SELECT Id, FromTask__c, ToTask__c, Type__c, Lag__c, LagUnit__c, Active__c
            FROM BryntumDependency__c
            WHERE FromTask__c != null AND ToTask__c != null
        ]) {
            rows.add(new Map<String, Object>{
                'id' => dependency.Id,
                'fromEvent' => dependency.FromTask__c,
                'toEvent' => dependency.ToTask__c,
                'type' => DEPENDENCY_TYPES.containsKey(dependency.Type__c) ? DEPENDENCY_TYPES.get(dependency.Type__c) : 2,
                'lag' => dependency.Lag__c,
                'lagUnit' => dependency.LagUnit__c,
                'active' => dependency.Active__c
            });
        }
        return rows;
    }
}
