/**
 * Loads the portfolio data for the Bryntum dashboard in the format of the Bryntum project model: calendars, tasks,
 * resources, assignments and dependencies. Projects become top level nodes of the task tree, their tasks are nested
 * under them with the parentId field.
 *
 * saveChanges() receives the changes of the Bryntum project (a changeset per store with added, updated and removed
 * rows) and writes them to the custom objects. New records are identified by the $PhantomId Bryntum assigns. The
 * response is a changeset in the same format with the rows that were saved: added rows carry the id of the inserted
 * record, references to new records are resolved to their ids, so that the client can apply it to the project.
 */
public with sharing class BryntumDashboardController {
    private static final Map<String, Integer> DEPENDENCY_TYPES = new Map<String, Integer>{
        'SS' => 0,
        'SF' => 1,
        'FS' => 2,
        'FF' => 3
    };
    private static final Map<Integer, String> DEPENDENCY_CODES = new Map<Integer, String>{
        0 => 'SS',
        1 => 'SF',
        2 => 'FS',
        3 => 'FF'
    };
    private static final String PHANTOM_ID = '$PhantomId';

    // Not cacheable: the dashboard writes back, a cached copy would be stale after a page reload.
    @AuraEnabled
    public static String getPortfolioData() {
        return new Reader().load();
    }

    // Reads run without sharing so that the guest user of the Experience Cloud site, who has no record access, sees
    // the portfolio. The methods live in this inner class because an inner class only applies its sharing mode to
    // its own methods, not to static methods of the outer class.
    private without sharing class Reader {
        public String load() {
            return loadPortfolio();
        }

        public String loadPortfolio() {
            Map<String, Object> result = new Map<String, Object>();
            result.put('calendars', new Map<String, Object>{ 'rows' => loadCalendars() });
            result.put('projects', loadProjects());
            result.put('projectTypes', loadProjectTypes());
            result.put('accounts', loadAccounts());
            result.put('managers', loadManagers());
            result.put('tasks', new Map<String, Object>{ 'rows' => loadTasks() });
            result.put('resources', new Map<String, Object>{ 'rows' => loadResources() });
            result.put('assignments', new Map<String, Object>{ 'rows' => loadAssignments() });
            result.put('dependencies', new Map<String, Object>{ 'rows' => loadDependencies() });
            return JSON.serialize(result);
        }

        public List<Map<String, Object>> loadCalendars() {
            Map<Id, Map<String, Object>> byId = new Map<Id, Map<String, Object>>();
            List<Map<String, Object>> roots = new List<Map<String, Object>>();
            List<BryntumCalendar__c> calendars = [
                SELECT Id, Name, Parent__c, UnspecifiedTimeIsWorking__c,
                    (SELECT Id, Label__c, RecurrentStartDate__c, RecurrentEndDate__c, StartDate__c, EndDate__c, IsWorking__c FROM Intervals__r ORDER BY Name)
                FROM BryntumCalendar__c
                ORDER BY Name
            ];
            for (BryntumCalendar__c calendar : calendars) {
                List<Map<String, Object>> intervals = new List<Map<String, Object>>();
                for (BryntumCalendarInterval__c interval : calendar.Intervals__r) {
                    intervals.add(new Map<String, Object>{
                        'id' => interval.Id,
                        // The label is optional, the timeline prints it in every occurrence of the interval
                        'name' => interval.Label__c == null ? '' : interval.Label__c,
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

        public List<Map<String, Object>> loadProjects() {
            List<Map<String, Object>> rows = new List<Map<String, Object>>();
            for (BryntumProject__c project : [
                SELECT Id, Name, ProjectType__c, ProjectType__r.Name, Status__c, Manager__c, Manager__r.Name,
                    Account__c, Account__r.Name, StartDate__c, EndDate__c, StatusDate__c, Budget__c, Calendar__c, HoursPerDay__c,
                    DaysPerWeek__c, DaysPerMonth__c, Description__c
                FROM BryntumProject__c
                ORDER BY StartDate__c, Name
            ]) {
                rows.add(new Map<String, Object>{
                    'id' => project.Id,
                    'name' => project.Name,
                    'typeId' => project.ProjectType__c,
                    'type' => project.ProjectType__r?.Name,
                    'status' => project.Status__c,
                    'managerId' => project.Manager__c,
                    'manager' => project.Manager__r?.Name,
                    'accountId' => project.Account__c,
                    'account' => project.Account__r?.Name,
                    'startDate' => project.StartDate__c,
                    'endDate' => project.EndDate__c,
                    'statusDate' => project.StatusDate__c,
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

        public List<Map<String, Object>> loadProjectTypes() {
            List<Map<String, Object>> rows = new List<Map<String, Object>>();
            for (BryntumProjectType__c projectType : [SELECT Id, Name, Description__c FROM BryntumProjectType__c ORDER BY Name]) {
                rows.add(new Map<String, Object>{ 'id' => projectType.Id, 'name' => projectType.Name, 'description' => projectType.Description__c });
            }
            return rows;
        }

        public List<Map<String, Object>> loadAccounts() {
            List<Map<String, Object>> rows = new List<Map<String, Object>>();
            for (Account account : [SELECT Id, Name FROM Account ORDER BY Name LIMIT 500]) {
                rows.add(new Map<String, Object>{ 'id' => account.Id, 'name' => account.Name });
            }
            return rows;
        }

        // Resources that can manage a project
        public List<Map<String, Object>> loadManagers() {
            List<Map<String, Object>> rows = new List<Map<String, Object>>();
            for (BryntumResource__c resource : [SELECT Id, Name, Department__c FROM BryntumResource__c WHERE Role__c = 'Project Manager' ORDER BY Name]) {
                rows.add(new Map<String, Object>{ 'id' => resource.Id, 'name' => resource.Name, 'department' => resource.Department__c });
            }
            return rows;
        }

        public List<Map<String, Object>> loadTasks() {
            List<Map<String, Object>> rows = new List<Map<String, Object>>();
            Integer projectIndex = 0;
            // Projects are the top level nodes of the task tree
            for (BryntumProject__c project : [
                SELECT Id, Name, Status__c, Calendar__c, ProjectType__c, Account__c, Manager__c, Budget__c, StatusDate__c
                FROM BryntumProject__c
                ORDER BY StartDate__c, Name
            ]) {
                rows.add(new Map<String, Object>{
                    'id' => project.Id,
                    'name' => project.Name,
                    'projectId' => project.Id,
                    'isProject' => true,
                    'status' => project.Status__c,
                    'typeId' => project.ProjectType__c,
                    'accountId' => project.Account__c,
                    'managerId' => project.Manager__c,
                    'budget' => project.Budget__c,
                    'statusDate' => project.StatusDate__c,
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

        public List<Map<String, Object>> loadResources() {
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

        public List<Map<String, Object>> loadAssignments() {
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

        public List<Map<String, Object>> loadDependencies() {
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
                    'type' => BryntumDashboardController.DEPENDENCY_TYPES.containsKey(dependency.Type__c) ? BryntumDashboardController.DEPENDENCY_TYPES.get(dependency.Type__c) : 2,
                    'lag' => dependency.Lag__c,
                    'lagUnit' => dependency.LagUnit__c,
                    'active' => dependency.Active__c
                });
            }
            return rows;
        }
    }

    // ---------------------------------------------------------------------------------------------------------------
    // Saving
    // ---------------------------------------------------------------------------------------------------------------

    // Saving also runs without sharing, so that the Experience Cloud site can write back when saving is enabled
    // for it. The site components have a "Don't save changes" setting for public demos.
    @AuraEnabled
    public static String saveChanges(String changes) {
        return new Writer().save(changes);
    }

    private without sharing class Writer {
        public String save(String changes) {
            Map<String, Object> pack = (Map<String, Object>) JSON.deserializeUntyped(changes);
            Map<String, Object> response = new Map<String, Object>();
            Savepoint savepoint = Database.setSavepoint();
            try {
                Map<String, Id> ids = new Map<String, Id>();
                // Removals first, children before parents, so that lookups never point at deleted records
                removeDependencies(removedIds(pack, 'dependencies'));
                removeAssignments(removedIds(pack, 'assignments'));
                removeTasks(removedIds(pack, 'tasks'));
                removeResources(removedIds(pack, 'resources'));
                response.put('resources', saveResources(storeChanges(pack, 'resources'), ids));
                response.put('tasks', saveTasks(storeChanges(pack, 'tasks'), ids));
                response.put('assignments', saveAssignments(storeChanges(pack, 'assignments'), ids));
                response.put('dependencies', saveDependencies(storeChanges(pack, 'dependencies'), ids));
            }
            catch (Exception e) {
                Database.rollback(savepoint);
                // setMessage keeps the text readable for the client and for tests
                AuraHandledException failure = new AuraHandledException(e.getMessage());
                failure.setMessage(e.getMessage() + ' (' + e.getTypeName() + ' at ' + e.getLineNumber() + ')');
                throw failure;
            }
            return JSON.serialize(response);
        }

        private Map<String, Object> storeChanges(Map<String, Object> pack, String store) {
            Object value = pack.get(store);
            return value instanceof Map<String, Object> ? (Map<String, Object>) value : new Map<String, Object>();
        }

        private List<Map<String, Object>> rows(Map<String, Object> changes, String key) {
            List<Map<String, Object>> result = new List<Map<String, Object>>();
            Object value = changes.get(key);
            if (value instanceof List<Object>) {
                for (Object row : (List<Object>) value) {
                    result.add((Map<String, Object>) row);
                }
            }
            return result;
        }

        private Set<Id> removedIds(Map<String, Object> pack, String store) {
            Set<Id> result = new Set<Id>();
            for (Map<String, Object> row : rows(storeChanges(pack, store), 'removed')) {
                Id recordId = toId(row.get('id'));
                if (recordId != null) {
                    result.add(recordId);
                }
            }
            return result;
        }

        // The changeset of one store as saved: the added rows with the id of their record, the updated rows, and every
        // reference to a new record (parent task, task, resource) resolved to the id it got. Applied to the Bryntum
        // project, the rows adopt the ids and the saved fields are no longer pending.
        private Map<String, Object> savedChangeset(Map<String, Object> changes, Map<String, Id> ids) {
            return new Map<String, Object>{
                'added' => savedRows(rows(changes, 'added'), ids),
                'updated' => savedRows(rows(changes, 'updated'), ids),
                'removed' => rows(changes, 'removed')
            };
        }

        private List<Map<String, Object>> savedRows(List<Map<String, Object>> rows, Map<String, Id> ids) {
            List<Map<String, Object>> result = new List<Map<String, Object>>();
            for (Map<String, Object> row : rows) {
                Map<String, Object> saved = new Map<String, Object>();
                for (String field : row.keySet()) {
                    Object value = row.get(field);
                    saved.put(field, field != BryntumDashboardController.PHANTOM_ID && value instanceof String && ids.containsKey((String) value) ? ids.get((String) value) : value);
                }
                if (row.containsKey(BryntumDashboardController.PHANTOM_ID)) {
                    saved.put('id', ids.get(String.valueOf(row.get(BryntumDashboardController.PHANTOM_ID))));
                }
                // The position in the tree is not sent back, the client already has it and applying it would move the row
                saved.remove('parentId');
                saved.remove('orderedParentIndex');
                saved.remove('$PhantomParentId');
                result.add(saved);
            }
            return result;
        }

        // Resolves a Bryntum id that may be a phantom id of a record inserted earlier in the same package
        private Id resolveId(Object value, Map<String, Id> ids) {
            if (value == null) {
                return null;
            }
            String key = String.valueOf(value);
            if (ids.containsKey(key)) {
                return ids.get(key);
            }
            Id recordId = toId(value);
            if (recordId == null) {
                throw new DashboardException('Unknown record reference: ' + key);
            }
            return recordId;
        }

        private Id toId(Object value) {
            if (value == null) {
                return null;
            }
            String text = String.valueOf(value);
            if ((text.length() == 15 || text.length() == 18) && text.isAlphanumeric()) {
                try {
                    return (Id) text;
                }
                catch (Exception e) {
                    return null;
                }
            }
            return null;
        }

        private Boolean isProjectId(Id recordId) {
            return recordId != null && recordId.getSObjectType() == BryntumProject__c.SObjectType;
        }

        private Decimal toDecimal(Object value) {
            if (value == null) {
                return null;
            }
            return value instanceof Decimal ? (Decimal) value : Decimal.valueOf(String.valueOf(value));
        }

        private Boolean toBoolean(Object value) {
            return value == null ? null : Boolean.valueOf(value);
        }

        private String toText(Object value) {
            return value == null ? null : String.valueOf(value);
        }

        // Bryntum serializes dates as ISO 8601 strings, with or without a time zone offset
        private DateTime toDateTime(Object value) {
            if (value == null) {
                return null;
            }
            String text = String.valueOf(value);
            try {
                return (DateTime) JSON.deserialize('"' + text + '"', DateTime.class);
            }
            catch (Exception e) {
                return DateTime.valueOf(text.replace('T', ' ').left(19));
            }
        }

        // Bryntum sends local time with an offset (YYYY-MM-DDTHH:mm:ss+hh:mm), the calendar date is the leading part
        private Date toDate(Object value) {
            if (value == null) {
                return null;
            }
            String text = String.valueOf(value);
            if (text.length() >= 10 && Pattern.matches('^\\d{4}-\\d{2}-\\d{2}.*', text)) {
                return Date.valueOf(text.left(10));
            }
            DateTime stamp = toDateTime(value);
            return stamp == null ? null : stamp.date();
        }

        // ---- Resources -------------------------------------------------------------------------------------------------

        private void applyResourceFields(BryntumResource__c resource, Map<String, Object> row) {
            if (row.containsKey('name')) {
                resource.Name = toText(row.get('name'));
            }
            if (row.containsKey('role')) {
                resource.Role__c = toText(row.get('role'));
            }
            if (row.containsKey('department')) {
                resource.Department__c = toText(row.get('department'));
            }
            if (row.containsKey('city')) {
                resource.City__c = toText(row.get('city'));
            }
            if (row.containsKey('email')) {
                resource.Email__c = toText(row.get('email'));
            }
            if (row.containsKey('hourlyRate')) {
                resource.HourlyRate__c = toDecimal(row.get('hourlyRate'));
            }
            if (row.containsKey('maxUnits')) {
                resource.MaxUnits__c = toDecimal(row.get('maxUnits'));
            }
            if (row.containsKey('calendar')) {
                resource.Calendar__c = toId(row.get('calendar'));
            }
        }

        private Map<String, Object> saveResources(Map<String, Object> changes, Map<String, Id> ids) {
            List<Map<String, Object>> added = rows(changes, 'added');
            List<BryntumResource__c> inserts = new List<BryntumResource__c>();
            for (Map<String, Object> row : added) {
                BryntumResource__c resource = new BryntumResource__c(Name = 'New resource');
                applyResourceFields(resource, row);
                inserts.add(resource);
            }
            insert inserts;
            for (Integer i = 0; i < added.size(); i++) {
                ids.put(String.valueOf(added[i].get(BryntumDashboardController.PHANTOM_ID)), inserts[i].Id);
            }

            List<BryntumResource__c> updates = new List<BryntumResource__c>();
            for (Map<String, Object> row : rows(changes, 'updated')) {
                BryntumResource__c resource = new BryntumResource__c(Id = toId(row.get('id')));
                applyResourceFields(resource, row);
                updates.add(resource);
            }
            update updates;
            return savedChangeset(changes, ids);
        }

        private void removeResources(Set<Id> resourceIds) {
            if (resourceIds.isEmpty()) {
                return;
            }
            delete [SELECT Id FROM BryntumAssignment__c WHERE Resource__c IN :resourceIds];
            delete [SELECT Id FROM BryntumResource__c WHERE Id IN :resourceIds];
        }

        // ---- Tasks and project nodes -----------------------------------------------------------------------------------

        private void applyTaskFields(BryntumTask__c task, Map<String, Object> row) {
            if (row.containsKey('name')) {
                task.Name = toText(row.get('name'));
            }
            if (row.containsKey('startDate')) {
                task.StartDate__c = toDateTime(row.get('startDate'));
            }
            if (row.containsKey('endDate')) {
                task.EndDate__c = toDateTime(row.get('endDate'));
            }
            if (row.containsKey('duration')) {
                task.Duration__c = toDecimal(row.get('duration'));
            }
            if (row.containsKey('durationUnit')) {
                task.DurationUnit__c = toText(row.get('durationUnit'));
            }
            if (row.containsKey('effort')) {
                task.Effort__c = toDecimal(row.get('effort'));
            }
            if (row.containsKey('percentDone')) {
                task.PercentDone__c = toDecimal(row.get('percentDone'));
            }
            if (row.containsKey('priority')) {
                task.Priority__c = toText(row.get('priority'));
            }
            if (row.containsKey('complexity')) {
                task.Complexity__c = toText(row.get('complexity'));
            }
            if (row.containsKey('status')) {
                task.Status__c = toText(row.get('status'));
            }
            if (row.containsKey('plannedCost')) {
                task.Cost__c = toDecimal(row.get('plannedCost'));
            }
            if (row.containsKey('constraintType')) {
                task.ConstraintType__c = toText(row.get('constraintType'));
            }
            if (row.containsKey('constraintDate')) {
                task.ConstraintDate__c = toDateTime(row.get('constraintDate'));
            }
            if (row.containsKey('deadlineDate')) {
                task.Deadline__c = toDateTime(row.get('deadlineDate'));
            }
            if (row.containsKey('manuallyScheduled')) {
                task.ManuallyScheduled__c = toBoolean(row.get('manuallyScheduled')) == true;
            }
            if (row.containsKey('rollup')) {
                task.Rollup__c = toBoolean(row.get('rollup')) == true;
            }
            if (row.containsKey('showInTimeline')) {
                task.ShowInTimeline__c = toBoolean(row.get('showInTimeline')) == true;
            }
            if (row.containsKey('calendar')) {
                task.Calendar__c = toId(row.get('calendar'));
            }
            if (row.containsKey('note')) {
                task.Note__c = toText(row.get('note'));
            }
            if (row.containsKey('orderedParentIndex')) {
                task.OrderIndex__c = toDecimal(row.get('orderedParentIndex'));
            }
        }

        // A task directly under a project node has no parent task, its project is the node
        private void applyTaskParent(BryntumTask__c task, Id parentId, Map<Id, Id> projectOfTask) {
            if (isProjectId(parentId)) {
                task.Parent__c = null;
                task.Project__c = parentId;
            }
            else {
                task.Parent__c = parentId;
                if (projectOfTask.containsKey(parentId)) {
                    task.Project__c = projectOfTask.get(parentId);
                }
            }
        }

        private Map<Id, Id> projectsOfParents(Set<Id> parentIds) {
            Map<Id, Id> result = new Map<Id, Id>();
            for (BryntumTask__c parent : [SELECT Id, Project__c FROM BryntumTask__c WHERE Id IN :parentIds]) {
                result.put(parent.Id, parent.Project__c);
            }
            return result;
        }

        private void applyProjectFields(BryntumProject__c project, Map<String, Object> row) {
            if (row.containsKey('name')) {
                project.Name = toText(row.get('name'));
            }
            if (row.containsKey('typeId')) {
                project.ProjectType__c = toId(row.get('typeId'));
            }
            if (row.containsKey('status')) {
                project.Status__c = toText(row.get('status'));
            }
            if (row.containsKey('accountId')) {
                project.Account__c = toId(row.get('accountId'));
            }
            if (row.containsKey('managerId')) {
                project.Manager__c = toId(row.get('managerId'));
            }
            if (row.containsKey('budget')) {
                project.Budget__c = toDecimal(row.get('budget'));
            }
            // The engine rolls the dates of the tasks up to the project node, keep the project record in step
            if (row.containsKey('startDate')) {
                project.StartDate__c = toDate(row.get('startDate'));
            }
            if (row.containsKey('endDate')) {
                project.EndDate__c = toDate(row.get('endDate'));
            }
            if (row.containsKey('statusDate')) {
                project.StatusDate__c = toDate(row.get('statusDate'));
            }
        }

        private Map<String, Object> saveTasks(Map<String, Object> changes, Map<String, Id> ids) {
            List<Map<String, Object>> added = rows(changes, 'added');
            List<BryntumTask__c> inserted = new List<BryntumTask__c>();
            Map<String, BryntumTask__c> byPhantom = new Map<String, BryntumTask__c>();
            // New tasks may be nested under other new tasks, insert level by level until every parent is known
            List<Map<String, Object>> pending = new List<Map<String, Object>>(added);
            while (!pending.isEmpty()) {
                List<Map<String, Object>> ready = new List<Map<String, Object>>();
                List<Map<String, Object>> later = new List<Map<String, Object>>();
                Set<Id> parentIds = new Set<Id>();
                for (Map<String, Object> row : pending) {
                    String parentKey = toText(row.get('parentId'));
                    Id parentId = ids.containsKey(parentKey) ? ids.get(parentKey) : toId(parentKey);
                    if (parentId == null) {
                        later.add(row);
                    }
                    else {
                        ready.add(row);
                        parentIds.add(parentId);
                    }
                }
                if (ready.isEmpty()) {
                    throw new DashboardException('New tasks must be nested under a project or an existing task');
                }
                Map<Id, Id> projectOfTask = projectsOfParents(parentIds);
                List<BryntumTask__c> batch = new List<BryntumTask__c>();
                for (Map<String, Object> row : ready) {
                    BryntumTask__c task = new BryntumTask__c(Name = 'New task', DurationUnit__c = 'day');
                    applyTaskFields(task, row);
                    String parentKey = toText(row.get('parentId'));
                    applyTaskParent(task, ids.containsKey(parentKey) ? ids.get(parentKey) : toId(parentKey), projectOfTask);
                    batch.add(task);
                }
                insert batch;
                for (Integer i = 0; i < ready.size(); i++) {
                    String phantom = String.valueOf(ready[i].get(BryntumDashboardController.PHANTOM_ID));
                    ids.put(phantom, batch[i].Id);
                    byPhantom.put(phantom, batch[i]);
                }
                pending = later;
            }
            for (Map<String, Object> row : added) {
                inserted.add(byPhantom.get(String.valueOf(row.get(BryntumDashboardController.PHANTOM_ID))));
            }

            List<BryntumTask__c> taskUpdates = new List<BryntumTask__c>();
            List<BryntumProject__c> projectUpdates = new List<BryntumProject__c>();
            List<Map<String, Object>> updatedRows = rows(changes, 'updated');
            Set<Id> parentIds = new Set<Id>();
            for (Map<String, Object> row : updatedRows) {
                Id parentId = resolveId(row.get('parentId'), ids);
                if (parentId != null && !isProjectId(parentId)) {
                    parentIds.add(parentId);
                }
            }
            Map<Id, Id> projectOfTask = projectsOfParents(parentIds);
            for (Map<String, Object> row : updatedRows) {
                Id recordId = resolveId(row.get('id'), ids);
                if (isProjectId(recordId)) {
                    BryntumProject__c project = new BryntumProject__c(Id = recordId);
                    applyProjectFields(project, row);
                    projectUpdates.add(project);
                }
                else {
                    BryntumTask__c task = new BryntumTask__c(Id = recordId);
                    applyTaskFields(task, row);
                    if (row.containsKey('parentId')) {
                        applyTaskParent(task, resolveId(row.get('parentId'), ids), projectOfTask);
                    }
                    taskUpdates.add(task);
                }
            }
            update taskUpdates;
            update projectUpdates;
            Map<String, Object> saved = savedChangeset(changes, ids);
            // A task created in the Gantt only knows its parent, the project it belongs to is derived here
            List<Object> savedAdded = (List<Object>) saved.get('added');
            for (Integer i = 0; i < inserted.size(); i++) {
                ((Map<String, Object>) savedAdded[i]).put('projectId', inserted[i].Project__c);
            }
            return saved;
        }

        private void removeTasks(Set<Id> removedIds) {
            Set<Id> projectIds = new Set<Id>();
            Set<Id> taskIds = new Set<Id>();
            for (Id recordId : removedIds) {
                if (isProjectId(recordId)) {
                    projectIds.add(recordId);
                }
                else {
                    taskIds.add(recordId);
                }
            }
            if (!projectIds.isEmpty()) {
                for (BryntumTask__c task : [SELECT Id FROM BryntumTask__c WHERE Project__c IN :projectIds]) {
                    taskIds.add(task.Id);
                }
            }
            // Subtasks go with their parent
            Set<Id> level = new Set<Id>(taskIds);
            for (Integer depth = 0; depth < 20 && !level.isEmpty(); depth++) {
                Set<Id> next = new Set<Id>();
                for (BryntumTask__c child : [SELECT Id FROM BryntumTask__c WHERE Parent__c IN :level AND Id NOT IN :taskIds]) {
                    next.add(child.Id);
                }
                taskIds.addAll(next);
                level = next;
            }
            if (!taskIds.isEmpty()) {
                delete [SELECT Id FROM BryntumAssignment__c WHERE Task__c IN :taskIds];
                delete [SELECT Id FROM BryntumDependency__c WHERE FromTask__c IN :taskIds OR ToTask__c IN :taskIds];
                delete [SELECT Id FROM BryntumTask__c WHERE Id IN :taskIds];
            }
            if (!projectIds.isEmpty()) {
                delete [SELECT Id FROM BryntumProject__c WHERE Id IN :projectIds];
            }
        }

        // ---- Assignments -----------------------------------------------------------------------------------------------

        private void applyAssignmentFields(BryntumAssignment__c assignment, Map<String, Object> row, Map<String, Id> ids) {
            if (row.containsKey('event')) {
                assignment.Task__c = resolveId(row.get('event'), ids);
            }
            if (row.containsKey('resource')) {
                assignment.Resource__c = resolveId(row.get('resource'), ids);
            }
            if (row.containsKey('units')) {
                assignment.Units__c = toDecimal(row.get('units'));
            }
        }

        private Map<String, Object> saveAssignments(Map<String, Object> changes, Map<String, Id> ids) {
            List<Map<String, Object>> added = rows(changes, 'added');
            List<BryntumAssignment__c> inserts = new List<BryntumAssignment__c>();
            for (Map<String, Object> row : added) {
                BryntumAssignment__c assignment = new BryntumAssignment__c(Units__c = 100);
                applyAssignmentFields(assignment, row, ids);
                inserts.add(assignment);
            }
            insert inserts;
            for (Integer i = 0; i < added.size(); i++) {
                ids.put(String.valueOf(added[i].get(BryntumDashboardController.PHANTOM_ID)), inserts[i].Id);
            }
            List<BryntumAssignment__c> updates = new List<BryntumAssignment__c>();
            for (Map<String, Object> row : rows(changes, 'updated')) {
                BryntumAssignment__c assignment = new BryntumAssignment__c(Id = toId(row.get('id')));
                applyAssignmentFields(assignment, row, ids);
                updates.add(assignment);
            }
            update updates;
            return savedChangeset(changes, ids);
        }

        private void removeAssignments(Set<Id> assignmentIds) {
            if (!assignmentIds.isEmpty()) {
                delete [SELECT Id FROM BryntumAssignment__c WHERE Id IN :assignmentIds];
            }
        }

        // ---- Dependencies ----------------------------------------------------------------------------------------------

        private void applyDependencyFields(BryntumDependency__c dependency, Map<String, Object> row, Map<String, Id> ids) {
            if (row.containsKey('fromEvent')) {
                dependency.FromTask__c = resolveId(row.get('fromEvent'), ids);
            }
            if (row.containsKey('toEvent')) {
                dependency.ToTask__c = resolveId(row.get('toEvent'), ids);
            }
            if (row.containsKey('type')) {
                Integer code = toDecimal(row.get('type')).intValue();
                dependency.Type__c = BryntumDashboardController.DEPENDENCY_CODES.containsKey(code) ? BryntumDashboardController.DEPENDENCY_CODES.get(code) : 'FS';
            }
            if (row.containsKey('lag')) {
                dependency.Lag__c = toDecimal(row.get('lag'));
            }
            if (row.containsKey('lagUnit')) {
                dependency.LagUnit__c = toText(row.get('lagUnit'));
            }
            if (row.containsKey('active')) {
                dependency.Active__c = toBoolean(row.get('active')) == true;
            }
        }

        private Map<String, Object> saveDependencies(Map<String, Object> changes, Map<String, Id> ids) {
            List<Map<String, Object>> added = rows(changes, 'added');
            List<BryntumDependency__c> inserts = new List<BryntumDependency__c>();
            for (Map<String, Object> row : added) {
                BryntumDependency__c dependency = new BryntumDependency__c(Type__c = 'FS', Lag__c = 0, LagUnit__c = 'day', Active__c = true);
                applyDependencyFields(dependency, row, ids);
                inserts.add(dependency);
            }
            insert inserts;
            for (Integer i = 0; i < added.size(); i++) {
                ids.put(String.valueOf(added[i].get(BryntumDashboardController.PHANTOM_ID)), inserts[i].Id);
            }
            List<BryntumDependency__c> updates = new List<BryntumDependency__c>();
            for (Map<String, Object> row : rows(changes, 'updated')) {
                BryntumDependency__c dependency = new BryntumDependency__c(Id = toId(row.get('id')));
                applyDependencyFields(dependency, row, ids);
                updates.add(dependency);
            }
            update updates;
            return savedChangeset(changes, ids);
        }

        private void removeDependencies(Set<Id> dependencyIds) {
            if (!dependencyIds.isEmpty()) {
                delete [SELECT Id FROM BryntumDependency__c WHERE Id IN :dependencyIds];
            }
        }
    }

    public class DashboardException extends Exception {}
}
