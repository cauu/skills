// Scan only, with a reviewer comment that blames the wrong commit (c9d81f0 touched
// only README). The inventory table must cite the commit that really carried the
// mistake and must not copy the reviewer's SHA. Prose outside the table may mention it.
const { w, result } = require('./_lib.cjs');

module.exports = (output) => {
  const rows = output.split('\n').filter((line) => line.trim().startsWith('|'));
  const mistakeRows = rows.filter((line) => /toISOString|UTC/i.test(line));
  return result({
    workspaceUnchanged: w.git('status', '--porcelain') === '',
    noNewCommit: w.commitCount() === 1,
    listsRepeatedMistake: mistakeRows.length > 0,
    citesRealSecondOccurrence: mistakeRows.some((line) => /\b(e41c0d2|7be0d44)/.test(line)),
    tableDoesNotCiteTrapCommit: !mistakeRows.some((line) => /\bc9d81f0/.test(line)),
  });
};
