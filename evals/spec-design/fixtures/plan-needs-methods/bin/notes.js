#!/usr/bin/env node
const { loadNotes } = require('../src/store');

const [command] = process.argv.slice(2);
if (command === 'list') {
  for (const note of loadNotes()) console.log(`${note.id}  ${note.title}`);
} else {
  console.error('usage: notes list');
  process.exit(2);
}
