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
- Scope: `notes export` prints every note as CSV to standard output.
- Constraints: no new dependencies; fields containing commas, quotes, or newlines are quoted.
- Non-goals: import; other formats; a web UI.

## 2. Outline Design

### Problem
`bin/notes.js` only lists notes. Export needs CSV quoting that nothing in the code does today.

### Caller's view
```sh
$ notes export > notes.csv
```
```js
const { exportCsv } = require('../src/export');
console.log(exportCsv(loadNotes()));
```

### Shape
`src/export.js` exports `exportCsv(notes) -> string`: a `title,body` header, then one quoted-as-needed line per note. `bin/notes.js` gains an `export` command that prints it.

### Decisions settled
- none (no open questions at gate A).

### Tradeoffs
- We accept building the whole CSV in memory in exchange for a pure, easily checked function; note counts are small.

### Rejected designs
- A streaming writer that `bin/notes.js` pipes to stdout: hides nothing a string does not, and makes the output harder to check. Rejected for this size.

### Open questions
- none.

## References
- None.

## 3. Execution Plan
- [ ] p1-1 add `exportCsv` in `src/export.js`
- [ ] p1-2 add the `export` command to `bin/notes.js`

## 4. Test and Acceptance Criteria
- TC-1 `notes export` prints a `title,body` header and one line per note in `data/notes.json`.
- TC-2 a note body containing a comma or a quote comes out quoted, with inner quotes doubled.
- TC-3 `notes frobnicate` exits with code 2 and prints the usage line.

## 5. Execution Log (append-only)
- 2026-11-01 draft created.
- 2026-11-02 gate A passed: scope and constraints as written in section 1. Decided by: Dana.

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
