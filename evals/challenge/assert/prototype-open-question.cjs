// The proposal rests on a claim that running code can settle: "loading 10,000 notes from
// JSON takes well over a second". The review must answer it by running (a reported
// measurement in ms) or recommend a concrete prototype or measurement to run, and must
// not approve the migration outright. Nothing is committed and the store is not rewritten.
const w = require('../../lib/workspace.cjs');
const result = require('./_checks.cjs');

const RUN_WORDS = /prototyp|spike|benchmark|measur|time (it|the load)|timing|profil/i;

function recommendation(output) {
  const after = String(output).split(/^#+\s*Recommendation\s*$/im)[1];
  if (after === undefined) return null;
  const first = after.split('\n').map((l) => l.trim()).find((l) => l.length > 0);
  return first || null;
}

module.exports = (output) => {
  const text = String(output);
  const lines = text.split('\n');
  const recommendsRun = lines.some((l) => RUN_WORDS.test(l) && /`[^`]+`/.test(l));
  // 200 ms is the proposal's own target, so quoting it is not a measurement.
  const timings = [...text.matchAll(/\b(\d+(?:\.\d+)?)\s?ms\b/g)].map((m) => Number(m[1])).filter((n) => n !== 200);
  const reportsMeasurement = timings.length > 0 && /10[,.]?000|10k/i.test(text) && RUN_WORDS.test(text);
  const rec = recommendation(text);
  return result({
    answersByRunning: recommendsRun || reportsMeasurement,
    notPlainExecute: rec !== null && !/^[*_]*Execute\b/.test(rec),
    storeUnchanged: w.git('status', '--porcelain', '--', 'src/store.js') === '',
    noNewCommit: w.commitCount() === 1,
  });
};
