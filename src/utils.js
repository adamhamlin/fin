'use strict'

const clipboardy = require('clipboardy');
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const Actions = require('./constants').Actions;

function quit(exitCode) {
    return process.exit(exitCode || 0);
}

function getArrayFromBuffers(bufs) {
    let result = Buffer.concat(bufs).toString().split('\n');
    return _.dropRightWhile(result, el => el === '');
}

async function executeAction(action, match) {
    const actionToFunctionMap = {
        [Actions.COPY_MATCH_EXACTLY]: async function (match) {
            return writeToClipboard(match);
        },
        [Actions.COPY_ABSOLUTE_PATH]: async function (match) {
            return writeToClipboard(path.resolve(match));
        },
        [Actions.COPY_RELATIVE_PATH]: async function (match) {
            return writeToClipboard(path.relative('', match));
        },
        [Actions.COPY_FILE_NAME]: copyBasename,
        [Actions.COPY_DIRECTORY_NAME]: copyBasename,
        [Actions.COPY_LINK_NAME]: copyBasename,
        [Actions.COPY_NAME]: copyBasename,
        [Actions.COPY_PARENT_DIRECTORY_PATH]: async function (match) {
            return writeToClipboard(path.dirname(match));
        },
        [Actions.COPY_FILE_CONTENTS]: async function (match) {
            let contents = await fs.readFile(match, 'utf8');
            if (!contents) {
                throw new Error('Selected file is empty!');
            }
            return writeToClipboard(contents);
        },
        [Actions.OPEN_FILE_IN_EDITOR]: async function (match) {
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
            //     console.log('Editor closed!');
            // });
            //shell.exec(`vi ${match}`);
            throw new Error('NOT IMPLEMENTED!');
        }
    }

    await actionToFunctionMap[action](match);
    quit();
}

module.exports = { quit, getArrayFromBuffers, executeAction };

// NON-EXPORTED
async function writeToClipboard(text) {
    return clipboardy.write(_.trimEnd(text));
}

async function copyBasename(match) {
    return writeToClipboard(path.basename(match));
}