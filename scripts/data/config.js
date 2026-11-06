/**
 * Parameters of the generated dashboard dataset.
 *
 * The generator is deterministic: the same config always produces the same records, a different `seed` (or any other
 * change) produces a different dataset. Any top-level value can be overridden from the command line, for example
 * `npm run data:generate -- --seed 7 --projects 4`.
 */
module.exports = {
    // Seed of the pseudo random generator, a number or a string
    seed : 2026,

    // Folder for the generated CSV files, relative to the project root
    outputDir : 'data/generated',

    // Reference date for progress and statuses. Tasks that end before this date are completed, tasks that start after
    // it are not started. Use a fixed date to keep the dataset stable over time, or null for the current date.
    today : '2026-11-06',

    // Projects start between `monthsBeforeToday` months before and `monthsAfterToday` months after `today`
    monthsBeforeToday : 7,
    monthsAfterToday  : 3,

    // Number of accounts, projects are spread over them
    accounts : 8,

    // Number of projects, spread over the project types defined in generate-data.js
    projects : 10,

    // Number of tasks per project, the generator picks a value in the range for each project. Phases (top level) and
    // tasks with subtasks (second level) count as tasks too
    tasksPerProject : { min : 40, max : 80 },

    // Probability that a task gets subtasks (third level of the tree)
    subtaskProbability : 0.25,

    // Number of subtasks for a task that has them
    subtasksPerTask : { min : 2, max : 4 },

    // Duration of a leaf task in working days
    taskDuration : { min : 1, max : 12 },

    // Probability that a task depends on the previous task in its phase (finish-to-start)
    sequentialDependencyProbability : 0.75,

    // Number of extra dependencies between tasks of different phases, per project
    crossPhaseDependencies : { min : 2, max : 6 },

    // Share of dependencies that are start-to-start or finish-to-finish instead of finish-to-start
    nonFinishToStartShare : 0.15,

    // Probability that a dependency gets a lag of 1-3 days
    lagProbability : 0.2,

    // Number of resources in the resource pool
    resources : 50,

    // Share of resources that work part time (max units 50%)
    partTimeShare : 0.1,

    // Number of resources that form a project team. Assignments are drawn from the team, so a small team shared by
    // many projects means a higher chance of overallocation
    teamSize : { min : 6, max : 10 },

    // Assignments per leaf task. The generator picks a number between min and max so that the mean is close to average
    assignmentsPerTask : { min : 1, max : 3, average : 1.6 },

    // Units of an assignment, in percent. One value is picked per assignment
    assignmentUnits : [100, 100, 100, 75, 50],

    // Share of tasks that should have finished before `today` but are late (they stay at 40-90% done)
    lateTaskShare : 0.12,

    // Probability that a leaf task gets a deadline
    deadlineProbability : 0.15,

    // Probability that a leaf task gets a "start no earlier than" constraint
    constraintProbability : 0.08,

    // Probability that a leaf task is rolled up to its parent in the Gantt
    rollupProbability : 0.3,

    // Project budget as a factor of the planned cost, picked between min and max
    budgetFactor : { min : 0.85, max : 1.25 }
};
