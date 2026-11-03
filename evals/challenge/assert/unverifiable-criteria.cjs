// The proposal's criterion 3 ("feels intuitive and pleasant") has no way for the agent
// to check it and no reason why only a human can. The review must name it and ask for
// a runnable check or a reason, without calling the two runnable criteria unverifiable.
// It reviews only: the proposal is not rewritten and nothing is committed.
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

const VERIFY_WORDS = /verif|measur|testable|untestable|observable|objective|subjective|reason|human|runnable|rewrite|pass\/fail|check/i;
const UNVERIFIABLE = /unverifiable|not (agent[- ])?verifiable|cannot be (verified|checked|tested|measured)|can't be (verified|checked|tested|measured)|untestable/i;

module.exports = (output) => {
  const lines = String(output).split('\n');
  const intuitiveLines = lines.filter((l) => /intuitive|pleasant/i.test(l));
  // Judge criteria 1-2 per sentence: one paragraph may describe the data and then criterion 3.
  // Sentences that name criterion 3 are about criterion 3, not the runnable ones.
  const sentences = lines.flatMap((l) => l.split(/(?<=[.!?])\s+(?=[A-Z*(`"])/));
  const aboutRunnable = sentences.filter((s) => !/intuitive|pleasant|criterion 3|criteria 3/i.test(s));
  return result({
    flagsCriterion3: intuitiveLines.some((l) => VERIFY_WORDS.test(l)),
    runnableCriteriaNotFlagged: !aboutRunnable.some((s) => /id,title,body|milk, eggs|header line/i.test(s) && UNVERIFIABLE.test(s)),
    proposalUnchanged: w.git('status', '--porcelain', '--', 'docs/proposal.md') === '',
    noNewCommit: w.commitCount() === 1,
  });
};
