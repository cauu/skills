function exportCsv(notes) {
  return ['title,body', ...notes.map((n) => `${n.title},${n.body}`)].join('\n');
}

module.exports = { exportCsv };
