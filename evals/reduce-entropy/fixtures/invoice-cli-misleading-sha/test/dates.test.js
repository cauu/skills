const test = require('node:test');
const assert = require('node:assert');
const { formatLocalDate } = require('../src/dates');

test('formatLocalDate uses the local calendar day', () => {
  assert.strictEqual(formatLocalDate(new Date(2026, 0, 5, 23, 30)), '2026-01-05');
  assert.strictEqual(formatLocalDate(new Date(2026, 11, 31, 0, 5)), '2026-12-31');
});
