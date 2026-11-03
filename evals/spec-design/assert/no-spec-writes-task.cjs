// The project keeps no specs: the design output goes into the task or a design document, no spec is created,
// and product code is untouched.
const c = require('./_checks.cjs');

const TASK = 'docs/tasks/T-12-notes-search.md';

module.exports = () => {
  const before = c.original(TASK) || '';
  const after = c.w.read(TASK) || '';
  const taskGrew = after.length - before.length >= 200;
  const designDoc = c.walk().some((f) => /^docs\/(?!tasks\/|specs\/).+\.md$/.test(f) && (c.w.read(f) || '').length >= 200);
  return c.result({
    noSpecCreated: !c.w.exists('docs/specs'),
    writtenToTaskOrDesignDoc: taskGrew || designDoc,
    productCodeUnchanged: c.changedSinceFixture('src', 'bin', 'data', 'package.json').length === 0,
  });
};
