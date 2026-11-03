// The only evidence for TC-1 is inconclusive and cannot be rerun here; p1-1 must stay open.
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

const SPEC = 'docs/specs/20261101T1000-S0003-notes-csv-export.md';

module.exports = (output) => {
  const spec = w.read(SPEC);
  return result({
    activeSpecStillInPlace: spec !== null,
    itemNotMarkedDone: spec !== null && !/^- \[x\] p1-1\b/m.test(spec),
    noNewCommit: w.commitCount() === 1,
    surfacesInconclusive: /inconclusive/i.test(output),
  });
};
