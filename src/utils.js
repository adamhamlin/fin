'use strict'

const clipboardy = require('clipboardy');
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');

function quit(exitCode) {
    return process.exit(exitCode || 0);
}

function getArrayFromBuffers(bufs) {
    let result = Buffer.concat(bufs).toString().split('\n');
    // Omit trailing newline w/ empty string
    return result.slice(0, result.length - 1);
}

async function executeAction(action, match) {
    const actionToFunctionMap = {
        'Copy match exactly': async function (match) {
            return writeToClipboard(match);
        },
        'Copy absolute path': async function (match) {
            return writeToClipboard(path.resolve(match));
        },
        'Copy file name': async function (match) {
            return writeToClipboard(path.basename(match));
        },
        'Copy directory name': async function (match) {
            return writeToClipboard(path.basename(match));
        },
        'Copy link name': async function (match) {
            return writeToClipboard(path.basename(match));
        },
        'Copy name': async function (match) {
            return writeToClipboard(path.basename(match));
        },
        'Copy parent directory path': async function (match) {
            return writeToClipboard(path.dirname(match));
        },
        'Copy file contents': async function (match) {
            let contents = await fs.readFile(match, 'utf8');
            if (!contents) {
                throw new Error(`File ${path.basename(match)} is empty!`);
            }
            return writeToClipboard(contents);
        },
        'Open file in editor': async function (match) {
            // openEditor([{
            //     file: match,
            //     line: 1,
            //     column: 1
            // }], { editor: process.env.FIN_EDITOR || 'vi' });
            // let editor = openInEditor.configure({
            //     cmd: process.env.FIN_EDITOR || 'vi'
            // }, function(err) {
            //     console.error('Something went wrong: ' + err);
            // });
            // return editor.open(match + ':1:1').then(function() {
            //     console.log('Success!');
            // }, function(err) {
            //     console.error('Something went wrong: ' + err);
            // });
            // let editor = process.env.FIN_EDITOR || 'vi';
            // let child = spawn(editor, [match], {
            //     stdio: 'stdio',
            //     detached: true
            // });
            // child.on('exit', function (e, code) {
            //     console.log("Editor closed!");
            // });
            //shell.exec(`vi ${match}`);
            console.log("NOT IMPLEMENTED!");
        }
    }

    try {
        await actionToFunctionMap[action](match);
        quit();
    } catch (err) {
        console.error('ERROR EXECUTING ACTION! ' + err.message);
    }
}

module.exports = { quit, getArrayFromBuffers, executeAction };

// NON-EXPORTED
async function writeToClipboard(text) {
    return clipboardy.write(text);
}