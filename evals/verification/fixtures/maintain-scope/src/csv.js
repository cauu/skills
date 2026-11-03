function field(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(notes) {
  const rows = notes.map((note) => `${field(note.title)},${field(note.body)}`);
  return ['title,body', ...rows].join('\n');
}

module.exports = { toCsv };
