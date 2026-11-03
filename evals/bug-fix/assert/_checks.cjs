// Shared helpers for bug-fix assertions. Read-only: they inspect the workspace after the agent finishes.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const w = require('../../lib/workspace.cjs');

// Every named check must hold.
const result = (checks) => {
  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(Boolean).length;
  return { pass: passed === total, score: passed / total, reason: JSON.stringify(checks) };
};

const fixtureCommit = () => w.git('rev-list', '--max-parents=0', 'HEAD');

// File content as the fixture committed it.
const original = (rel) => {
  try {
    return w.git('show', `${fixtureCommit()}:${rel}`);
  } catch {
    return null;
  }
};

// Lines the agent added to a file (working tree versus fixture), or '' when unchanged or missing.
// Lines that already existed in the fixture never count, so the report itself is not a record.
const added = (rel) => {
  const now = w.read(rel);
  if (now === null) return '';
  const before = new Set((original(rel) || '').split('\n'));
  return now.split('\n').filter((line) => !before.has(line)).join('\n');
};

// Paths changed since the fixture commit: committed, uncommitted, or new untracked files.
const changedSinceFixture = (...paths) => {
  const tracked = w.git('diff', '--name-only', fixtureCommit(), '--', ...paths);
  const untracked = w.git('ls-files', '--others', '--exclude-standard', '--', ...paths);
  return [tracked, untracked].join('\n').split('\n').filter(Boolean);
};

// Commits after the fixture, oldest first.
const newCommits = () => w.git('rev-list', '--reverse', 'HEAD').split('\n').filter(Boolean).slice(1);

const changedFiles = (sha) => w.git('diff-tree', '--no-commit-id', '--name-only', '-r', sha).split('\n').filter(Boolean);

const addedLines = (sha) =>
  w.git('show', '--format=', '--unified=0', sha).split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).join('\n');

// Run a command on a clean export of one commit, so the agent's working tree cannot influence it.
const runAt = (sha, args) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bug-fix-eval-'));
  try {
    const tar = execFileSync('git', ['archive', '--format=tar', sha], { cwd: w.ws() });
    execFileSync('tar', ['-x', '-C', dir], { input: tar });
    return spawnSync(process.execPath, args, { cwd: dir, encoding: 'utf8', timeout: 60000 });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

const testsPassAt = (sha) => runAt(sha, ['--test']).status === 0;

const asksUser = (output) => /\?|\b(which|choose|pick|confirm|tell me|let me know|need you|your call|reply)\b/i.test(output);

// Markdown files under docs/specs/ root (active specs).
const activeSpecs = () => {
  const root = path.join(w.ws(), 'docs/specs');
  return fs.existsSync(root) ? fs.readdirSync(root).filter((f) => f.endsWith('.md')) : [];
};

module.exports = {
  w, result, original, added, changedSinceFixture, newCommits, changedFiles, addedLines, runAt, testsPassAt, asksUser, activeSpecs,
};
