# Notes CSV export

Spec-ID: S0003
Status: draft
Change-Type: feature
Created Time: 2026-11-01T09:30:00+08:00
Start Time: 
Completion Time:
Previous Spec-ID:
Closure Reason:

## 1. Requirement Details
- Background: users want to take their notes into a spreadsheet.
- Scope: an "Export CSV" action that downloads every note as CSV.
- Constraints: no new dependencies.
- Non-goals: import.

## 2. Outline Design
- Module: `src/export.js` exports `exportCsv(notes)`; the toolbar gets an "Export CSV" button.
- Risk and rollback: revert the change.

## References
- None.

## 3. Execution Plan
- [ ] p1-1 implement `exportCsv` → TC-1
- [ ] p1-2 add the toolbar button → TC-2

## 4. Test and Acceptance Criteria
- TC-1 `exportCsv` writes a header and one line per note
  method: command: `node test/export.test.js`
- TC-2 the toolbar shows an "Export CSV" button that downloads the file
- Pass/fail criteria: every TC passes.

## 5. Execution Log (append-only)

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
