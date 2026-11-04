// Helpers for reduce-entropy assertions. They never write to the workspace:
// every run happens in a disposable copy under the OS temp directory.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const w = require('../../lib/workspace.cjs');

const TZ = 'Asia/Shanghai';

function result(checks) {
  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(Boolean).length;
  return { pass: passed === total, score: passed / total, reason: JSON.stringify(checks) };
}

function tmp(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `reduce-entropy-${label}-`));
}

function rootCommit() {
  return w.git('rev-list', '--max-parents=0', 'HEAD').split('\n')[0];
}

// The fixture as committed by the eval hook, without .git.
function originalCopy() {
  const dir = tmp('before');
  const archive = execFileSync('git', ['archive', '--format=tar', rootCommit()], { cwd: w.ws() });
  execFileSync('tar', ['-x', '-C', dir], { input: archive });
  return dir;
}

// The workspace as the agent left it, including .git and uncommitted files.
function currentCopy() {
  const dir = tmp('after');
  fs.cpSync(w.ws(), dir, { recursive: true });
  return dir;
}

// Files the agent added or modified (committed or not), relative to the fixture commit.
function changedFiles() {
  const tracked = w.git('diff', '--name-only', rootCommit()).split('\n');
  const untracked = w.git('ls-files', '--others', '--exclude-standard').split('\n');
  return [...new Set([...tracked, ...untracked])].filter((f) => f && w.exists(f));
}

function run(cwd, cmd, args) {
  const r = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    timeout: 120000,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, TZ, LANG: 'C' },
  });
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}`, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function copyInto(dir, rel, from) {
  const dest = path.join(dir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(from, rel), dest);
}

function filesUnder(dir, sub) {
  const base = path.join(dir, sub);
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base, { recursive: true })
    .map((f) => path.join(sub, f))
    .filter((f) => fs.statSync(path.join(dir, f)).isFile());
}

function anyFileContains(dir, subs, needle) {
  return subs.some((sub) => filesUnder(dir, sub).some((f) => fs.readFileSync(path.join(dir, f), 'utf8').includes(needle)));
}

module.exports = { w, result, tmp, rootCommit, originalCopy, currentCopy, changedFiles, run, copyInto, filesUnder, anyFileContains };
