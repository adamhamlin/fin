'use strict'

const blessed = require('blessed');
const fs = require('fs-extra');
const _ = require('lodash');
const Utils = require('./utils');
const ActionsList = require('./actions-list');
const screen = require('./screen');

const defaultConfig = {
    keys: true,
    vi: true,
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
    label: 'Matches',
    width: '79%',
    height: '100%',
    border: {type: 'line', fg: 'cyan'},
    columnSpacing: 10, //in chars,
    columnWidth: [16, 12, 12], /*in chars*/
};

function mapMatches(matches) {
    return matches.map(match => {
        return {
            match: match,
            type: fs.stat(match).then(res => {
                if (res.isFile()) {
                    return 'file';
                } else if (res.isDirectory()) {
                    return 'directory';
                } else if (res.isSymbolicLink()) {
                    return 'link';
                } else {
                    return 'other';
                }
            }).catch(err => 'other')
        };
    });
}

function getSearchFn(config) {
    return callback => {
        let prompt = blessed.prompt({
            parent: config.parent,
            height: '100%',
            width: '21%',
            keys: true,
            vi: true,
            tags: true,
            border: { type: 'line', fg: 'cyan' }
        });
        prompt.input('Enter search string:', '', (err, value) => {
            prompt.destroy();
            if (!err) {
                return callback(null, value);
            }
        });
    }
}

/**
 * Class depicting a list of file system matches
 */
class MatchesList extends blessed.list {
    constructor(matches, config) {
        config = _.merge({}, defaultConfig, config || {});
        config.search = getSearchFn(config);
        super(config);
        this.config = config;
        this.matches = matches;
        this.matchesData = mapMatches(matches);
        this.actionsList = null;
        // Set list, bind watchers, and display
        this.setItems(matches);
        this.on('select', this.selectMatch);
        this.key('right', this.selectMatch);
        this.key('left', Utils.quit);
        this.focus();
        screen.render();
    }

    appendMatches(matches) {
        if (matches.length) {
            this.spliceItem(this.matches.length, 0, ...matches);
            this.matches = this.matches.concat(matches);
            this.matchesData = this.matchesData.concat(mapMatches(matches));
            screen.render();
        }
    }

    getSelectedMatch() {
        return this.matchesData[this.selected];
    }

    async getSelectedMatchType() {
        return await this.getSelectedMatch().type;
    }

    onActionListCancel() {
        this.actionsList = null;
        this.focus();
    }

    async selectMatch() {
        this.actionsList = new ActionsList(
            this.getSelectedMatch().match,
            await this.getSelectedMatchType(),
            this.onActionListCancel.bind(this),
            { parent: this.config.parent }
        );
    }
}

module.exports = MatchesList;