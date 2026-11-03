// The report does not reproduce (the export is correct). The agent must stop without a fix:
// no change to code, tests, data, or package.json, and the task records the attempt and what is missing.
const c = require('./_checks.cjs');

const TASK = 'docs/tasks/T-31-export-drops-last-note.md';

module.exports = (output) => {
  const record = c.added(TASK);
  return c.result({
    productAndTestsUnchanged: c.changedSinceFixture('src', 'bin', 'test', 'package.json', 'data/notes.json').length === 0,
    saysNotReproduced:
      /\b(could not|couldn't|cannot|can't|unable to|did not|didn't|was not able to|wasn't able to)\s+(\w+\s+)?reproduce|\bnot reproducible\b|\b(does not|doesn't|did not|didn't) reproduce/i.test(
        `${output}\n${record}`,
      ),
    taskRecordsPathTried: /notes\.js export/.test(record),
    taskRecordsMissingCondition: /\b(missing|need|needs|needed|would need|require[sd]?|without)\b/i.test(record),
  });
};
