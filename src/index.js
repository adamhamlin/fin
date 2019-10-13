'use strict'

const blessed = require('blessed');
const { spawn } = require('child_process');
const Utils = require('./utils');
const MatchesList = require('./matches-list');

let screen = blessed.screen({
    smartCSR: true,
    title: 'FIN'
});

let baseLayout = blessed.layout({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%'
});

let header = blessed.box({
    parent: baseLayout,
    width: '100%',
    tags: true,
    content: '{center}FIN{/center}',
    border: {type: "line", fg: "cyan"}
});

let contentLayout = blessed.layout({
    parent: baseLayout,
    width: '100%',
    height: 'shrink'
});

// Define global quit actions and render
screen.key(['escape', 'q', 'C-c'], Utils.quit);
screen.render();

let MAX_MATCHES = 1000; // No real benefit in working to increase this
let INITIAL_ITERS = 5;
let STREAM_EVENT_CHUNK_SIZE = 10;
let matchesList;
let iter = 0;
let numMatches = 0;
let bufs = [];

// Parse cmd line args and execute - assumed to be of form "fin [options][args]"
process.env.FIN_FIND_UTILITY = 'fd'; //remove this
let cmd = process.env.FIN_FIND_UTILITY || 'find';
let child = spawn(cmd, process.argv.slice(2), {stdio: ['ignore', 'pipe', 'pipe']});
child.stdout.on('data', data => {
    ++iter;
    bufs.push(data);
    // Process initial data immediately, then start chunking
    if (iter <= INITIAL_ITERS || (numMatches <= MAX_MATCHES && iter % STREAM_EVENT_CHUNK_SIZE === 0)) {
        let matches = Utils.getArrayFromBuffers(bufs);
        if (iter === 1) {
            matchesList = new MatchesList(screen, matches, { parent: contentLayout });
        } else {
            matchesList.appendMatches(matches);
        }
        bufs = [];
        numMatches += matches.length;
    }
});
child.stdout.on('end', () => {
    if (numMatches === 0) {
        // Empty result set, just fail
        screen.destroy();
        console.log('No results for: "' + [cmd].concat(process.argv.slice(2)).join(' ') + '"\nPlease refine your search.');
    } else if (numMatches <= MAX_MATCHES) {
        matchesList.appendMatches(Utils.getArrayFromBuffers(bufs));
    } else {
        console.log('ONLY DISPLAYING FIRST ' + matchesList.matches.length + ' RESULTS');
    }
    bufs = [];
});
child.stderr.on('data', function (data) {
    // TODO: Figure out something else to do with error data
    console.log('stderr: ' + data.toString());
});

// GENERAL TODO:
// - Display bars with info, messages, etc.? Make pretty
// - More action options?
// - Figure out if this can work with sudo
// - Consolidate some of the configuration options e.g. styling