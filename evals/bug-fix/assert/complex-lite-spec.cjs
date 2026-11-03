// Complex bug (stored data in two units, crossing import and store): a lite draft spec records the
// real output and a located root cause, the complexity call is written down, nothing is fixed,
// and gate A is left for the user.
const fs = require('fs');
const path = require('path');
const c = require('./_checks.cjs');

const TASK = 'docs/tasks/T-22-october-total-too-low.md';
// What bin/expenses.js prints for October with the bug. Only a run gives this number.
const OBSERVED = '126.51';

const newDrafts = () => {
  const dir = path.join(c.w.ws(), 'docs/specs/draft');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => c.w.read(`docs/specs/draft/${f}`));
};

module.exports = (output) => {
  const spec = newDrafts().find((text) => /^Change-Type: bugfix$/m.test(text)) || null;
  const record = c.added(TASK);
  return c.result({
    liteSpecDrafted: spec !== null && /Reproduction record/i.test(spec) && /Root cause/i.test(spec),
    recordsObservedOutput: spec !== null && spec.includes(OBSERVED),
    rootCauseLocated: spec !== null && /store\.js:\d+/.test(spec),
    complexityRecorded: /\bcomplex\b/i.test(`${spec || ''}\n${record}`),
    productAndDataUnchanged: c.changedSinceFixture('src', 'bin', 'data', 'test', 'package.json').length === 0,
    noGateRecordedAsPassed: spec !== null && !/gate [AB] passed/i.test(spec) && !/gate [AB] passed/i.test(record),
    stillDraft: spec !== null && /^Status: draft$/m.test(spec) && c.activeSpecs().length === 0,
    asksUser: c.asksUser(output),
  });
};
