# <Bug title>

Spec-ID: S0000
Status: draft
Change-Type: bugfix
Created Time:
Start Time:
Completion Time:
Previous Spec-ID:
Closure Reason:

## 1. Requirement Details
- Background: <the reported symptom, who sees it, and where>
- Scope: <the defect this spec fixes>
- Constraints: <what must not change>
- Non-goals: <related problems left out>

### Reproduction record
- Entry point: <command, request, or user path>
- Command: `<exact reproduction command or steps>`
- Observed: <output excerpt that shows the defect>
- Expected: <what the entry point should produce>

### Root cause
- <the first place the system goes wrong, with `file:line` and the evidence that shows it>

## 2. Outline Design
- Fix: <the smallest change the evidence justifies>
- Blast radius: <other callers or paths the change touches, and why they stay correct>
- Risk and rollback: <how to revert>

## References
- <task, logs, or prior specs>

## 3. Execution Plan
- [ ] p1-1 add a failing check at the reproduction entry point → TC-1
- [ ] p1-2 fix the root cause → TC-1, TC-2

## 4. Test and Acceptance Criteria
- TC-1 the reproduction entry point fails before the fix and passes after it
  method: command: `<reproduction command>`
- TC-2 <neighboring behavior that must stay correct>
  method: command: `<command>`
- Pass/fail criteria: TC-1 and TC-2 pass; TC-1 has a recorded `fail` line before the fix.

## 5. Execution Log (append-only)

## 6. Validation Evidence (append-only)

## 7. Change Requests (append-only)
