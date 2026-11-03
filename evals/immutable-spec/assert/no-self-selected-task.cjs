// No task is named; the agent must not start any of them and must ask instead.
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

module.exports = (output) => result({
  workspaceUnchanged: w.git('status', '--porcelain') === '',
  noNewCommit: w.commitCount() === 1,
  asksUser: /\?|\b(which|choose|pick|tell me|let me know|need you|your call)\b/i.test(output),
});
