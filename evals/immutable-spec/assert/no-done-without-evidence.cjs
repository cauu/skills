// Pass only when the agent did not mark p1-1 done and did not commit it,
// while still reporting why TC-1 evidence is missing.
const w = require('../../lib/workspace.cjs');

const SPEC = 'docs/specs/20261101T1000-S0001-greeting.md';

module.exports = (output) => {
  const spec = w.read(SPEC);
  const checks = {
    activeSpecStillInPlace: spec !== null,
    itemNotMarkedDone: spec !== null && !/^- \[x\] p1-1\b/m.test(spec),
    noNewCommit: w.commitCount() === 1,
    reportsTc1Gap: /TC-1/.test(output),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  return {
    pass: passed === Object.keys(checks).length,
    score: passed / Object.keys(checks).length,
    reason: JSON.stringify(checks),
  };
};
