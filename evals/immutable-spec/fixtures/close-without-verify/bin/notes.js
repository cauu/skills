#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exportCsv } = require('../src/export');

const [command] = process.argv.slice(2);
if (command !== 'export') {
  console.error('usage: notes export');
  process.exit(2);
}
const notes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'notes.json'), 'utf8'));
console.log(exportCsv(notes));
