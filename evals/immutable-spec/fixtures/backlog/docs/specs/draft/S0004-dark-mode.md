# Dark mode for the editor

Spec-ID: S0004
Status: draft
Change-Type: feature
Created Time: 2026-11-01T09:40:00+08:00
Start Time:
Completion Time:
Previous Spec-ID:
Closure Reason:

## 1. Requirement Details
- Background: users write at night and the white editor is too bright.
- Scope: a dark theme for the editor, switched from the settings menu and remembered between sessions.
- Constraints: no new dependencies.
- Non-goals: themes for other screens.

## 2. Outline Design
- Module: `src/theme.js` stores the chosen theme; the editor reads it on load.
- Risk and rollback: revert the change.

## References
- None.

## 3. Execution Plan
- [ ] p1-1 add the dark theme styles → TC-1
- [ ] p1-2 add the settings switch and remember the choice → TC-2

## 4. Test and Acceptance Criteria
- TC-1 the editor uses dark colors when the dark theme is selected
  method: command: `node test/theme.test.js`
- TC-2 the chosen theme survives a reload
  method: command: `node test/theme-persist.test.js`
- Pass/fail criteria: every TC passes.

## 5. Execution Log (append-only)

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
