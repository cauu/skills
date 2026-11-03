#!/usr/bin/env node
// Usage: notes list [--page <n>]   prints one page of notes
const fs = require('fs');
const path = require('path');
const { PAGE_SIZE, page, pageCount } = require('../src/paging');

const args = process.argv.slice(2);
if (args[0] !== 'list') {
  console.error('usage: notes list [--page <n>]');
  process.exitCode = 2;
} else {
  const flag = args.indexOf('--page');
  const n = flag >= 0 ? Number(args[flag + 1]) : 1;
  const notes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'notes.json'), 'utf8'));
  const shown = page(notes, n, PAGE_SIZE);
  const first = (n - 1) * PAGE_SIZE;
  shown.forEach((note, i) => console.log(`#${first + i + 1} ${note.title}`));
  console.log(`page ${n} of ${pageCount(notes, PAGE_SIZE)} (${shown.length} shown)`);
}
