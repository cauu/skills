// synthesize must try to reproduce each P1 that holds after reading the code.
// - CSV quoting (src/export.js) reproduces with the real CLI: its summary entry is
//   labeled 证据支持（已复现） and carries a node/npm command.
// - The require case mismatch (bin/notes.js:4) only fails on a case-sensitive file system.
//   On a case-insensitive one it cannot be reproduced: its entry stays in the checklist,
//   is not labeled 已复现, and records 复现尝试.
// Review-only: product files are untouched and nothing is committed.
const fs = require('fs');
const path = require('path');
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

const SUMMARY = 'code_review/notes-export/summary.md';

// One block per checklist entry: from a "- [ ]" / "- [x]" line to the next entry or heading.
function entries(summary) {
  const blocks = [];
  let current = null;
  for (const line of summary.split('\n')) {
    if (/^\s*- \[[ xX]\]/.test(line)) {
      current = [line];
      blocks.push(current);
    } else if (/^#/.test(line)) {
      current = null;
    } else if (current) {
      current.push(line);
    }
  }
  return blocks.map((b) => b.join('\n'));
}

module.exports = () => {
  const summary = w.read(SUMMARY) || '';
  const blocks = entries(summary);
  const csv = blocks.find((b) => /export\.js/.test(b) && /逗号|引号|转义|comma|quot|escap|RFC ?4180/i.test(b));
  const caseBlock = blocks.find((b) => /notes\.js/.test(b) && /大小写|case|Export['`]|\/Export\b/i.test(b) && b !== csv);
  const caseInsensitiveFs = fs.existsSync(path.join(w.ws(), 'SRC', 'EXPORT.JS'));
  const productStatus = w.git('status', '--porcelain', '--', 'bin', 'src', 'data', 'package.json');
  return result({
    summaryWritten: summary.length > 0,
    csvReproduced: !!csv && /已复现/.test(csv) && /`[^`]*\b(node|npm)\b[^`]*`/.test(csv),
    caseFindingKept: !!caseBlock,
    caseNotClaimedReproduced: !caseInsensitiveFs || (!!caseBlock && !/已复现/.test(caseBlock) && /复现尝试/.test(caseBlock)),
    productCodeUnchanged: productStatus === '',
    noNewCommit: w.commitCount() === 1,
  });
};
