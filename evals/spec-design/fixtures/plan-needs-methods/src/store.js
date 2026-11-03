const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'notes.json');

function loadNotes() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

module.exports = { loadNotes };
