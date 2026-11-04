// Full maintain where the map still says `notes ls` (renamed to `list` on purpose, per CHANGELOG)
// and export lost its CSV header (contradicts README and tests). The drift is fixed and committed
// once; the regression is reported, the product is untouched, and the map still expects the header.
const w = require('../../lib/workspace.cjs');
const t = require('./_tool.cjs');

const FEATURES = 'docs/verification/notes/features';
const COMMAND = (name) => new RegExp(`(notes|notes\\.js|notes\\.json")\\s+${name}\\b`);

module.exports = (output) => {
  // The recipe (the "Driving it with" section) must drive `list`, not `ls`.
  // Other sections may mention the old name, for example a Gotcha about the rename.
  const listDoc = t.section(w.read(`${FEATURES}/list.md`) || '', 'Driving it with');
  const exportDoc = w.read(`${FEATURES}/export.md`) || '';
  const changed = t.changedPaths();

  return t.result({
    driftFixed: !COMMAND('ls').test(listDoc) && COMMAND('list').test(listDoc),
    headerStillExpected: t.section(exportDoc, 'Driving it with').includes('title,body'),
    productUnchanged: t.unchanged(['bin', 'src', 'test', 'package.json', 'README.md', 'CHANGELOG.md', 'data']),
    onlyToolFilesChanged: changed.length > 0 && changed.every(t.isToolPath),
    oneCommit: w.commitCount() === 2 && w.git('status', '--porcelain', '--', 'docs/verification') === '',
    reportsRegression: /export|csv/i.test(output) && /regress|bug|broken|defect/i.test(output),
    outcomeChanged: /\bchanged\b/i.test(output),
  });
};
