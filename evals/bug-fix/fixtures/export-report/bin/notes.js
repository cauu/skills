#!/usr/bin/env node
// Usage: notes export [--file <notes.json>]   prints all notes as CSV
const fs = require('fs');
const path = require('path');
const { toCsv } = require('../src/csv');

const args = process.argv.slice(2);
const fileFlag = args.indexOf('--file');
const file = fileFlag >= 0 ? args[fileFlag + 1] : path.join(__dirname, '..', 'data', 'notes.json');

if (args[0] !== 'export') {
  console.error('usage: notes export [--file <notes.json>]');
  process.exitCode = 2;
} else {
  const notes = JSON.parse(fs.readFileSync(file, 'utf8'));
  process.stdout.write(toCsv(notes));
}
