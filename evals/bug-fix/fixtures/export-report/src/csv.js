// CSV export of notes. One header row, then one row per note, in file order.
const COLUMNS = ['id', 'title', 'created'];

function field(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(notes) {
  const rows = [COLUMNS.join(',')];
  for (const note of notes) {
    rows.push(COLUMNS.map((column) => field(note[column])).join(','));
  }
  return rows.join('\n') + '\n';
}

module.exports = { toCsv };
