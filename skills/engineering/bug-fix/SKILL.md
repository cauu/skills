---
name: bug-fix
description: Fix a reported bug, reproduction first. Reproduce it read-only on the entry point where it was reported, stop and report when it does not reproduce, locate the root cause with run evidence, judge complexity, then either fix a simple bug with the failing check committed before the fix or route a complex bug to a lite spec and a user gate. Use when the user reports a bug, regression, crash, or wrong output and asks for it to be fixed.
---

# Bug Fix

Every shipped line traces to evidence from a run. A change that "might help" is a hypothesis, not a fix, and does not ship. Ship the smallest change the evidence justifies.

Optional skills, used when installed: `tdd` (failing test first), `immutable-spec` (lite spec template, delivery), `spec-design` (its "Complex bugs" path), and the project's `verify-<app>` skill. This skill works without any of them.

## 1. Precondition: a claimed task

Work only on a task the user named and claimed. If there is none, ask for it and stop. Do not create, pick, or claim one yourself. Every record below goes into that task, or into its PR.

## 2. Reproduce, read-only

Change no project files while reproducing. Drive the entry point where the bug was reported, preferring the project's `verify-<app>` skill, then an existing test or script, then the real app, CLI, or API. Record the exact command and its output verbatim.

If it does not fire, tighten the conditions (input data, flags, environment, timing) as far as your tools reach. If it still does not reproduce, stop. Write into the task:

- why it did not reproduce;
- every path tried, with its command and output;
- the missing conditions: what you would need to reproduce it.

Do not fix it, even when the user asked for a fix. The user decides where it goes next.

## 3. Locate the root cause

List candidate hypotheses. Eliminate them with runs, each one a probe, log line, or narrowed input whose output you record; prefer the run that rules out the most. Stop when one mechanism survives and a run confirms it. The root cause is the first place the system goes wrong, as `file:line` with that evidence. When evidence refutes a hypothesis, revert every change it motivated. Instrumentation is temporary and never committed.

## 4. Judge complexity

The bug is complex when any of these holds:

- the root cause crosses a module boundary;
- data, a migration, or concurrency is involved;
- a design decision is needed before fixing;
- the acceptance cannot be stated in one sentence.

Otherwise it is simple. Record the call and the condition that decided it in the task (and the spec, if one is created). The user can promote a simple bug to complex at any time.

## 5a. Complex: lite spec and gates

- With `immutable-spec`: create a draft spec from its `references/lite-spec-template.md` (`Change-Type: bugfix`). Without it: write the same parts into the task (reproduction record, root cause, then fix and verification standard) and tell the user the bug can be tracked in a spec instead.
- With `spec-design`, follow its "Complex bugs" path. Otherwise: write the reproduction record and root cause, ask the user to confirm both at gate A, and end your turn. Fix nothing before gate A passes. After it passes, write the fix, its blast radius, rollback, and acceptance checks that meet the gate below, then ask for activation at gate B.
- Record each gate only from the user's reply: `- <YYYY-MM-DD> gate A|B passed|returned: <conclusion>. Decided by: <user>.`
- Delivery follows the simple path's steps 1 to 4 under the active spec.

## 5b. Simple: fix directly

1. Write a failing check at the reproduction entry point: a test, or a script when no test reaches it (`tdd`'s "Bugs: reproduce first" when installed). Run it and see it fail for the reported reason. Commit it alone, before the fix.
2. Fix the root cause with the smallest change. No defensive extras, no refactors.
3. Name the other callers of the changed code and the fact that keeps them correct. Prove that fact with a run when it is cheap.
4. Verify on the same entry point that reproduced the bug: rerun the reproduction command, the failing check, and the existing suite. Unit tests alone show branch behavior, not that the bug is gone. A pass on another entry point, or an unclear result, is not a pass; say so. Commit the fix.

Record in the task or PR: the reproduction command, the failing output, the passing output (verbatim), and the commit SHAs.

## Evidence gate

<!-- gate:bugfix -->
- `bugfix`: the same entry point fails before the fix and passes after it, with the reproduction command and output recorded verbatim. Reproduce before fixing.
<!-- /gate -->

## Reply

What was broken, the root cause, the complexity call, the fix, and how you verified it, with the failing-then-passing output pasted verbatim. For an unreproduced bug: what you tried and what is missing.
