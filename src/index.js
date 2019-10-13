'use strict'

const blessed = require('blessed');
const { spawn } = require('child_process');
const Utils = require('./utils');
const MatchesList = require('./matches-list');

let screen = blessed.screen({
    smartCSR: true,
    title: 'FIN'
});

let layout = blessed.layout({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%'
});

// Define global quit actions and render
screen.key(['escape', 'q', 'C-c'], Utils.quit);
screen.render();

let MAX_STREAM_EVENTS = 50; // TODO: figure out a way to increase this indefinitely w/o making sluggish
let INITIAL_EVENT_LIMIT = 5;
let EVENT_CHUNK_SIZE = 10;
let matchesList;
let iter = 1;
let bufs = [];

// Parse cmd line args and execute - assumed to be of form "fin [options][args]"
process.env.FIN_FIND_UTILITY = 'fd'; //remove this
let cmd = process.env.FIN_FIND_UTILITY || 'find';
let child = spawn(cmd, process.argv.slice(2), {stdio: ['ignore', 'pipe', 'pipe']});
child.stdout.on('data', data => {
    bufs.push(data);
    if (iter === 1) {
        let matches = Utils.getArrayFromBuffers(bufs);
        matchesList = new MatchesList(screen, matches, { parent: layout });
        bufs = [];
    } else if (iter <= INITIAL_EVENT_LIMIT || (iter <= MAX_STREAM_EVENTS && iter % EVENT_CHUNK_SIZE === 0)) {
        // Append initial data immediately, then start chunking
        matchesList.appendMatches(Utils.getArrayFromBuffers(bufs));
        bufs = [];
    }
    ++iter;
});
child.stdout.on('end', () => {
    if (iter <= MAX_STREAM_EVENTS) {
        matchesList.appendMatches(Utils.getArrayFromBuffers(bufs));
        bufs = [];
    } else {
        // TODO: Make this better/pretty
        console.log('TOO MANY RESULTS -- ONLY DISPLAYING FIRST ' + matchesList.matches.length + ' RESULTS');
    }
});
child.stderr.on('data', function (data) {
    // TODO: Figure out something else to do with error data
    console.log('stderr: ' + data.toString());
});

// GENERAL TODO:
// - Display bars with tool name, info, messages, etc.
// - More action options?
// - Figure out if this can work with sudo