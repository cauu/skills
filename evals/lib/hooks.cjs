// Rebuild the disposable workspace before every test:
// candidate skill under .claude/skills/<name>, then any companion skills named in
// vars.withSkills (comma-separated, copied from this repository's skills/), then the
// test's fixture, then one Git commit.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function git(ws, ...args) {
  execFileSync('git', ['-c', 'user.name=eval', '-c', 'user.email=eval@localhost', ...args], { cwd: ws, stdio: 'pipe' });
}

// Companion skills are installed as files only; the provider still loads only the candidate skill.
function copyCompanions(ws, skillDir, withSkills) {
  const names = (withSkills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const skillsRoot = path.resolve(skillDir, '..', '..');
  for (const name of names) {
    const category = fs.readdirSync(skillsRoot).find((c) => fs.existsSync(path.join(skillsRoot, c, name, 'SKILL.md')));
    if (!category) throw new Error(`withSkills: no skill named ${name}`);
    fs.cpSync(path.join(skillsRoot, category, name), path.join(ws, '.claude', 'skills', name), { recursive: true });
  }
}

function resetWorkspace(fixture, withSkills) {
  const { EVAL_WORKSPACE: ws, EVAL_SKILL: skill, EVAL_SKILL_DIR: skillDir, EVAL_SUITE_DIR: suiteDir } = process.env;
  if (!ws || !skill || !skillDir || !suiteDir) throw new Error('run through evals/run.sh');
  if (!fixture) throw new Error('every test needs vars.fixture');
  const fixtureDir = path.join(suiteDir, 'fixtures', fixture);
  if (!fs.existsSync(fixtureDir)) throw new Error(`missing fixture ${fixtureDir}`);

  fs.rmSync(ws, { recursive: true, force: true });
  fs.mkdirSync(ws, { recursive: true });
  fs.cpSync(skillDir, path.join(ws, '.claude', 'skills', skill), { recursive: true });
  copyCompanions(ws, skillDir, withSkills);
  fs.cpSync(fixtureDir, ws, { recursive: true });
  git(ws, 'init', '-q', '-b', 'main');
  git(ws, 'add', '-A');
  git(ws, 'commit', '-qm', 'fixture');
}

module.exports.extensionHook = async (hookName, context) => {
  if (hookName === 'beforeEach') {
    const vars = context.test.vars || {};
    resetWorkspace(vars.fixture, vars.withSkills);
  }
  return context;
};
