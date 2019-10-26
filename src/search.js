'use strict'

const blessed = require('blessed');
const _ = require('lodash');
const screen = require('./screen');

const SEARCH_INSTRUCTIONS = 'n => goto next match\nup => new search';

const defaultConfig = {
    height: '100%',
    width: '21%',
    keys: true,
    vi: true,
    tags: true,
    label: 'Search',
    content: '\n  Enter regex:',
    border: { type: 'line', fg: 'cyan' },
    columnSpacing: 10, //in chars,
    columnWidth: [16, 12, 12] /*in chars*/
};

/**
 * Class depicting a search box
 */
class Search extends blessed.box {
    constructor(matches, highlightMatch, onCancel, selectMatch, config) {
        config = _.merge({}, defaultConfig, config || {});
        super(config);
        this.config = config;
        this._input = blessed.textbox({
            parent: this,
            top: 4,
            height: 1,
            left: 2,
            right: 2,
            fg: 'white'
        });
        this._info = blessed.box({
            parent: this,
            bottom: 4,
            height: 3,
            left: 2,
            right: 2
        });
        this.matches = matches;
        this.currentHit = null;
        this.currentHitIndex;
        this.hits = [];
        this.highlightMatch = highlightMatch;
        this.onCancel = onCancel;
        this.selectMatch = selectMatch;
        // Bind watchers, display, and readInput
        this.key('n', this.nextHit);
        this.key('up', this.search);
        this.key('left', this.cancel);
        this.key('right', () => {
            this.cancel();
            this.selectMatch()
        });
        this.key('enter', () => {
            this.cancel();
            this.selectMatch()
        });
        this.focus();
        screen.render();
        this.search();
    }

    search() {
        this._input.clearValue();
        this._info.setContent('');
        screen.render();
        this._input.readInput((err, searchText) => {
            if (!err) {
                try {
                    let regex = new RegExp(searchText);
                    this.hits = this.matches.reduce((accumulator, match, index) => {
                        if (regex.test(match)) {
                            accumulator.push({ match: match, index: index });
                        }
                        return accumulator;
                    }, []);
                    if (this.hits.length) {
                        this.currentHitIndex = -1;
                        this.nextHit();
                    } else {
                        this.setInfoContent(`No hits for regex!\n${SEARCH_INSTRUCTIONS}`);
                    }
                } catch (err) {
                    this.setInfoContent(`Invalid regex!\n${SEARCH_INSTRUCTIONS}`);
                }
            }
        });
    }

    nextHit() {
        if (this.currentHitIndex !== undefined) {
            if (++this.currentHitIndex === this.hits.length) {
                this.currentHitIndex = 0;
            }
            this.currentHit = this.hits[this.currentHitIndex];
            this.highlightMatch(this.currentHit.index);
            this.setInfoContent(`Match ${this.currentHitIndex + 1} of ${this.hits.length}\n${SEARCH_INSTRUCTIONS}`);
        }
    }

    setInfoContent(content) {
        this._info.setContent(content);
        screen.render();
    }

    cancel() {
        this._input.destroy();
        this._info.destroy();
        this.destroy();
        this.onCancel();
        screen.render();
    }
}

module.exports = Search;