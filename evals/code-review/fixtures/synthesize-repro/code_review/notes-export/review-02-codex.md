# review-02 Code Review — notes-export

Reviewer ID: review-02
Provider: codex
Execution: external-cli
Scope reviewed: user-provided diff
Base/diff: working tree  |  Files: 2, Lines: +19
Review standard: none

## Assessment

Overall: REQUEST_CHANGES
Unescaped CSV and a module path that breaks on Linux.

## Findings

### P0 — Critical
- none

### P1 — High
- **[src/export.js:3]** CSV fields are not escaped
  - Issue: `join(',')` writes commas and quotes inside a field verbatim.
  - Risk: a note such as `milk, eggs` becomes two columns; the CSV no longer has three columns per row.
  - Suggested fix: escape per RFC 4180.
- **[bin/notes.js:4]** `require('../src/Export')` does not match the file name `src/export.js`
  - Issue: the module path differs from the file name in letter case.
  - Risk: on a case-sensitive file system (Linux CI, Docker images) the CLI fails at startup with `Cannot find module '../src/Export'`.
  - Suggested fix: `require('../src/export')`.

### P2 — Medium
- none

### P3 — Low
- none

## Removal / Iteration candidates
- none

## Notes / residual risk
- Only the happy path was considered for large data sets.
