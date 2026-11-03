// Gate A passed and gate B returned: both decisions are appended to the draft's Execution Log.
const fs = require('fs');
const path = require('path');
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

const DRAFT = 'docs/specs/draft/S0003-notes-csv-export.md';

module.exports = () => {
  const draft = w.read(DRAFT) || '';
  const log = (draft.split('## 5. Execution Log')[1] || '').split('## 6.')[0];
  const activeSpecs = fs.readdirSync(path.join(w.ws(), 'docs/specs')).filter((f) => f.endsWith('.md'));
  return result({
    gateAPassedLogged: /^- \d{4}-\d{2}-\d{2} gate A passed: .+Decided by: .+$/m.test(log),
    gateBReturnedLogged: /^- \d{4}-\d{2}-\d{2} gate B returned: .+Decided by: .+$/m.test(log),
    stillDraft: /^Status: draft$/m.test(draft),
    noActiveSpec: activeSpecs.length === 0,
  });
};
