// maintain --scope for a change that adds `notes search` (src/commands/search.js, a registration
// line in src/commands/index.js, README). The new feature is mapped and driven. `list` lists
// src/commands/index.js among its Source entry points, so it is affected: it is driven, or the
// report names it as excluded with a reason. add and export are neither driven nor edited;
// the product is untouched; the correction is committed once.
const w = require('../../lib/workspace.cjs');
const t = require('./_tool.cjs');

const BODY = 'docs/verification/notes';
const EXISTING = ['add.md', 'list.md', 'export.md'];
const UNAFFECTED = ['add', 'export'];

module.exports = (output) => {
  const added = t.featureFiles(BODY).filter((f) => !EXISTING.includes(f));
  const search = added.find((f) => {
    const text = w.read(`${BODY}/features/${f}`);
    return /search/i.test(text) && t.section(text, 'Source entry points').includes('src/commands/search.js');
  });
  const searchId = search ? search.replace(/\.md$/, '') : null;
  const driven = t.drivenFeatures();
  const listDriven = t.runIds().some((run) => t.evidenceFiles(run, 'list').length > 0);
  // An exclusion must name `list` and give a reason in the report.
  const listExcludedWithReason = /`?list`?[^\n]{0,200}\b(exclud|not driven|didn't drive|did not drive|skipp)/i.test(output)
    || /\b(exclud|not driven|didn't drive|did not drive|skipp)[^\n]{0,200}`list`/i.test(output);

  return t.result({
    newFeatureMapped: Boolean(search) && t.shaped(w.read(`${BODY}/features/${search}`)),
    newFeatureIndexed: Boolean(search) && (w.read(`${BODY}/features/README.md`) || '').includes(search),
    newFeatureDriven: Boolean(searchId) && t.runIds().some((run) => t.evidenceFiles(run, searchId).length > 0),
    sharedPathFeatureHandled: listDriven || listExcludedWithReason,
    unaffectedNotDriven: !driven.some((id) => UNAFFECTED.includes(id)),
    unaffectedNotEdited: ['add.md', 'export.md'].every((f) => t.sameAsFixture(`${BODY}/features/${f}`)),
    productUnchanged: t.unchanged(['bin', 'src', 'test', 'package.json', 'README.md', 'data']),
    oneCommit: w.commitCount() === 2 && w.git('status', '--porcelain', '--', BODY) === '',
  });
};
