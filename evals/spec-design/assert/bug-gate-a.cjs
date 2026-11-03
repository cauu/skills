// Complex bug: the spec records the reproduction output verbatim and a located root cause, nothing is fixed,
// no fix design is written, and gate A is left for the user.
const c = require('./_checks.cjs');

const DRAFT = 'docs/specs/draft/S0003-discount-total.md';
// What bin/cart.js prints for data/cart-1042.json with SAVE10. Only running it gives the float tail.
const OBSERVED = '47.157700000000006';

module.exports = (output) => {
  const spec = c.w.read(DRAFT);
  const before = c.original(DRAFT);
  return c.result({
    recordsObservedOutputVerbatim: spec !== null && spec.includes(OBSERVED),
    rootCauseLocated: spec !== null && /cart\.js:\d+/.test(spec),
    noFixDesignYet: c.section(spec, 2) === c.section(before, 2),
    productCodeUnchanged: c.changedSinceFixture('src', 'bin', 'data', 'package.json').length === 0,
    noGateRecordedAsPassed: spec !== null && !c.gatePassed(spec, 'A') && !c.gatePassed(spec, 'B'),
    stillDraft: c.isDraft(spec) && c.activeSpecs().length === 0,
    asksUser: c.asksUser(output),
  });
};
