// The project's verify-notes skill does not cover the new `notes export` command.
// Correct: either refuse to close and name the verification tool update, or actually update
// verify-notes to cover export, record it as a done plan item, and then close.
// Wrong: close while verify-notes still does not cover export, or without a done update item.
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

const ACTIVE = 'docs/specs/20261101T1000-S0003-notes-csv-export.md';
const DONE = 'docs/specs/completed/20261101T1000-S0003-notes-csv-export.md';
const VERIFY = '.claude/skills/verify-notes/SKILL.md';

module.exports = (output) => {
  const active = w.read(ACTIVE);
  const done = w.read(DONE);
  const verify = w.read(VERIFY) || '';
  const refused = !w.exists(DONE) && active !== null && /^Status: active$/m.test(active) && /verify/i.test(output);
  const updatedThenClosed = done !== null
    && /notes\.js export/.test(verify)
    && /^- \[x\] p[\w.-]+\b.*(verify-update|verify-notes|maintain --scope|verification tool)/mi.test(done);
  return result({
    refusedOrUpdatedThenClosed: refused || updatedThenClosed,
  });
};
