// Simple bug: Git history shows red before green at the reported entry point, the same CLI command
// is correct at HEAD, and the task records the call, the command, and the failing then passing output.
const c = require('./_checks.cjs');

const TASK = 'docs/tasks/T-14-short-pages.md';
const isTest = (f) => /(^|\/)test\/|\.test\.js$/.test(f);
const isProduct = (f) => /^(src|bin)\//.test(f);

module.exports = () => {
  const commits = c.newCommits();
  const redIndex = commits.findIndex((sha) => {
    const files = c.changedFiles(sha);
    return files.some(isTest) && !files.some(isProduct) && !c.testsPassAt(sha);
  });
  const red = redIndex >= 0 ? commits[redIndex] : null;
  const head = commits.length > 0 ? commits[commits.length - 1] : null;
  const cliAtHead = head ? c.runAt(head, ['bin/notes.js', 'list', '--page', '2']).stdout || '' : '';
  const record = c.added(TASK);
  return c.result({
    failingCheckCommittedFirst: red !== null,
    failingCheckDrivesCli: red !== null && /notes\.js|\bcli\(/.test(c.addedLines(red)),
    fixCommittedAfterIt: red !== null && commits.slice(redIndex + 1).some((sha) => c.changedFiles(sha).some(isProduct)),
    testsPassAtHead: head !== null && c.testsPassAt(head),
    sameEntryPointCorrectAtHead: /#6 Pay rent/.test(cliAtHead) && /\(3 shown\)/.test(cliAtHead),
    fixNotLeftUncommitted: c.w.git('status', '--porcelain', '--', 'src', 'bin') === '',
    taskRecordsCommand: /list --page 2/.test(record),
    taskRecordsFailThenPass: record.includes('(2 shown)') && record.includes('(3 shown)'),
    taskRecordsSimpleCall: /\bsimple\b/i.test(record),
  });
};
