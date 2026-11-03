# Note export in several formats

Spec-ID: S0003
Status: draft
Change-Type: feature
Created Time: 2026-11-01T09:30:00+08:00
Start Time:
Completion Time:
Previous Spec-ID:
Closure Reason:

## 1. Requirement Details
- Background: users want their notes outside the app: CSV for spreadsheets, Markdown for other editors, JSON for scripts.
- Scope: `notes export --format csv|md|json` on the CLI (`bin/notes.js`), and `GET /api/export?format=csv|md|json` on the server (`src/server.js`). Both return the same bytes for the same format and data. An unknown format is an error on both (exit code 2 on the CLI, status 400 on the server).
- Constraints: no new dependencies; CSV quotes fields that contain commas, quotes, or newlines; adding a fourth format later should touch as few places as possible.
- Non-goals: import; exporting a subset of notes; a button in the web page.
- Priorities: identical output on CLI and server over brevity of the code.

## 2. Outline Design
- To be written.

## References
- None.

## 3. Execution Plan
- To be written.

## 4. Test and Acceptance Criteria
- To be written.

## 5. Execution Log (append-only)
- 2026-11-01 draft created.
- 2026-11-02 gate A passed: scope, constraints and non-goals as written in section 1; no open questions. Decided by: Dana.

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
