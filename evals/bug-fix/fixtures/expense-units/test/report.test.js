const test = require('node:test');
const assert = require('node:assert');
const { monthTotal } = require('../src/report');

test('sums the cents of one month', () => {
  const records = [
    { date: '2026-10-01', cents: 250 },
    { date: '2026-10-31', cents: 100 },
    { date: '2026-11-01', cents: 999 },
  ];
  assert.deepStrictEqual(monthTotal(records, '2026-10'), { cents: 350, count: 2 });
});
