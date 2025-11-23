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
            loadStyle(this, TASKBOARD + '/svalbard-light.css')
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
            tasksData : data.tasks.rows
        });

        const availableLabels = [
            'Developers',
            'DevOps',
            'QA',
            'UX',
            'Todo',
            'Doing',
            'Review',
            'Done',
            'Low',
            'Medium',
            'High',
            'Critical'
        ];

        const taskboard = new bryntum.taskboard.TaskBoard({
            project,

            appendTo : this.template.querySelector('.container'),

            // This flag is not supported with LockerService
            useDomTransition : false,

            // Field used to link tasks to columns
            columnField : 'category',

            // Initial set of columns
            columns : [
                { id : 'Uncategorized', text : 'Uncategorized', color : 'cyan' },
                { id : 'Bug', text : 'Bug', color : 'blue' },
                { id : 'Feature request', text : 'Feature request', color : 'indigo' },
                { id : 'Internal task', text : 'Internal task', color : 'purple' }
            ],

            swimlanes : [
                { id : 'high', text : 'High', color : 'red' },
                { id : 'medium', text : 'Medium', color : 'yellow' },
                { id : 'low', text : 'Low', color : 'lime' }
            ],

            swimlaneField : 'prio',

            // Headers should stick to the top
            stickyHeaders : true,

            // Opt out of collapsible columns
            showCollapseInHeader : false,

            features : {
                taskMenu : {
                    items : {
                        // Add a custom menu item with a color picker sub menu
                        color : {
                            icon   : 'b-fa-fw b-fa-square',
                            // Adds a separator line above, for nicer look
                            cls    : 'b-separator',
                            text   : 'Color',
                            // Move close to the top
                            weight : 150,
                            menu   : {
                                // Each color gets an item, the key is used as the items `ref` which on purpose matches a
                                // predefined color. Makes it easy to apply the color in the listener below
                                red           : { text : 'Red', icon : 'b-fa-fw b-fa-square b-taskboard-color-red' },
                                pink          : { text : 'Pink', icon : 'b-fa-fw b-fa-square b-taskboard-color-pink' },
                                purple        : { text : 'Purple', icon : 'b-fa-fw b-fa-square b-taskboard-color-purple' },
                                'deep-purple' : { text : 'Deep purple', icon : 'b-fa-fw b-fa-square b-taskboard-color-deep-purple' },
                                indigo        : { text : 'Indigo', icon : 'b-fa-fw b-fa-square b-taskboard-color-indigo' },
                                blue          : { text : 'Blue', icon : 'b-fa-fw b-fa-square b-taskboard-color-blue' },
                                'light-blue'  : { text : 'Light blue', icon : 'b-fa-fw b-fa-square b-taskboard-color-light-blue' },
                                cyan          : { text : 'Cyan', icon : 'b-fa-fw b-fa-square b-taskboard-color-cyan' },
                                teal          : { text : 'Teal', icon : 'b-fa-fw b-fa-square b-taskboard-color-teal' },
                                green         : { text : 'Green', icon : 'b-fa-fw b-fa-square b-taskboard-color-green' },
                                'light-green' : { text : 'Light green', icon : 'b-fa-fw b-fa-square b-taskboard-color-light-green' },
                                lime          : { text : 'Lime', icon : 'b-fa-fw b-fa-square b-taskboard-color-lime' },
                                yellow        : { text : 'Yellow', icon : 'b-fa-fw b-fa-square b-taskboard-color-yellow' },
                                amber         : { text : 'Amber', icon : 'b-fa-fw b-fa-square b-taskboard-color-amber' },
                                orange        : { text : 'Orange', icon : 'b-fa-fw b-fa-square b-taskboard-color-orange' },
                                'deep-orange' : { text : 'Deep orange', icon : 'b-fa-fw b-fa-square b-taskboard-color-deep-orange' }
                            },
                            // Apply picked color to the task
                            onItem({ item, taskRecord }) {
                                taskRecord.eventColor = item.ref;
                            }
                        },
                        // Add another custom item with a label picker
                        labels : {
                            icon   : 'b-fa-fw b-fa-tags',
                            text   : 'Labels',
                            // Create a sub menu with one item per label, starting unchecked
                            menu   : availableLabels.map(label => ({ text : label, checked : false })),
                            // Move below
                            weight : 160,
                            // When clicking an item, all checked items are collected and turned into a labels string applied
                            // to the task record
                            onItem({ item, taskRecord }) {
                                const checkedLabels = [];

                                // Iterate over all label items
                                item.parent.items.forEach(item => {
                                    // Collecting the text of the checked ones
                                    if (item.checked) {
                                        checkedLabels.push(item.text);
                                    }
                                });

                                // Convert the array from above into a comma separated labels string and update the record
                                // with it
                                taskRecord.labels = checkedLabels.join(',');
                            }
                        }
                    },

                    // Function called before showing the menu, allows modifying the items
                    processItems({ taskRecord, columnRecord, items }) {

                        // COLORS

                        const
                            // Grab the color menu
                            { color }    = items,
                            // Current color, color assigned to the task falling back to columns color
                            currentColor = taskRecord.eventColor || columnRecord.color;

                        // Use the current color on the picker menu item
                        color.icon += ` b-taskboard-color-${currentColor}`;
                        // And show a check mark on its item in the sub menu
                        color.menu[currentColor].icon = color.menu[currentColor].icon.replace('square', 'check-square');

                        // LABELS

                        const
                            // Grab the labels menu
                            { labels } = items,
                            // Get currently applied labels as an array
                            currentLabels = taskRecord.labels?.split(',');

                        // Iterate the applied labels, checking their corresponding items in the sub menu
                        currentLabels?.forEach(label => {
                            const menuItem = labels.menu.find(item => item.text === label);
                            if (menuItem) {
                                menuItem.checked = true;
                            }
                        });
                    }
                },

                // Customize the task editor to allow editing our custom fields
                taskEdit : {
                    items : {
                        // Add a combo to pick labels
                        labels : {
                            type      : 'tagcombo',
                            name      : 'labels',
                            label     : 'Labels',
                            separator : ',',
                            items     : availableLabels
                        }
                    }
                }
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

            // Display a menu button in card header
            headerItems : {
                menu : { type : 'taskMenu' }
            },

            // Display category in card body
            bodyItems : {
                labels : { type : 'tags' }
            },

            // Custom task renderer that adds quarter as a CSS class to the card
            taskRenderer({ taskRecord, cardConfig }) {
                cardConfig.class[taskRecord.quarter] = taskRecord.quarter;
            }
        });
    }
}
