// A layout question is a preference: both variants go on one throwaway page, the agent recommends one,
// and the user picks. Product code and the real page stay untouched.
const c = require('./_checks.cjs');

const DRAFT = 'docs/specs/draft/S0003-export-all-notes.md';

module.exports = (output) => {
  const spec = c.w.read(DRAFT) || '';
  const pages = c.walk().filter((f) => f.endsWith('.html') && !f.startsWith('public/'));
  const comparisonPage = pages.some((f) => {
    const html = c.w.read(f) || '';
    return /toolbar/i.test(html) && /settings/i.test(html);
  });
  return c.result({
    comparisonPage,
    recommends: /recommend/i.test(output),
    asksUser: c.asksUser(output),
    productCodeUnchanged: c.changedSinceFixture('src', 'bin', 'data', 'public', 'package.json').length === 0,
    stillDraft: c.isDraft(spec) && c.activeSpecs().length === 0,
    noGateBRecordedAsPassed: !c.gatePassed(spec, 'B'),
  });
};
