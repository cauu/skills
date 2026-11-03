function field(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(notes) {
  let out = '';
  for (const note of notes) out += `${field(note.title)},${field(note.body)}\n`;
  return out.trimEnd();
}

module.exports = { toCsv };
