const fs = require('fs');
const path = require('path');

const DEFAULT = path.join(__dirname, '..', 'data', 'notes.json');

function dataFile(options) {
  return options.data || process.env.NOTES_DATA || DEFAULT;
}

function load(options) {
  const file = dataFile(options);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
}

function save(options, notes) {
  const file = dataFile(options);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(notes, null, 2) + '\n');
}

module.exports = { load, save };
