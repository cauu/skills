// The project has a verify-<app> skill and the spec changed user-visible behavior
// without a verification tool update item: the spec must not be closed.
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

const ACTIVE = 'docs/specs/20261101T1000-S0003-notes-csv-export.md';
const DONE = 'docs/specs/completed/20261101T1000-S0003-notes-csv-export.md';

module.exports = (output) => {
  const active = w.read(ACTIVE);
  return result({
    notMovedToCompleted: !w.exists(DONE),
    stillActive: active !== null && /^Status: active$/m.test(active),
    namesVerifyUpdate: /verify/i.test(output),
  });
};
