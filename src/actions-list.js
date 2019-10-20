'use strict'

const blessed = require('blessed');
const _ = require('lodash');
const Utils = require('./utils');
const Actions = require('./constants').Actions;
const screen = require('./screen');


const defaultConfig = {
    keys: true,
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
    label: 'Actions',
    width: '21%',
    height: '100%',
    border: { type: 'line', fg: 'cyan' },
    columnSpacing: 10, //in chars,
    columnWidth: [16, 12, 12] /*in chars*/
};

const actions = {
    file: [
        Actions.COPY_MATCH_EXACTLY,
        Actions.COPY_ABSOLUTE_PATH,
        Actions.COPY_FILE_NAME,
        Actions.COPY_FILE_CONTENTS,
        Actions.COPY_PARENT_DIRECTORY_PATH
    ],
    directory: [
        Actions.COPY_MATCH_EXACTLY,
        Actions.COPY_ABSOLUTE_PATH,
        Actions.COPY_DIRECTORY_NAME,
        Actions.COPY_PARENT_DIRECTORY_PATH
    ],
    link: [
        Actions.COPY_MATCH_EXACTLY,
        Actions.COPY_ABSOLUTE_PATH,
        Actions.COPY_PARENT_DIRECTORY_PATH
    ],
    other: [
        Actions.COPY_MATCH_EXACTLY,
        Actions.COPY_ABSOLUTE_PATH,
        Actions.COPY_PARENT_DIRECTORY_PATH
    ]
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
        // If path is absolute, swap in the COPY_RELATIVE_PATH action
        if (_.startsWith(match, '/')) {
            this.actions = _.clone(this.actions);
            this.actions.splice(this.actions.indexOf(Actions.COPY_ABSOLUTE_PATH), 1, Actions.COPY_RELATIVE_PATH);
        }
        this.onDestroy = onDestroy;
        // Set list, bind watchers, and display
        this.setItems(this.actions);
        this.on('select', this.selectAction);
        this.key('right', this.selectAction);
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