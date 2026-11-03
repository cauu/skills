// Export notes as CSV: a header line, then one line per note.
function exportCsv(notes) {
  const rows = notes.map((n) => [n.id, n.title, n.body].join(','));
  return ['id,title,body', ...rows].join('\n');
}

module.exports = { exportCsv };
