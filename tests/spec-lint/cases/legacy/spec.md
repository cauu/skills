# Export

Spec-ID: S0001
Status: active
Created Time: 2026-03-10T09:00:00+08:00

## 1. Requirement Details
- Scope: export.

## 2. Outline Design
- Module: export.

## References
- None.

## 3. Execution Plan
- [x] p1-1 add export → TC-1
- [ ] p1-2 docs → none (reason: wording only)

## 4. Test and Acceptance Criteria
- TC-1 export writes 3 rows
  method: command: `node test/export.test.js`
- TC-2 print preview shows two columns
  method: manual (reason: native print dialog)
- Pass/fail criteria: all TCs pass.

## 5. Execution Log (append-only)
- 2026-03-10 p1-1 started.

## 6. Validation Evidence (append-only)
- 2026-03-10 TC-1 | type: feature | method: command | command: node test/export.test.js | exit: 0 | output: export ok (3 rows) | result: pass | note: ok

## 7. Change Requests (append-only)
