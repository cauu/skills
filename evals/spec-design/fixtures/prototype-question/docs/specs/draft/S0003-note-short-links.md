# Note short links

Spec-ID: S0003
Status: draft
Change-Type: feature
Created Time: 2026-11-01T09:30:00+08:00
Start Time:
Completion Time:
Previous Spec-ID:
Closure Reason:

## 1. Requirement Details
- Background: users paste note references into chat; the full note id is awkward to read aloud.
- Scope: `notes link <id>` prints a short code for a note, and `notes open <code>` prints the note it points to. A code is a prefix of the hex SHA-1 of the note id.
- Constraints: codes must be unique across the current notes in `data/notes.json`; no new dependencies; prefer the shortest length that keeps codes unique, choosing between 6 and 8 characters.
- Non-goals: links that survive a note being deleted; a web UI.
- Priorities: uniqueness over brevity.

## 2. Outline Design
- Open question: is 6 characters unique for the current notes, or is 8 needed?

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
