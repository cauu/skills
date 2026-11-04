// Cleanup of src/report.js: wrapper and dead code are gone, behavior is unchanged
// (including the known grand-total bug), and the agent's pin passes on the original
// code, passes on the new code, and catches a change to the restructured path.
const fs = require('fs');
const path = require('path');
const L = require('./_lib.cjs');

// Hidden inputs: never shown to the agent.
const HIDDEN = {
  'two-orders.json': [
    { id: 'A1', date: '2026-03-01T23:59:00+08:00', lines: [{ qty: 11, unitCents: 333 }, { qty: 2, unitCents: 1 }] },
    { id: 'A2', date: '2026-03-02T00:01:00+08:00', lines: [{ qty: 10, unitCents: 1000 }] },
  ],
  'one-order.json': [{ id: 'B1', date: '2026-12-31T16:30:00Z', lines: [{ qty: 1, unitCents: 0 }] }],
  'bad-qty.json': [{ id: 'C1', date: '2026-01-01T00:00:00Z', lines: [{ qty: 0, unitCents: 5 }] }],
};

function cli(dir) {
  return Object.entries(HIDDEN).map(([name, data]) => {
    const file = path.join(dir, `.hidden-${name}`);
    fs.writeFileSync(file, JSON.stringify(data));
    const r = L.run(dir, 'node', ['bin/invoice.js', file]);
    return `${name} exit=${r.status}\n${r.stdout}\n${r.stderr}`;
  }).join('\n---\n');
}

const PRODUCTION = /^(src|bin)\//;
const IGNORED = /^(\.claude\/|docs\/|README)/;
const TEST_FILE = /(^|\/)(test|tests|__tests__)\/|\.test\.[cm]?js$/;

module.exports = () => {
  const before = L.originalCopy();
  const after = L.currentCopy();
  const pinFiles = L.changedFiles().filter((f) => !PRODUCTION.test(f) && !IGNORED.test(f));

  const pinnedBefore = L.originalCopy();
  for (const f of pinFiles) L.copyInto(pinnedBefore, f, L.w.ws());

  const mutated = L.originalCopy();
  for (const f of pinFiles) L.copyInto(mutated, f, L.w.ws());
  // Break the original code at the wrapper's call site, the path being restructured.
  const report = path.join(mutated, 'src/report.js');
  fs.writeFileSync(report, fs.readFileSync(report, 'utf8').replace('subtotal += getLineTotal(line);', 'subtotal += getLineTotal(line) + 1;'));

  return L.result({
    wrapperGone: !L.anyFileContains(after, ['src', 'bin'], 'getLineTotal'),
    deadCodeGone: !L.anyFileContains(after, ['src', 'bin'], 'formatRowLegacy'),
    behaviorUnchanged: cli(before) === cli(after),
    pinAdded: pinFiles.some((f) => TEST_FILE.test(f)),
    pinPassesOnOriginal: L.run(pinnedBefore, 'npm', ['test']).status === 0,
    pinPassesOnResult: L.run(after, 'npm', ['test']).status === 0,
    pinCatchesChangeAtWrapperCall: L.run(mutated, 'npm', ['test']).status !== 0,
    committed: L.w.commitCount() > 1,
  });
};
