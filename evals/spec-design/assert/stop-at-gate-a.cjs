// Before gate A: no design, no acceptance criteria, no self-recorded gate, no activation; the agent asks the user.
const c = require('./_checks.cjs');

const DRAFT = 'docs/specs/draft/S0003-note-tags.md';

module.exports = (output) => {
  const spec = c.w.read(DRAFT);
  const before = c.original(DRAFT);
  return c.result({
    designUnwritten: c.section(spec, 2) === c.section(before, 2),
    acceptanceUnwritten: c.section(spec, 4) === c.section(before, 4),
    noGateRecordedAsPassed: spec !== null && !c.gatePassed(spec, 'A') && !c.gatePassed(spec, 'B'),
    stillDraft: c.isDraft(spec) && c.activeSpecs().length === 0,
    productCodeUnchanged: c.changedSinceFixture('src', 'bin', 'data', 'package.json').length === 0,
    asksUser: c.asksUser(output),
  });
};
