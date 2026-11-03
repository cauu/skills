# review-03 Code Review — notes-export

Reviewer ID: review-03
Provider: cursor
Execution: external-cli
Scope reviewed: user-provided diff
Base/diff: working tree  |  Files: 2, Lines: +19
Review standard: none

## Assessment

Overall: COMMENT
Works for the sample data; missing tests.

## Findings

### P0 — Critical
- none

### P1 — High
- none

### P2 — Medium
- **[bin/notes.js:11]** `JSON.parse` errors are not handled
  - Issue: a malformed `data/notes.json` throws a raw stack trace.
  - Risk: unclear error for users.
  - Suggested fix: catch the error and print a short message with exit code 1.

### P3 — Low
- none

## Removal / Iteration candidates
- none

## Notes / residual risk
- Add a test for `exportCsv`.
