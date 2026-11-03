const fs = require('fs');

// Loads every note into memory at startup.
function loadNotes(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

module.exports = { loadNotes };
