# Export all notes from the web app

Spec-ID: S0003
Status: draft
Change-Type: feature
Created Time: 2026-11-01T09:30:00+08:00
Start Time:
Completion Time:
Previous Spec-ID:
Closure Reason:

## 1. Requirement Details
- Background: users want a copy of all their notes as one CSV file from the web app (`public/`, served by `src/server.js`).
- Scope: one control in the web app that downloads every note as `notes.csv`, and a `GET /api/export.csv` endpoint behind it.
- Constraints: no new dependencies; the page layout otherwise stays as it is.
- Non-goals: exporting a single note; import; other formats.

## 2. Outline Design
- Open question: does the export control go in the toolbar, or as an item in the Settings menu?

## References
- None.

## 3. Execution Plan
- To be written.

## 4. Test and Acceptance Criteria
- To be written.

## 5. Execution Log (append-only)
- 2026-11-01 draft created.
- 2026-11-02 gate A passed: scope, constraints and non-goals as written in section 1. Decided by: Dana.

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
