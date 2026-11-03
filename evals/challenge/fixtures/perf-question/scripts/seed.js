#!/usr/bin/env node
// Write N generated notes to a JSON file: node scripts/seed.js <count> <file>
const fs = require('fs');
const path = require('path');

const [count = '100', file = 'data/notes.json'] = process.argv.slice(2);
const notes = Array.from({ length: Number(count) }, (_, i) => ({
  id: i + 1,
  title: `Note ${i + 1}`,
  body: 'lorem ipsum dolor sit amet '.repeat(20),
}));
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(notes));
console.log(`wrote ${notes.length} notes to ${file}`);
