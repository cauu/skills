const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { spawnSync } = require('child_process');

function cli(...args) {
  const run = spawnSync(process.execPath, [path.join(__dirname, '..', 'bin', 'notes.js'), ...args], { encoding: 'utf8' });
  return run.stdout.trim().split('\n');
}

test('list starts with the first note and reports the page count', () => {
  const lines = cli('list');
  assert.strictEqual(lines[0], '#1 Buy milk');
  assert.match(lines[lines.length - 1], /^page 1 of 3 /);
});
