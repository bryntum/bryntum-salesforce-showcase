import { LightningElement, api } from 'lwc';

/**
 * The portfolio for an Experience Cloud page: a button bar that switches between the overview (KPI tiles and
 * charts), the projects grid, the Gantt timeline and the resource histogram. The views are editable and save to
 * Salesforce unless the page is configured otherwise, a public demo would disable saving.
 */
export default class Bryntum_workspace extends LightningElement {
    @api readOnly = false;
    @api disableSave = false;
    view = 'overview';

    views = [
        { name: 'overview', label: 'Overview' },
        { name: 'projects', label: 'Projects' },
        { name: 'timeline', label: 'Timeline' },
        { name: 'resources', label: 'Resources' }
    ];

    get viewButtons() {
        return this.views.map((view) => ({
            ...view,
            variant: view.name === this.view ? 'brand' : 'neutral'
        }));
    }

    get isOverview() {
        return this.view === 'overview';
    }

    get isProjects() {
        return this.view === 'projects';
    }

    get isTimeline() {
        return this.view === 'timeline';
    }

    get isResources() {
        return this.view === 'resources';
    }

    handleViewClick(event) {
        this.view = event.currentTarget.dataset.view;
    }
}
