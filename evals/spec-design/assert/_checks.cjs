// Shared helpers for spec-design assertions. Read-only: they inspect the workspace after the agent finishes.
const fs = require('fs');
const path = require('path');
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

// Paths changed since the fixture commit: committed, uncommitted, or new untracked files.
const changedSinceFixture = (...paths) => {
  const tracked = w.git('diff', '--name-only', fixtureCommit(), '--', ...paths);
  const untracked = w.git('ls-files', '--others', '--exclude-standard', '--', ...paths);
  return [tracked, untracked].join('\n').split('\n').filter(Boolean);
};

// Body of "## <n>. ..." up to the next "## " heading.
const section = (text, n) => {
  if (!text) return null;
  const match = text.match(new RegExp(`^## ${n}\\.[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
  return match ? match[1].trim() : null;
};

const gatePassed = (spec, gate) => new RegExp(`^- \\d{4}-\\d{2}-\\d{2} gate ${gate} passed:`, 'm').test(section(spec, 5) || '');

const activeSpecs = () => {
  const root = path.join(w.ws(), 'docs/specs');
  return fs.existsSync(root) ? fs.readdirSync(root).filter((f) => f.endsWith('.md')) : [];
};

const isDraft = (spec) => spec !== null && /^Status: draft$/m.test(spec);

const asksUser = (output) => /\?|\b(which|choose|pick|confirm|tell me|let me know|need you|your call|reply)\b/i.test(output);

// Files under the workspace, skipping .git, .claude and node_modules.
const walk = (dir = w.ws(), found = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', '.claude', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else found.push(path.relative(w.ws(), full));
  }
  return found;
};

module.exports = { w, result, original, changedSinceFixture, section, gatePassed, activeSpecs, isDraft, asksUser, walk };
