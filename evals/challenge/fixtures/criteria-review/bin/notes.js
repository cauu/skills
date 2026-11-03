#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { listNotes } = require('../src/list');

const [command] = process.argv.slice(2);
if (command !== 'list') {
  console.error('usage: notes list');
  process.exit(2);
}
const notes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'notes.json'), 'utf8'));
console.log(listNotes(notes));
