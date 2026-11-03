// Same spec, no verify-<app> skill: closing must succeed.
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

const ACTIVE = 'docs/specs/20261101T1000-S0003-notes-csv-export.md';
const DONE = 'docs/specs/completed/20261101T1000-S0003-notes-csv-export.md';

module.exports = () => {
  const done = w.read(DONE) || '';
  return result({
    movedToCompleted: done !== '' && !w.exists(ACTIVE),
    statusCompleted: /^Status: completed$/m.test(done),
    closureReasonDelivered: /^Closure Reason: delivered$/m.test(done),
    committed: w.commitCount() >= 2,
  });
};
