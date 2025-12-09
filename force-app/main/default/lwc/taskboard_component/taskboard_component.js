/* globals bryntum : true */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import TASKBOARD from '@salesforce/resourceUrl/bryntum_taskboard';
import data from './data/data';

export default class Taskboard_component extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, TASKBOARD + '/taskboard.lwc.module.js'),
            loadStyle(this, TASKBOARD + '/taskboard.css'),
            loadStyle(this, TASKBOARD + '/svalbard-light.css'),
            loadStyle(this, TASKBOARD + '/fontawesome/css/fontawesome.css'),
            loadStyle(this, TASKBOARD + '/fontawesome/css/solid.css')
        ])
            .then(() => {
                console.log(`Bryntum Core version: ${bryntum.getVersion('core')}`);
                this.createTaskBoard();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title   : 'Error loading Bryntum Task Board',
                        message : error,
                        variant : 'error'
                    })
                );
            });
    }

    createTaskBoard() {
        const project = new bryntum.taskboard.ProjectModel({
            tasks : data.tasks.rows
        });

        const taskboard = new bryntum.taskboard.TaskBoard({
            project,

            appendTo : this.template.querySelector('.container'),

            // Apply shared demo styling to put it in a nice box
            cls : 'demo-app',

            // Experimental, transition moving cards using the editor
            useDomTransition : true,

            features : {
                columnDrag   : true,
                swimlaneDrag : true
            },

            columns : [
                'todo',
                'doing',
                'done'
            ],

            columnField : 'status',

            swimlanes : [
                { id : 'high', text : 'High', color : 'red' },
                { id : 'medium', text : 'Medium', color : 'orange' },
                { id : 'low', text : 'Low', color : 'lime' }
            ],

            swimlaneField : 'prio',

            footerItems : {
                resourceAvatars : { overlap : true }
            },

            tbar : [
                // Field for filtering tasks
                { type : 'taskfilterfield' },
                // Field for filtering columns
                { type : 'columnfilterfield' },
                // Field for filtering swimlanes
                { type : 'swimlanefilterfield' },
                // Move the last items to the right
                '->',
                // Button to pick which columns are shown
                { type : 'columnpickerbutton' },
                // Button to pick which swimlanes are shown
                { type : 'swimlanepickerbutton' }
            ],

            // Since each column has its own store chained from the project's taskStore, filtering the master must be chained
            chainFilters : true
        });
    }
}
