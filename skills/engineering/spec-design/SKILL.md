---
name: spec-design
description: Drive the design phase between claiming a task and activating its spec. Restate the goal, clarify requirements, stop for the user at gate A, settle open questions with throwaway prototypes or the user's choice, compare at least two technical designs, write acceptance criteria with runnable verification, and request activation at gate B. Use when the user asks to design, refine, or prepare a draft spec or task for delivery. Works on drafts only and never edits product code.
disable-model-invocation: true
---

# Spec Design

The agent drives the design. The user decides at two gates: gate A (requirements confirmed) and gate B (activation). Nothing in this skill edits product code.

## Inputs and outputs

- **Draft spec** (`Status: draft`): write requirements into section 1, the design into section 2, and acceptance criteria into section 4. Drafts are editable.
- **No spec** (the project keeps no specs, or the user names only a task): write the same content into the task. When the task cannot be edited, write `docs/design/<task-id>-<slug>.md` and say where it is. Do not create a spec format the project does not use.
- **Active or completed spec**: stop. Its text is frozen; a design change there is a Change Request.

Optional skills, used when installed: `immutable-spec` (spec format and `scripts/spec-lint`), `challenge` (step 6), `codebase-design` (design vocabulary), the project's `verify-<app>` skill and the `verification` skill (step 7). This skill works without any of them.

Record each gate decision as one appended line in the Execution Log, or at the end of the task or design document:

```text
- <YYYY-MM-DD> gate A passed|returned: <conclusion>. Decided by: <user>.
- <YYYY-MM-DD> gate B passed|returned: <conclusion>. Decided by: <user>.
```

Only the user's reply passes a gate. Never write `passed` for a gate the user has not passed.

Whenever you ask the user to decide, use [references/decision-brief.md](references/decision-brief.md): every open item carries your recommendation, its basis, and its risk, so the user can decide from that one reply.

## Workflow

### 1. Restate

Read the task and the code it touches. Write, in your own words, the goal, the problem it solves, and the smallest change that meets it. When the evidence shows that the requested change will not solve the problem, or that the problem does not exist, say so plainly and propose what would.

### 2. Clarify

Answer every question the code can answer yourself, with `file:line`. Put only product and preference questions to the user. Write section 1: background, scope, constraints, non-goals, priorities.

### 3. Gate A: requirements confirmed

Send the gate A request and end your turn. Until the user passes gate A, write no design (section 2), no prototypes, and no acceptance criteria (section 4). When the user returns it, log `returned`, revise, and ask again.

### 4. Settle open questions

List the questions the design depends on, and settle each one by its kind:

- **Runnable** (behavior, timing, performance, feasibility, what the existing code or data actually does): build the smallest throwaway prototype, run it, and decide by its output yourself. Do not settle a runnable question by reading code or by guessing. Record the command and an output excerpt under "Decisions settled".
- **Preference** (interaction, layout, wording, product tradeoff): build the variants into one page with a labeled switch between them, recommend one, and let the user pick. A non-visual tradeoff needs only a decision brief. Record the choice after the user makes it.

Prototypes live in a scratch directory and are never committed: by default `.scratch/<spec-or-task-id>/` at the project root, with `.scratch/` added to `.git/info/exclude`. A prototype may import product code but never changes it. The spec records the evidence, because the scratch directory will be deleted.

### 5. Technical design

Write the design with [references/rationale-template.md](references/rationale-template.md):

- Write the caller's view first: a README snippet and two or three call sites. Derive data structures, types, signatures, and module layout from it.
- Produce at least two structurally different designs (different data, ownership, or module shape, not variants of one shape).
- Screen every design against [references/design-red-flags.md](references/design-red-flags.md). Use `codebase-design` terms when it is installed.
- Record the chosen design, its tradeoffs, every rejected design with its reason, and the questions still open.

### 6. Challenge

Run `challenge` on the design when it is installed. Otherwise review it yourself for three things: whether it solves the real problem, whether it is overbuilt, and whether it treats an inherited constraint as fixed without reason. If the review does not end in "execute", go back to step 2 when the requirement is wrong and to step 5 when the design is wrong. Answer a challenge that a run can settle with a prototype, not with argument.

### 7. Acceptance criteria and verification plan

Declare the `Change-Type` (`feature`, `optimization`, `bugfix`, or `refactor`). Write each TC as an observable result with exactly one method:

- `verify:<feature-id>/<sub-feature>`: a feature of the project's `verify-<app>` skill. Take the IDs from its feature list.
- `command: <command or steps>`: a command or concrete steps the agent runs itself.
- `manual (reason: <why>)`: only when the agent cannot run the check.

Write the method on the line after the TC, indented, after the literal key `method:`. Tools such as `spec-lint` read only this form:

```markdown
- TC-1 <observable result>
  method: command: <command or steps>
```

Prefer methods the agent runs. Every TC must meet the evidence gate of the change type:

<!-- gate:feature -->
- `feature`: every TC passes on the real artifact (the running app, command, or interface), not on unit tests alone. Collect after implementation.
<!-- /gate -->
<!-- gate:optimization -->
- `optimization`: record a baseline before the change and the result after it, with the measurement method. Capture the baseline before changing code.
<!-- /gate -->
<!-- gate:bugfix -->
- `bugfix`: the same entry point fails before the fix and passes after it, with the reproduction command and output recorded verbatim. Reproduce before fixing.
<!-- /gate -->
<!-- gate:refactor -->
- `refactor`: pin current behavior before moving structure (characterization test, snapshot, or old-versus-new output comparison) and show it unchanged afterwards. Type checks and lint do not count. Pin before changing code.
<!-- /gate -->

When a TC must run on the real application and the project has no `verify-<app>` skill, propose creating one (`verification create`) in a decision brief. The user decides.

Map every execution plan item to its TCs with `→ TC-1, TC-2`, or `→ none (reason: ...)`. When `immutable-spec` is installed, run its `scripts/spec-lint --stage activate <spec>` and fix every error. Otherwise check by hand: every TC has exactly one `method:` line in the form above, every `manual` has a reason, every item is mapped.

### 8. Gate B: request activation

Send the gate B request, listing every `manual` TC with its reason, and end your turn. Do not activate the spec yourself before the user passes gate B. After the user passes it, log the line; activation follows the delivery workflow (`immutable-spec` or `immutable-spec-orca`).

## Small changes

A change to one or two files with an obvious approach may skip step 4 and the second design in step 5. Write the reason under "Rejected designs". Gates A and B and step 7 are never skipped.

## Complex bugs

Use `Change-Type: bugfix` and this shorter path:

- Steps 1 and 2 become a reproduction record and a root cause. Run the real entry point, record the command and the output verbatim, and find the first place the system goes wrong (`file:line` and the evidence). Write both into section 1.
- Gate A confirms the reproduction and the root cause. Fix nothing before then.
- Skip step 4 unless candidate fixes disagree on something a run can decide.
- Step 5 is only the fix, its blast radius, and rollback.
- If the bug does not reproduce, stop and report what you tried. The user decides where it goes next.

## When delivery shows the design is wrong

During implementation, the same awkward workaround reappearing in unrelated code, or types that compile only with casts or escape hatches, means the design is wrong, not the code. Stop the item, append a Change Request to the active spec, and return to this skill for the affected part. Enforcing this during delivery is the delivery workflow's job.
