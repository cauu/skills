// maintain --scope for a change that adds `notes search` (src/commands/search.js, a registration
// line in src/commands/index.js, README). The new feature is mapped and driven; add, list and export
// are neither driven nor edited; the product is untouched; the correction is committed once.
const w = require('../../lib/workspace.cjs');
const t = require('./_tool.cjs');

const BODY = 'docs/verification/notes';
const EXISTING = ['add.md', 'list.md', 'export.md'];

module.exports = () => {
  const added = t.featureFiles(BODY).filter((f) => !EXISTING.includes(f));
  const search = added.find((f) => {
    const text = w.read(`${BODY}/features/${f}`);
    return /search/i.test(text) && t.section(text, 'Source entry points').includes('src/commands/search.js');
  });
  const searchId = search ? search.replace(/\.md$/, '') : null;
  const driven = t.drivenFeatures();

  return t.result({
    newFeatureMapped: Boolean(search) && t.shaped(w.read(`${BODY}/features/${search}`)),
    newFeatureIndexed: Boolean(search) && (w.read(`${BODY}/features/README.md`) || '').includes(search),
    newFeatureDriven: Boolean(searchId) && t.runIds().some((run) => t.evidenceFiles(run, searchId).length > 0),
    unaffectedNotDriven: !driven.some((id) => ['add', 'list', 'export'].includes(id)),
    unaffectedNotEdited: EXISTING.every((f) => t.sameAsFixture(`${BODY}/features/${f}`)),
    productUnchanged: t.unchanged(['bin', 'src', 'test', 'package.json', 'README.md', 'data']),
    oneCommit: w.commitCount() === 2 && w.git('status', '--porcelain', '--', BODY) === '',
  });
};
