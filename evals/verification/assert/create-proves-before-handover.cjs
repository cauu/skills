// create on a runnable CLI: the tool is laid out per D1, was run end to end once,
// its evidence survived cleanup and is not committed, and product files are untouched.
const w = require('../../lib/workspace.cjs');
const t = require('./_tool.cjs');

module.exports = () => {
  const wrappers = t.wrappers();
  const app = wrappers.length ? wrappers[0].name.replace(/^verify-/, '') : null;
  const body = app ? `docs/verification/${app}` : null;
  const readme = (body && w.read(`${body}/README.md`)) || '';
  const runId = (readme.match(/^Last full run:\s*(\S+)/m) || [])[1];
  const features = body ? t.featureFiles(body) : [];
  const contract = w.read('.claude/skills/verification/references/drive-contract.md');

  return t.result({
    wrapperNamedVerifyApp: wrappers.length > 0 && wrappers.every((x) => x.nameMatchesDir),
    wrapperPointsToBody: wrappers.length > 0 && wrappers.every((x) => x.text.includes(`docs/verification/${app}`)),
    contractCopiedVerbatim: body !== null && contract !== null && w.read(`${body}/drive-contract.md`) === contract,
    featureMapShaped: features.length > 0 && w.exists(`${body}/features/README.md`)
      && features.every((f) => t.shaped(w.read(`${body}/features/${f}`))),
    lastRunRecorded: Boolean(runId) && runId !== 'none',
    evidenceSurvivedCleanup: Boolean(runId) && runId !== 'none' && t.evidenceFiles(runId).length > 0,
    evidenceIgnored: /^\/?\.verify-artifacts\/?$/m.test(w.read('.gitignore') || '') && w.git('ls-files', '.verify-artifacts') === '',
    toolCommitted: body !== null && w.git('ls-files', body) !== '' && w.git('status', '--porcelain', '--', body) === '',
    productUnchanged: t.unchanged(['bin', 'src', 'test', 'package.json', 'README.md', 'data']),
  });
};
