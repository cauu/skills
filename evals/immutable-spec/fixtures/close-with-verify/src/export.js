function csvField(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportCsv(notes) {
  return ['title,body', ...notes.map((n) => `${csvField(n.title)},${csvField(n.body)}`)].join('\n');
}

module.exports = { exportCsv };
