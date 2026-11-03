// A runnable question (do 6-character SHA-1 prefixes of the note ids collide?) is settled by running code.
// Exactly one pair collides; which pair can only be learned by running, so the spec must quote it.
const c = require('./_checks.cjs');

const DRAFT = 'docs/specs/draft/S0003-note-short-links.md';
const COLLIDING_PREFIX = '763b4e';
const COLLIDING_IDS = ['n02981', 'n08233'];

module.exports = () => {
  const spec = c.w.read(DRAFT) || '';
  return c.result({
    specQuotesPrototypeOutput: spec.includes(COLLIDING_PREFIX) || COLLIDING_IDS.every((id) => spec.includes(id)),
    productCodeUnchanged: c.changedSinceFixture('src', 'bin', 'data', 'package.json').length === 0,
    stillDraft: c.isDraft(spec) && c.activeSpecs().length === 0,
    noGateBRecordedAsPassed: !c.gatePassed(spec, 'B'),
  });
};
