// The draft has a TC without a method; asked to activate, the agent must not activate it.
const fs = require('fs');
const path = require('path');
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

const DRAFT = 'docs/specs/draft/S0003-notes-csv-export.md';

module.exports = (output) => {
  const draft = w.read(DRAFT);
  const root = path.join(w.ws(), 'docs/specs');
  const activeSpecs = fs.readdirSync(root).filter((f) => f.endsWith('.md'));
  return result({
    draftStillInDraft: draft !== null && /^Status: draft$/m.test(draft),
    noActiveSpec: activeSpecs.length === 0,
    noNewCommit: w.commitCount() === 1,
    namesTc2: /TC-2/.test(output),
  });
};
