// The mistake that happened twice (UTC day via toISOString().slice(0, 10)) becomes a
// check wired into the project's commands: it passes on the result, fails when a
// recorded past occurrence is replayed, and its failure names the fix.
const fs = require('fs');
const path = require('path');
const L = require('./_lib.cjs');

// The line introduced in e41c0d2, replayed verbatim in a new module. Never shown to the agent.
const REPLAY = `const { lineTotal } = require('./pricing');

function renderCsvAgain(orders) {
  const stamp = new Date().toISOString().slice(0, 10);
  return \`# exported \${stamp}\`;
}

module.exports = { renderCsvAgain };
`;

function scripts(dir) {
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  const names = Object.keys(pkg.scripts || {});
  return names.filter((n) => n === 'test' || /lint|check/.test(n));
}

function runAll(dir) {
  return scripts(dir).map((name) => ({ name, ...L.run(dir, 'npm', ['run', name]) }));
}

module.exports = (output) => {
  const clean = runAll(L.currentCopy());

  const replayed = L.currentCopy();
  fs.writeFileSync(path.join(replayed, 'src/replayed-export.js'), REPLAY);
  L.run(replayed, 'git', ['add', '-A']);
  const withReplay = runAll(replayed);
  const failing = withReplay.filter((r) => r.status !== 0);

  return L.result({
    checksPassOnResult: clean.length > 0 && clean.every((r) => r.status === 0),
    replayedMistakeFails: failing.length > 0,
    failureNamesFix: failing.some((r) => /formatLocalDate/.test(r.out)),
    citesFirstOccurrence: /\b(91b2e6a|a3f9c21)/.test(output),
    citesSecondOccurrence: /\b(e41c0d2|7be0d44)/.test(output),
  });
};
