// Read-only helpers for verification assertions: find the generated tool, check its shape,
// and compare the workspace with the fixture commit.
const fs = require('fs');
const path = require('path');
const w = require('../../lib/workspace.cjs');

const H2 = [/^Sub-features$/, /^How to get to it \(user POV\)$/, /^Driving it with .+$/, /^Gotchas$/, /^Source entry points$/];
const WRAPPER_DIRS = ['.claude/skills', '.agents/skills'];

const result = (checks) => {
  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(Boolean).length;
  return { pass: passed === total, score: passed / total, reason: JSON.stringify(checks) };
};

const list = (rel) => {
  const p = path.join(w.ws(), rel);
  return fs.existsSync(p) && fs.statSync(p).isDirectory() ? fs.readdirSync(p) : [];
};

// verify-* wrappers in the root agent skill directories.
const wrappers = () =>
  WRAPPER_DIRS.flatMap((dir) =>
    list(dir)
      .filter((name) => name.startsWith('verify-') && w.exists(`${dir}/${name}/SKILL.md`))
      .map((name) => {
        const text = w.read(`${dir}/${name}/SKILL.md`);
        const declared = (text.match(/^name:\s*(\S+)/m) || [])[1];
        return { dir, name, text, nameMatchesDir: declared === name };
      }),
  );

const h2s = (text) => (text.match(/^## .+$/gm) || []).map((line) => line.slice(3));
const shaped = (text) => {
  const found = h2s(text);
  return found.length === H2.length && found.every((title, i) => H2[i].test(title));
};
const section = (text, title) => {
  const match = text.split(/^## /m).find((part) => part.startsWith(title));
  return match || '';
};

const featureFiles = (body) => list(`${body}/features`).filter((f) => f.endsWith('.md') && f !== 'README.md');

// Files under .verify-artifacts/<runId>/<feature>/ (recursively).
const evidenceFiles = (runId, feature) => {
  const base = path.join(w.ws(), '.verify-artifacts', runId, feature || '');
  if (!fs.existsSync(base)) return [];
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else out.push(path.relative(base, p));
    }
  };
  walk(base);
  return feature ? out : out.filter((f) => f.includes(path.sep));
};

const runIds = () => list('.verify-artifacts');
const drivenFeatures = () => [...new Set(runIds().flatMap((run) => list(`.verify-artifacts/${run}`)))];

const fixtureCommit = () => w.git('rev-list', '--max-parents=0', 'HEAD');
const atFixture = (rel) => {
  try { return w.git('show', `${fixtureCommit()}:${rel}`); } catch { return null; }
};
// workspace.git trims output, so compare trimmed text.
const sameAsFixture = (rel) => {
  const now = w.read(rel);
  const then = atFixture(rel);
  return now !== null && then !== null && now.trim() === then.trim();
};

// Every path that differs from the fixture: committed, staged, unstaged, or untracked (evidence excluded).
const changedPaths = () => {
  const root = fixtureCommit();
  const tracked = w.git('diff', '--name-only', root).split('\n');
  const untracked = w.git('ls-files', '--others', '--exclude-standard').split('\n');
  return [...new Set([...tracked, ...untracked])].filter((p) => p && !p.startsWith('.verify-artifacts/'));
};

const unchanged = (prefixes) => {
  const changed = changedPaths();
  return !changed.some((p) => prefixes.some((prefix) => p === prefix || p.startsWith(`${prefix}/`)));
};

const isToolPath = (p) =>
  p.startsWith('docs/verification/') || p === '.gitignore' || WRAPPER_DIRS.some((dir) => p.startsWith(`${dir}/verify-`));

module.exports = {
  result, list, wrappers, shaped, section, featureFiles, evidenceFiles, runIds, drivenFeatures,
  atFixture, sameAsFixture, changedPaths, unchanged, isToolPath,
};
