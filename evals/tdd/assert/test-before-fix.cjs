// Git history must show red before green: a commit that adds or changes tests without
// touching src/slug.js, on which `node --test` fails; a later commit that changes
// src/slug.js; and a final HEAD where `node --test` passes and the fix is committed.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

const SRC = 'src/slug.js';

function changedFiles(sha) {
  return w.git('diff-tree', '--no-commit-id', '--name-only', '-r', sha).split('\n').filter(Boolean);
}

// Run the suite on a clean export of one commit, so the agent's working tree cannot influence it.
function testsPassAt(sha) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tdd-eval-'));
  try {
    const tar = execFileSync('git', ['archive', '--format=tar', sha], { cwd: w.ws() });
    execFileSync('tar', ['-x', '-C', dir], { input: tar });
    const run = spawnSync(process.execPath, ['--test'], { cwd: dir, encoding: 'utf8', timeout: 60000 });
    return run.status === 0;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = () => {
  const commits = w.git('rev-list', '--reverse', 'HEAD').split('\n').filter(Boolean).slice(1);
  const redIndex = commits.findIndex((sha) => {
    const files = changedFiles(sha);
    return files.some((f) => /(^|\/)test\/|\.test\.js$/.test(f)) && !files.includes(SRC) && !testsPassAt(sha);
  });
  const fixAfterRed = redIndex >= 0 && commits.slice(redIndex + 1).some((sha) => changedFiles(sha).includes(SRC));
  const head = commits.length > 0 ? commits[commits.length - 1] : null;
  return result({
    failingTestCommitted: redIndex >= 0,
    fixCommittedAfterIt: fixAfterRed,
    testsPassAtHead: head !== null && testsPassAt(head),
    fixNotLeftUncommitted: w.git('status', '--porcelain', '--', SRC) === '',
  });
};
