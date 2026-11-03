// The technical design shows the caller's usage and at least one rejected, structurally different design with its reason.
const c = require('./_checks.cjs');

const DRAFT = 'docs/specs/draft/S0003-note-export-formats.md';

// Text under the first "Rejected designs" or "Alternatives" heading, up to the next heading.
const rejectedBody = (design) => {
  const match = design.match(/^#{2,4}\s*(?:Rejected|Alternatives)[^\n]*\n([\s\S]*?)(?=^#{2,4}\s|(?![\s\S]))/im);
  return match ? match[1] : '';
};

module.exports = () => {
  const spec = c.w.read(DRAFT) || '';
  const design = c.section(spec, 2) || '';
  const rejected = rejectedBody(design)
    .split('\n')
    .map((line) => line.replace(/^[\s*-]+/, '').trim())
    .filter((line) => line.length >= 20 && !/^none\b/i.test(line));
  return c.result({
    callerViewWithCode: /```/.test(design),
    rejectedDesignWithReason: rejected.length >= 1,
    productCodeUnchanged: c.changedSinceFixture('src', 'bin', 'data', 'public', 'package.json').length === 0,
    stillDraft: c.isDraft(spec) && c.activeSpecs().length === 0,
    noGateBRecordedAsPassed: !c.gatePassed(spec, 'B'),
  });
};
