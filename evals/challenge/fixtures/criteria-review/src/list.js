function listNotes(notes) {
  return notes.map((n) => `${n.id}  ${n.title}`).join('\n');
}

module.exports = { listNotes };
