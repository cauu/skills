// Before gate B every TC has a runnable method and every item is mapped (spec-lint --stage activate passes);
// the agent asks for activation instead of activating.
const path = require('path');
const { spawnSync } = require('child_process');
const c = require('./_checks.cjs');

const DRAFT = 'docs/specs/draft/S0003-notes-csv-export.md';
const SPEC_LINT = path.join(__dirname, '../../../skills/engineering/immutable-spec/scripts/spec-lint');

module.exports = (output) => {
  const spec = c.w.read(DRAFT) || '';
  const lint = spawnSync('python3', [SPEC_LINT, '--stage', 'activate', path.join(c.w.ws(), DRAFT)], { encoding: 'utf8' });
  return c.result({
    activationLintPasses: lint.status === 0,
    noManualMethod: !/method:\s*manual/i.test(c.section(spec, 4) || ''),
    stillDraft: c.isDraft(spec) && c.activeSpecs().length === 0,
    noGateBRecordedAsPassed: !c.gatePassed(spec, 'B'),
    requestsGateB: /gate B|activat/i.test(output),
    productCodeUnchanged: c.changedSinceFixture('src', 'bin', 'data', 'package.json').length === 0,
  });
};
