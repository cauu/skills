# Code Review Checklist (shared by every reviewer)

## Severity levels

Severity describes potential impact if the finding is valid. It does not itself
authorize a fix or block a merge.

| Level | Meaning |
|-------|---------|
| P0 | Potential security hole, data loss, or critical correctness failure |
| P1 | Potential logic error, major design violation, or performance regression |
| P2 | Potential maintainability, reliability, or localized design problem |
| P3 | Low-impact concern worth human consideration |

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

## Standard compliance (only when scope.md provides a review standard)

For each applicable requirement or acceptance criterion, judge the change as
**met / partially-met / not-met** with file:line evidence. Flag scope drift:
code that goes beyond the supplied standard, or requirements with no
corresponding change.

## Finding quality bar

Every finding must include: severity, `file:line` evidence, the concrete risk,
and a specific suggested fix. Skip vague style opinions unless they affect
maintainability or user-facing behavior.
