'use strict'

const blessed = require('blessed');
const _ = require('lodash');
const Utils = require('./utils');
const screen = require('./screen');


const defaultConfig = {
    keys: true,
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
    label: 'Actions',
    width: '25%',
    height: '100%',
    border: {type: "line", fg: "cyan"},
    columnSpacing: 10, //in chars,
    columnWidth: [16, 12, 12] /*in chars*/
};

const actions = {
    file: ['Copy match exactly', 'Copy absolute path', 'Copy file name', 'Copy parent directory path', 'Copy file contents'],
    directory: ['Copy match exactly', 'Copy absolute path', 'Copy directory name', 'Copy parent directory path'],
    link: ['Copy match exactly', 'Copy absolute path', 'Copy parent directory path'],
    other: ['Copy match exactly', 'Copy absolute path', 'Copy parent directory path']
};

/**
 * Class depicting a list of actions available for a given file system item
 */
class ActionsList extends blessed.list {
    constructor(match, matchType, onDestroy, config) {
        config = _.merge({}, defaultConfig, config || {});
        super(config);
        this.config = config;
        this.match = match;
        this.matchType = matchType;
        this.actions = actions[matchType];
        this.onDestroy = onDestroy;
        // Set list, bind watchers, and display
        this.setItems(this.actions);
        this.on('select', this.selectAction);
        this.key('left', this.cancel);
        this.focus();
        screen.render();
    }

    getSelectedAction() {
        return this.actions[this.selected];
    }

    async selectAction() {
        await Utils.executeAction(this.getSelectedAction(), this.match);
    }

    cancel() {
        this.destroy();
        this.onDestroy();
        screen.render();
    }
}

module.exports = ActionsList;