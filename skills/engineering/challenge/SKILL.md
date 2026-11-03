---
name: challenge
description: Review a proposed solution from an adversarial perspective before implementation. Use when the user presents a technical design, architecture, implementation plan, migration strategy, or product proposal and wants to determine whether it is worth executing, simplify it, or challenge its assumptions.
---

# Adversarial Solution Review

Review the proposal from the opposing side before recommending implementation. Challenge the proposal rather than polishing or defending it.

## Review Criteria

Determine:

1. **Real problem** — Does the proposal address the underlying problem, or merely package, relocate, or mask its symptoms?
2. **Overengineering** — Does it introduce abstractions, infrastructure, flexibility, dependencies, or operational burden that the current problem does not require?
3. **Legacy accommodation** — Does it treat historical baggage, accidental architecture, existing process, or backward compatibility as immutable constraints without sufficient justification?

Distinguish verified facts from assumptions. Challenge assumptions that materially affect scope, architecture, cost, or reversibility. Prefer removing work over making unnecessary work more elegant.

**Prototype what can be run.** When a question can be answered by running something (behavior, timing, layout, performance), do not settle it on paper. Recommend the smallest prototype or measurement that answers it: what to run, on what input, and which result decides the question.

**Check every acceptance criterion.** For each criterion in the proposal, state how the agent can verify it itself: a command, a test, a measurement, or the project's `verify-<app>` skill when one exists. A criterion the agent cannot run needs a stated reason why only a human can judge it. Flag every criterion that has neither, and propose a runnable rewrite.

## Required Output

Use these headings:

```markdown
## Recommendation

Execute | Revise before execution | Do not execute

<Concise rationale>

## Delete

- <Parts of the proposal that should be removed>

## Challenge

- <Assumption> — <Why it may be false and how to test it; for a runnable question, the prototype or measurement to run>

## Minimum Viable Solution

<The smallest solution that addresses the verified problem>

## Acceptance Criteria Check

- <Criterion> — one of: `agent: <command, test, measurement, or verify skill>` | `human only: <reason>` | `unverifiable: <runnable rewrite>`

## Missing Acceptance Criteria

- <Additional observable pass/fail condition and how the agent verifies it>
```

If the available evidence is insufficient, recommend a bounded investigation or reversible experiment instead of implementation. Do not invent certainty.
