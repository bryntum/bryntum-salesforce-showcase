import ganttToolbarInitializer from './GanttToolbar.js';
import resourceGridToolbarInitializer from './ResourceGridToolbar.js';
import statusColumnInitializer from './StatusColumn.js';
import complexityColumnInitializer from './ComplexityColumn.js';
import complexityComboInitializer from './ComplexityCombo.js';

export default function initWidgets() {
    ganttToolbarInitializer();
    resourceGridToolbarInitializer();
    statusColumnInitializer();
    complexityColumnInitializer();
    complexityComboInitializer();
}