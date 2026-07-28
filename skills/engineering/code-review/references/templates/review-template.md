# <REVIEWER_ID> Code Review — <feature>

Reviewer ID: <review-01>
Provider: <claude | codex | cursor | native>
Execution: <external-cli | native-subagent>
Scope reviewed: <explicit ref/range | working tree | branch fallback>
Base/diff: <base ref or "working tree">  |  Files: <N>, Lines: <±M>
Review standard: <document path or "none">

## Assessment

Overall: <APPROVE | REQUEST_CHANGES | COMMENT>
One-line rationale.

## Findings

### P0 — Critical
- **[path/to/file.py:42]** Title
  - Issue: ...
  - Risk: ...
  - Suggested fix: ...

### P1 — High
- ...

### P2 — Medium
- ...

### P3 — Low
- ...

## Standard Compliance
<!-- omit this section if no review standard was provided -->
- <requirement or criterion>: met | partially-met | not-met — evidence
- Scope drift: <code beyond the standard, or requirements with no change>

## Removal / Iteration candidates
- <safe-delete-now | defer-with-plan>: ...

## Notes / residual risk
- Areas not covered, assumptions, follow-up tests worth adding.
