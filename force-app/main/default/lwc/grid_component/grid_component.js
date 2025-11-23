/* globals bryntum : true */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import GRID from '@salesforce/resourceUrl/bryntum_grid';
import { columns, data } from './data';

export default class Grid_component extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, GRID + '/grid.lwc.module.js'),
            loadStyle(this, GRID + '/grid.css'),
            loadStyle(this, GRID + '/svalbard-light.css')
        ]).then(() => {
            console.log(`Bryntum Core version: ${bryntum.getVersion('core')}`);
            this.createGrid();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Bryntum Grid',
                    message: error,
                    variant: 'error'
                })
            );
        });
    }

    createGrid() {
        window.grid = new bryntum.grid.Grid({
            features: {
                rowReorder: true,
                search: true
            },
            appendTo: this.template.querySelector('.container'),
            store : {
                fields : [
                    { name : 'start', type : 'date' }
                ],
                data
            },
            columns
        });
    }
}
