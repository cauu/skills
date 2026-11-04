const store = require('../store');

module.exports = (options, [title, body]) => {
  if (!title || body === undefined) {
    console.error('usage: notes add <title> <body>');
    return 2;
  }
  const notes = store.load(options);
  const id = notes.reduce((max, note) => Math.max(max, note.id), 0) + 1;
  notes.push({ id, title, body });
  store.save(options, notes);
  console.log(`added ${id}`);
  return 0;
};
