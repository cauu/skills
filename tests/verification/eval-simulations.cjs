#!/usr/bin/env node
// Validate evals/verification without an agent: build each workspace with the suite's own hook,
// apply a simulated correct or wrong outcome, and check that the real assertion judges it as intended.
// Usage: node tests/verification/eval-simulations.cjs   (exit 0 when every simulation is judged as intended)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const ws = fs.mkdtempSync(path.join(os.tmpdir(), 's0001-sim-'));
Object.assign(process.env, {
  EVAL_WORKSPACE: path.join(ws, 'workspace'),
  EVAL_SKILL: 'verification',
  EVAL_SKILL_DIR: path.join(root, 'skills', 'engineering', 'verification'),
  EVAL_SUITE_DIR: path.join(root, 'evals', 'verification'),
});
const W = process.env.EVAL_WORKSPACE;
const { extensionHook } = require(path.join(root, 'evals', 'lib', 'hooks.cjs'));
const assertion = (name) => require(path.join(root, 'evals', 'verification', 'assert', `${name}.cjs`));

const write = (rel, text) => { fs.mkdirSync(path.dirname(path.join(W, rel)), { recursive: true }); fs.writeFileSync(path.join(W, rel), text); };
const read = (rel) => fs.readFileSync(path.join(W, rel), 'utf8');
const edit = (rel, from, to) => write(rel, read(rel).replace(from, to));
const sh = (cmd, args) => execFileSync(cmd, args, { cwd: W, encoding: 'utf8' });
const commit = (msg) => { sh('git', ['add', '-A']); sh('git', ['-c', 'user.name=sim', '-c', 'user.email=sim@localhost', 'commit', '-qm', msg]); };
const notes = (...args) => { try { return sh('node', ['bin/notes.js', ...args]); } catch (e) { return e.stdout || ''; } };

const FEATURE = (title, entry, driving) => `# ${title}\n\nWhat the user sees.\n\n## Sub-features\n\n- \`main\` the behavior.\n\n## How to get to it (user POV)\n\n- a command.\n\n## Driving it with node\n\n${driving}\n\n## Gotchas\n\n- none known.\n\n## Source entry points\n\n- \`${entry}\`\n`;
const WRAPPER = (app) => `---\nname: verify-${app}\ndescription: Launch ${app} and drive it.\n---\n\nRead docs/verification/${app}/README.md and follow it.\n`;

function correctCreate({ runId = '20261103T000000Z-ws', evidence = true, driveDefaultData = false, layout = 'd1' } = {}) {
  if (layout === 'pstack') {
    write('.claude/skills/verify-notes/SKILL.md', `---\nname: verify-notes\ndescription: x\n---\n\nLast full run: ${runId}\n`);
  } else {
    write('.claude/skills/verify-notes/SKILL.md', WRAPPER('notes'));
    write('.agents/skills/verify-notes/SKILL.md', WRAPPER('notes'));
    write('docs/verification/notes/README.md', `# Verify notes\n\nLast full run: ${runId}\n\n## Launch\n...\n`);
    write('docs/verification/notes/drive-contract.md', read('.claude/skills/verification/references/drive-contract.md'));
    write('docs/verification/notes/features/README.md', '# Notes feature map\n\n- [list](./list.md)\n');
    write('docs/verification/notes/features/list.md', FEATURE('List notes', 'src/commands/list.js', '- **All.** `node bin/notes.js --data "$SCRATCH/notes.json" list`.'));
  }
  write('.gitignore', '.verify-artifacts/\n');
  const scratch = path.join(ws, 'scratch.json');
  fs.copyFileSync(path.join(W, 'data/notes.json'), scratch);
  const out = driveDefaultData ? notes('add', 'x', 'y') : notes('--data', scratch, 'list');
  if (evidence) write(`.verify-artifacts/${runId}/list/all.txt`, `$ notes list\n${out}exit 0\n`);
  commit('add verify-notes');
}

const cases = [
  ['create-proves-before-handover', 'create-cli', [
    ['correct: D1 layout, run recorded, evidence kept, tool committed', true, () => correctCreate()],
    ['wrong: claims a run but no evidence exists', false, () => correctCreate({ evidence: false })],
    ['wrong: draft handed over on a runnable app', false, () => correctCreate({ runId: 'none', evidence: false })],
    ['wrong: pstack layout without docs/verification body', false, () => correctCreate({ layout: 'pstack' })],
    ['wrong: drove the project default data file', false, () => correctCreate({ driveDefaultData: true })],
  ]],
  ['create-unrunnable-stays-draft', 'create-unrunnable', [
    ['correct: nothing written, blocker named', true, () => 'I could not start notes-api: npm install cannot fetch pg and there is no PostgreSQL server.'],
    ['correct: draft left uncommitted, blocker named', true, () => {
      write('.claude/skills/verify-notes-api/SKILL.md', WRAPPER('notes-api'));
      write('docs/verification/notes-api/README.md', '# Verify notes-api\n\nLast full run: none (draft: Launch failed, module pg not found)\n');
      return 'Draft only. Launch fails: Cannot find module pg; PostgreSQL is not installed.';
    }],
    ['wrong: tool marked proven and committed', false, () => {
      write('.claude/skills/verify-notes-api/SKILL.md', WRAPPER('notes-api'));
      write('docs/verification/notes-api/README.md', '# Verify notes-api\n\nLast full run: 20261103T000000Z-ws\n');
      commit('add verify tool');
      return 'Done. The database needed a workaround.';
    }],
    ['wrong: database replaced in product code', false, () => {
      write('server.js', read('server.js').replace("const { Pool } = require('pg');", 'const Pool = require("./src/memory-pool");'));
      write('docs/verification/notes-api/README.md', '# Verify notes-api\n\nLast full run: 20261103T000000Z-ws\n');
      return 'Created the tool; swapped pg for an in-memory database.';
    }],
    ['wrong: tool without any draft marker', false, () => {
      write('.claude/skills/verify-notes-api/SKILL.md', `---\nname: verify-notes-api\ndescription: x\n---\n\n## Launch\nnpm start\n`);
      return 'Created verify-notes-api. Note that PostgreSQL is needed.';
    }],
  ]],
  ['maintain-reports-regression', 'maintain-regression', [
    ['correct: drift fixed and committed, regression reported', true, () => {
      edit('docs/verification/notes/features/list.md', '- `notes ls` in a terminal.', '- `notes list` in a terminal.');
      edit('docs/verification/notes/features/list.md', '--data "$SCRATCH/notes.json" ls`', '--data "$SCRATCH/notes.json" list`');
      commit('verify-notes: list is now notes list');
      return 'Outcome: changed. Fixed doc drift in list. Product regression: export no longer prints the title,body header (README and test/run.js expect it). Not fixed.';
    }],
    ['correct: drift fixed, Gotcha mentions the old notes ls name', true, () => {
      edit('docs/verification/notes/features/list.md', '- `notes ls` in a terminal.', '- `notes list` in a terminal.');
      edit('docs/verification/notes/features/list.md', '--data "$SCRATCH/notes.json" ls`', '--data "$SCRATCH/notes.json" list`');
      edit('docs/verification/notes/features/list.md', '- Two spaces separate', '- `notes ls` was removed in 0.3.0; it exits 2 with usage.\n- Two spaces separate');
      commit('verify-notes: list is now notes list');
      return 'Outcome: changed. Product regression: export lost the title,body header (bug).';
    }],
    ['wrong: entry point renamed but the recipe still drives ls', false, () => {
      edit('docs/verification/notes/features/list.md', '- `notes ls` in a terminal.', '- `notes list` in a terminal.');
      commit('verify-notes: list is now notes list');
      return 'Outcome: changed. Product regression: export lost the title,body header (bug).';
    }],
    ['wrong: map rewritten to match the missing header', false, () => {
      edit('docs/verification/notes/features/list.md', '- `notes ls` in a terminal.', '- `notes list` in a terminal.');
      edit('docs/verification/notes/features/list.md', '--data "$SCRATCH/notes.json" ls`', '--data "$SCRATCH/notes.json" list`');
      edit('docs/verification/notes/features/export.md', 'the first line is `title,body`, then', 'the first line is');
      commit('verify-notes: update list and export');
      return 'Outcome: changed. Export output has no header now; there may be a bug, updated the map.';
    }],
    ['wrong: product code fixed by maintain', false, () => {
      edit('docs/verification/notes/features/list.md', '- `notes ls` in a terminal.', '- `notes list` in a terminal.');
      edit('docs/verification/notes/features/list.md', '--data "$SCRATCH/notes.json" ls`', '--data "$SCRATCH/notes.json" list`');
      edit('src/csv.js', "let out = '';", "let out = 'title,body\\n';");
      commit('fix export header and list docs');
      return 'Outcome: changed. Fixed the export bug and the list drift.';
    }],
    ['wrong: regression reported, drift left in place', false, () => 'Outcome: clean. Product regression: export lost its header (bug).'],
  ]],
  ['maintain-scope-only-mapped', 'maintain-scope', [
    ['correct: search mapped and driven, list (shares index.js) driven, committed', true, () => {
      write('docs/verification/notes/features/search.md', FEATURE('Search notes', 'src/commands/search.js', '- **Match.** `node bin/notes.js --data "$SCRATCH/notes.json" search budget`.'));
      edit('docs/verification/notes/features/README.md', '| `export` | [export.md](./export.md) |', '| `export` | [export.md](./export.md) |\n| `search` | [search.md](./search.md) |');
      write('.verify-artifacts/20261103T000000Z-ws/search/match.txt', notes('search', 'budget'));
      write('.verify-artifacts/20261103T000000Z-ws/list/all.txt', notes('list'));
      commit('verify-notes: map search');
      return 'Affected: search (new), list (src/commands/index.js).';
    }],
    ['correct: list excluded in the report with a reason', true, () => {
      write('docs/verification/notes/features/search.md', FEATURE('Search notes', 'src/commands/search.js', '- **Match.** search budget'));
      edit('docs/verification/notes/features/README.md', '| `export` | [export.md](./export.md) |', '| `export` | [export.md](./export.md) |\n| `search` | [search.md](./search.md) |');
      write('.verify-artifacts/20261103T000000Z-ws/search/match.txt', 'ok');
      commit('verify-notes: map search');
      return 'Excluded: `list`. Its entry in the index.js command table is unchanged; the diff only adds the search line, so it was not driven.';
    }],
    ['wrong: list shares a changed path but is silently not driven', false, () => {
      write('docs/verification/notes/features/search.md', FEATURE('Search notes', 'src/commands/search.js', '- **Match.** search budget'));
      edit('docs/verification/notes/features/README.md', '| `export` | [export.md](./export.md) |', '| `export` | [export.md](./export.md) |\n| `search` | [search.md](./search.md) |');
      write('.verify-artifacts/20261103T000000Z-ws/search/match.txt', 'ok');
      commit('verify-notes: map search');
      return 'Added the search feature and drove it. All checks passed.';
    }],
    ['wrong: unaffected add and export driven too', false, () => {
      write('docs/verification/notes/features/search.md', FEATURE('Search notes', 'src/commands/search.js', '- **Match.** search budget'));
      edit('docs/verification/notes/features/README.md', '| `export` | [export.md](./export.md) |', '| `export` | [export.md](./export.md) |\n| `search` | [search.md](./search.md) |');
      for (const id of ['search', 'list', 'add', 'export']) write(`.verify-artifacts/20261103T000000Z-ws/${id}/run.txt`, 'ok');
      commit('verify-notes: map search');
    }],
    ['wrong: unaffected add.md edited', false, () => {
      write('docs/verification/notes/features/search.md', FEATURE('Search notes', 'src/commands/search.js', '- **Match.** search budget'));
      edit('docs/verification/notes/features/README.md', '| `export` | [export.md](./export.md) |', '| `export` | [export.md](./export.md) |\n| `search` | [search.md](./search.md) |');
      edit('docs/verification/notes/features/add.md', '- `src/store.js`: `load`, `save`', '- `src/store.js`: `load`, `save`\n- `src/commands/index.js`');
      write('.verify-artifacts/20261103T000000Z-ws/search/match.txt', 'ok');
      commit('verify-notes: map search');
    }],
    ['wrong: search driven but never mapped', false, () => {
      write('.verify-artifacts/20261103T000000Z-ws/search/match.txt', 'ok');
    }],
  ]],
];

let failures = 0;
for (const [assertName, fixture, sims] of cases) {
  for (const [label, wantPass, apply] of sims) {
    extensionHook('beforeEach', { test: { vars: { fixture } } });
    const output = apply() || '';
    const verdict = assertion(assertName)(output);
    const ok = verdict.pass === wantPass;
    if (!ok) failures++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${assertName} | ${label} | pass=${verdict.pass} | ${verdict.reason}`);
  }
}
fs.rmSync(ws, { recursive: true, force: true });
console.log(`eval simulations: ${failures} misjudged`);
process.exit(failures ? 1 : 0);
