'use strict'

const blessed = require('blessed');

// Want this available globally for rendering
module.exports = blessed.screen({
    smartCSR: true,
    title: 'FRAP'
});