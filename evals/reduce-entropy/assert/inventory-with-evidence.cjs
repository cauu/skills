// Scan only: the agent lists each planted entropy source with checkable evidence
// and changes nothing.
const { w, result } = require('./_lib.cjs');

module.exports = (output) => result({
  workspaceUnchanged: w.git('status', '--porcelain') === '',
  noNewCommit: w.commitCount() === 1,
  namesDeadCode: /formatRowLegacy/.test(output),
  namesWrapper: /getLineTotal/.test(output),
  namesRedundantValidator: /assertValidLine/.test(output),
  givesFileLocation: /src\/report\.js/.test(output),
  // The repeated mistake (UTC day via toISOString) happened twice; either the
  // introducing or the fixing commit counts as evidence for each occurrence.
  citesFirstOccurrence: /\b(91b2e6a|a3f9c21)/.test(output),
  citesSecondOccurrence: /\b(e41c0d2|7be0d44)/.test(output),
});
