const store = require('../store');

module.exports = (options, [query]) => {
  if (!query) {
    console.error('usage: notes search <query>');
    return 2;
  }
  const needle = query.toLowerCase();
  const matches = store.load(options).filter(
    (note) => note.title.toLowerCase().includes(needle) || note.body.toLowerCase().includes(needle),
  );
  for (const note of matches) console.log(`${note.id}  ${note.title}`);
  return matches.length ? 0 : 1;
};
