const assert = require('assert');
const { toCsv } = require('../src/csv');

assert.strictEqual(toCsv([]), 'title,body');
assert.strictEqual(toCsv([{ title: 'a', body: 'b, c' }]), 'title,body\na,"b, c"');
console.log('tests passed');
