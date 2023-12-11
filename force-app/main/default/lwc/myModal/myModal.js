/* globals bryntum : true */
import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import GRID from '@salesforce/resourceUrl/bryntum_grid';
import { columns, data } from './data';

export default class MyModal extends LightningModal {
    @api content;

    handleOkay() {
        this.close('okay');
    }

    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, GRID + '/grid.lwc.module.js'),
            loadStyle(this, GRID + '/grid.stockholm.css')
        ]).then(() => {
            console.log(`Bryntum Core version: ${bryntum.getVersion('core')}`);
            this.createGrid();
        }).catch(error => {
            console.warn(error);
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