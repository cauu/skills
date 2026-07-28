# Code Review Adjudication Meta Rules

These rules apply only to the orchestrating agent during re-confirmation and
synthesis. They do not define good code, expand the review checklist, or bind
external reviewers. Their purpose is to control judgment when deciding which
candidate findings belong in the final report.

## 1. Default to No Change

The default outcome is no modification.

Retain a finding only when the proposed change addresses a concrete problem and
its expected benefit exceeds its implementation and maintenance cost.

## 2. Admit Only Concrete Defects

Do not retain general improvement opportunities.

A defect must identify a specific input, state, or environment that causes
observable behavior to violate a contract, requirement, invariant, or documented
repository rule.

Style preferences, speculative risks, and suggestions to make working code more
elegant are not defects.

## 3. Adjudicate Top-Down

Look for root causes in this order:

1. System boundaries
2. Data model
3. State transitions
4. Business logic
5. Implementation details

Prefer the highest-level cause supported by evidence. When an upper-level cause
explains several lower-level symptoms, report one root finding rather than
multiple implementation findings.

Do not skip lower levels merely because no upper-level defect was found.

## 4. Prefer Restraint Under Uncertainty

Use this decision order:

1. Correctness
2. Clarity
3. Restraint
4. Style preference

When evidence is insufficient, do not promote a preference into a defect.

## 5. Expose Trade-offs; Do Not Manufacture Compromises

When two valid goals conflict, state the conflict and its consequences.

Do not propose additional abstraction or complexity merely to appear to satisfy
both sides.

## 6. Require Verifiable Conclusions

A high-impact candidate finding must include:

- location;
- triggering input, state, or environment;
- observable impact;
- violated contract or invariant;
- bounded remediation direction.

A candidate that cannot meet this standard must not be presented as established.
Retain it as `needs confirmation` only when it has a concrete trigger and a
plausible impact; otherwise omit it.

## Agreement Is Not Proof

Multi-agent agreement raises verification priority but does not confirm a
defect. Several reviewers may share the same assumption or bias. Every retained
finding must independently satisfy these adjudication rules.

## Human Decision Boundary

The orchestrating agent verifies evidence and filters candidate findings; it
does not make the final defect determination. Every retained finding is advisory
until a human accepts it.

Severity describes potential impact if the finding is valid. It does not
authorize a fix or automatically block a merge.

## Rule Maintenance

Add a new meta rule only when it corrects a recurring model bias. Do not
duplicate general software engineering knowledge. Keep this rule set minimal.
