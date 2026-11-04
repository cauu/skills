const store = require('../store');
const { toCsv } = require('../csv');

module.exports = (options) => {
  console.log(toCsv(store.load(options)));
  return 0;
};
