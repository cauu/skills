# review-01 Code Review — notes-export

Reviewer ID: review-01
Provider: claude
Execution: external-cli
Scope reviewed: user-provided diff
Base/diff: working tree  |  Files: 2, Lines: +19
Review standard: none

## Assessment

Overall: REQUEST_CHANGES
CSV output is not escaped.

## Findings

### P0 — Critical
- none

### P1 — High
- **[src/export.js:3]** Fields are joined with `,` without CSV quoting
  - Issue: a title or body containing a comma, a double quote, or a newline is written as-is.
  - Risk: spreadsheets split the field into extra columns; exported data is silently corrupted.
  - Suggested fix: quote fields that contain `,`, `"`, or a newline, and double inner quotes.

### P2 — Medium
- none

### P3 — Low
- **[src/export.js:1]** The comment does not mention the column order.
  - Issue: readers must read the code to learn the columns.
  - Risk: low.
  - Suggested fix: list the columns in the comment.

## Removal / Iteration candidates
- none

## Notes / residual risk
- No tests cover the export command.
