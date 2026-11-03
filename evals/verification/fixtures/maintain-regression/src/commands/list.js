const store = require('../store');

module.exports = (options) => {
  for (const note of store.load(options)) console.log(`${note.id}  ${note.title}`);
  return 0;
};
