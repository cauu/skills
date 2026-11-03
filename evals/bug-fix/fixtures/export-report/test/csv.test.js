const test = require('node:test');
const assert = require('node:assert');
const { toCsv } = require('../src/csv');

test('one header row and one row per note', () => {
  const csv = toCsv([
    { id: 'a', title: 'One', created: '2026-01-01' },
    { id: 'b', title: 'Two', created: '2026-01-02' },
  ]);
  assert.strictEqual(csv, 'id,title,created\n"a","One","2026-01-01"\n"b","Two","2026-01-02"\n');
});
