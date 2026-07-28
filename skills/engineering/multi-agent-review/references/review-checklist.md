# Review Checklist (shared by every agent)

Use the senior-engineer lens from the sibling `code-review-expert` skill. Its
detailed checklists are the source of truth; load them when you need depth:

- `../code-review-expert/references/solid-checklist.md`
- `../code-review-expert/references/security-checklist.md`
- `../code-review-expert/references/code-quality-checklist.md`
- `../code-review-expert/references/removal-plan.md`

## Severity levels

| Level | Meaning | Action |
|-------|---------|--------|
| P0 | Security hole, data loss, correctness bug | Must block merge |
| P1 | Logic error, major SOLID violation, perf regression | Fix before merge |
| P2 | Code smell, maintainability, minor SOLID issue | Fix in PR or follow up |
| P3 | Style, naming, minor suggestion | Optional |

## What to inspect

1. Correctness & edge cases — null/empty, boundaries, off-by-one, async errors,
   race conditions / TOCTOU.
2. Security & data safety — injection, XSS, SSRF, path traversal, authz/authn,
   secret leakage, unsafe deserialization, weak crypto.
3. SOLID & architecture — SRP/OCP/LSP/ISP/DIP smells; propose minimal, safe splits.
4. Quality & reliability — swallowed exceptions, N+1 queries, hot-path cost,
   unbounded memory/loops, silent failure modes.
5. Tests & regression risk — missing coverage for the change; suggest concrete tests.
6. Removal candidates — dead, redundant, or flagged-off code (safe-delete vs defer).

## Spec compliance (only when scope.md provides a spec standard)

For each `Execution Plan` item (`pX-N`) and `Test/Acceptance` criterion (`TC-*`)
in the spec, judge the change as **met / partially-met / not-met** with file:line
evidence. Flag scope drift: code that goes beyond the spec, or spec items with no
corresponding change.

## Finding quality bar

Every finding must include: severity, `file:line` evidence, the concrete risk,
and a specific suggested fix. Skip vague style opinions unless they affect
maintainability or user-facing behavior.
