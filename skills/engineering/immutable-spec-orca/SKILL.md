---
name: immutable-spec-orca
description: Activate task-scoped append-only specs and hand full delivery ownership to one execution agent in an Orca worktree, using Codex by default or an explicitly user-selected agent/model. Requires the immutable-spec skill. Use when a real Task-ID must remain traceable from claim through implementation, integration, and closure, while the activating agent must stop after a verified full handoff. Do not use for supervised workers, coordinator loops, or ordinary single-agent work without a task claim.
---

# Immutable Spec Orca

Use this workflow when one agent prepares and activates a task spec, then transfers the whole delivery task to one Orca worktree agent. This is a full ownership handoff, not supervised delegation.

```text
one Task-ID = one active spec = one execution worktree = one delivery owner
```

Do not combine this skill's identity, lifecycle, evidence, or commit rules with a supervised orchestration workflow.

<!-- requires: immutable-spec -->
**Requires the `immutable-spec` skill.** This skill adds task identity and the Orca handoff on top of it. Read `immutable-spec` before using this skill, and apply these of its sections unchanged:

- Change Types and Evidence Gates
- Verification Plan and Activation Check
- Decision Gates and Autonomy
- Item State Progression
- Validation Evidence
- the closure rules: `spec-lint --stage close` and the verification tool update

Run its `scripts/spec-lint` from the installed `immutable-spec` skill directory. Where this skill and `immutable-spec` differ, this skill's identity, location, ownership, handoff, and commit rules win.

## Authority Model

- The task system owns Task-ID allocation, claim ownership, and open/closed state.
- The spec owns requirements, design, execution items, acceptance criteria, and append-only delivery history.
- The Activation Owner claims the task, refines the draft with the user, activates and commits the spec, creates the Orca worktree, sends a self-contained handoff, verifies acceptance, reports the handoff, and stops.
- The Worktree Owner receives full delivery ownership: implementation, clarification, self-validation, integration, spec completion, task closure, and final reporting.
- Orca owns worktree and terminal runtime state. Use its full-handoff interface, not its supervised Run/Task/Dispatch lifecycle.
- Git on the target branch proves integration. A passing worktree branch alone is not delivered work.

The Activation Owner does not wait for results, poll the terminal, answer worker questions, review the diff, merge commits, validate the target branch, or close the task after a successful handoff. If any of those duties are required, use a supervised workflow instead of this skill.

## Non-Negotiable Invariants

1. Claim a real task before creating its spec. Never fabricate, scan for, or allocate a Task-ID.
2. Use the task system's immutable Task-ID as the spec identity.
3. Permit at most one active spec and one authoritative worktree owner for the same Task-ID.
4. Split independently deliverable work into separate tasks before activation; do not assign multiple agents to one spec.
5. Make every code change, test result, and commit traceable to a spec item and mapped acceptance criteria.
6. Drafts may be rewritten. After activation, frozen requirements, design, plan, and acceptance text are append-only; scope changes require appended Change Requests and new items or criteria.
7. Lifecycle metadata and item checkbox transitions are the only exceptions to byte-for-byte append-only behavior. Execution Log, Validation Evidence, and Change Requests remain strictly append-only.
8. A handoff is not complete until Orca reports the new worktree, agent handle, and accepted prompt delivery.
9. After verified handoff, the Activation Owner must stop. Silence or later lack of progress does not restore its ownership.
10. The Worktree Owner may close the task only after integration and target-branch validation succeed.

## Task Claim Gate

Before writing a draft, establish:

- the real Task-ID, title, description, and current task-system state;
- an accepted claim owned by the Activation Owner;
- the target branch or integration target;
- no existing active spec or authoritative worktree owner for the same Task-ID.

If ownership is missing, ambiguous, expired, or held elsewhere, stop. If the task is too large for one delivery owner, split it in the task system before activation.

## Spec Location and Identity

Use stable filenames across lifecycle directories:

```text
docs/specs/draft/<task-id>-<slug>.md
docs/specs/active/<task-id>-<slug>.md
docs/specs/completed/<task-id>-<slug>.md
```

For GitHub Issues, raw Task-ID `owner/repository#123` maps to filename identity `issue#123`, for example:

```text
docs/specs/draft/issue#123-stage-acceptance.md
```

Keep the repository-scoped raw Task-ID in the header. Search draft, active, and completed headers before creating a spec. Never select a spec merely because it is the only Markdown file in a directory, and never rename the file while moving it between lifecycle directories.

## Spec Contract

```markdown
# <Task title>

Task-System:
Task-ID:
Task-URL:
Status: draft | active | completed
Change-Type: feature | optimization | bugfix | refactor
Activation Owner:
Execution Owner:
Target Branch:
Created Time:
Start Time:
Completion Time:
Closure Reason:
Replaces Task-ID:

## 1. Requirement Details
## 2. Outline Design
## References
## 3. Execution Plan
## 4. Test and Acceptance Criteria
## 5. Execution Log (append-only)
## 6. Validation Evidence (append-only)
## 7. Change Requests (append-only)
```

Existing specs that use `Primary Owner` remain valid. On their next lifecycle update, append the handoff and execution-owner identity rather than rewriting frozen history. Use ISO 8601 timestamps with an explicit numeric UTC offset.

## Draft and Activation

The Activation Owner:

1. Claims and reads the task.
2. Creates the draft using the exact Task-ID.
3. Clarifies requirements, constraints, non-goals, design, items, and acceptance criteria with the user.
4. Resolves the execution agent and model, then confirms one worktree owner can deliver the task.
5. Runs `spec-lint --stage activate` on the draft, fixes every error, and lists every `manual` TC to the user with the activation request.
6. On user approval, appends the gate B line, moves the spec to `docs/specs/active/`, sets `Status: active`, records Start Time, Activation Owner, and Target Branch, then commits only the activation state.
7. Captures that exact activation commit as the worktree base.

User approval to activate authorizes the full handoff and authorizes the Worktree Owner to integrate and close the task after every spec gate passes, unless the user explicitly requires another review gate.

### Execution agent selection

- Use Codex with the environment's configured defaults when the user has not
  selected an execution agent or model.
- An explicit user selection of another supported agent, model, or reasoning
  mode overrides the Codex default. Follow that selection exactly; do not
  silently substitute Codex or another launcher.
- Before activating the spec, use the version-matched `orca-cli` guidance to
  verify that the selected launcher, authentication, and requested model or
  mode are available. If they are unavailable or ambiguous, stop before
  activation and ask the user how to proceed.
- A non-Codex Worktree Owner has the same ownership, spec, evidence, commit,
  integration, task-closure, and stop-after-handoff obligations defined by
  this skill. Agent selection never changes the one-owner invariant or turns
  the workflow into supervised orchestration.
- Use Orca's documented built-in `--agent` path when it preserves the user's
  selection. When an exact model or mode requires custom launcher arguments,
  use the documented custom-command full-handoff path and verify TUI readiness
  before sending the prompt.

## Full Handoff Through Orca

First load the version-matched `orca-cli` guidance from the installed Orca executable. Do not create an orchestration Run, Task, or Dispatch. Do not use `orchestration worker-start`, `check`, `ask`, `worker_done`, or coordinator messaging.

Create one child worktree from the exact activation commit and launch one agent there using the Orca full-handoff path. The handoff prompt must be self-contained and include:

- Task-System, raw Task-ID, task URL, and current claim;
- exact active spec path and activation/base commit;
- target branch and integration destination;
- concrete outcome and files, components, or environment in scope;
- constraints, invariants, non-goals, and user-owned files that must remain untouched;
- item IDs and mapped acceptance criteria;
- the verification plan: every TC with its method, the spec's evidence gate, and the instruction to record evidence lines with output excerpts as `immutable-spec` requires;
- isolation: when the application must run in this worktree, use ports, data directories, and profiles that do not collide with other worktrees, and never drive an instance this worktree did not start;
- commit format and integration/closure requirements;
- full ownership of clarification, implementation, validation, merge, spec completion, and task closure;
- instruction to avoid contacting or waiting for the Activation Owner;
- instruction to ask the user directly when a product decision is required, or record a durable blocker in the task system when direct user interaction is unavailable.

When worktree creation returns its identity and agent handle, record those identifiers in the spec before prompt delivery when practical. If that produces a later commit than the activation base, fast-forward the untouched child branch to the handoff-record commit before sending the prompt. Otherwise instruct the Worktree Owner to append the accepted handoff receipt as its first spec update.

The handoff succeeds only when Orca confirms prompt acceptance. Report the worktree identity, agent handle, branch, and acceptance receipt to the user, then end the turn. Do not monitor execution.

## Worktree Owner Contract

The handoff prompt must make the Worktree Owner responsible for the entire remaining lifecycle:

1. Verify Task-ID, active spec path, claim, base commit, target branch, and absence of a competing owner.
2. Append the handoff receipt and execution-owner identity if the Activation Owner could not record them before delivery.
3. Work only on this task and implement one item at a time.
4. Mark `[~]` only when an item starts and `[x]` only when the latest evidence of every mapped TC is `pass`. Stop and ask the user about any TC whose result is `inconclusive`.
5. Append execution notes and validation evidence before completing each item.
6. Commit each completed item using the required task metadata.
7. Resolve in-scope defects with appended Change Requests; do not silently broaden the task.
8. Integrate reviewed work into the target branch without rewriting shared history.
9. Verify the expected commits or equivalent changes are reachable from the target branch and run target-branch validation.
10. Run `spec-lint --stage close`, apply the verification tool update rule, then set `Status: completed`, record Completion Time and Closure Reason, move the spec to `docs/specs/completed/`, commit closure, close the task in its task system, and leave a durable final report.

If clarification is required, the Worktree Owner asks the user in its own session. It must not route questions through the Activation Owner or assume that the activating session is still running.

## Item and Evidence Rules

Use item IDs such as `p1-1`, `p1-2`, and `p2-1-fix1`, with these checkbox states:

- `[ ]` not started
- `[~]` in progress
- `[x]` implementation and mapped acceptance complete

`[x]` does not by itself prove integration or task closure.

Record evidence exactly as `immutable-spec` requires (Validation Evidence), and add `actor: worktree-owner` after the TC identifier:

```text
- <date> TC-<n> | actor: worktree-owner | type: <change-type> | method: <verify|command|manual> | command: <cmd> | exit: <code> | output: <key output lines> | result: <pass|fail|inconclusive|unreachable> | note: <observation>
```

Never record a pass without an executed command or explicit manual observation. Required validation failure blocks item completion.

## Commit Standard

Use one commit per completed item by default:

```text
spec(<task-id>): <item-id> <short action>

Task-System: <system>
Task-ID: <raw task id>
Spec: <spec path>
Item: <item-id>
Acceptance: <TC list>
```

Never mix Task-IDs or unrelated changes. Stage only the files belonging to the item. If unrelated changes cannot be isolated safely, record the blocker and stop rather than overwriting them.

## Integration and Closure

The Worktree Owner uses this order:

1. Complete all items and mapped acceptance.
2. Inspect its own full diff and commit scope.
3. Integrate into the target branch.
4. Prove the delivered commits or equivalent changes are reachable there.
5. Run target-branch validation and append evidence.
6. Complete and archive the spec with Closure Reason `delivered`, `replaced`, or `cancelled`.
7. Commit the lifecycle update.
8. Close the task in the task system.
9. Mark the Orca worktree completed or leave a durable blocker/report if cleanup cannot be performed from inside the active worktree.

Do not claim delivery when integration, validation, spec closure, or task-system closure is unverified.

## Handoff Failure and Recovery

Until prompt acceptance is positively confirmed, ownership remains with the Activation Owner. Inspect exact Orca receipts and retry only according to the version-matched `orca-cli` recovery guidance; never create a duplicate worktree owner from silence.

After acceptance, the handoff is complete. The Activation Owner must not poll, nudge, review, merge, clean up, or retry the worktree. A later user request may start a new, separately authorized session to inspect or intervene, but that is not continuation of the activation role.

If a legacy supervised Dispatch already exists for the Task-ID, settle or cancel it using version-matched orchestration recovery guidance before establishing the full handoff. Preserve any work it produced and record the ownership transition in the active spec.

## Final Handoff Check

Before stopping, verify only the handoff boundary:

- the task claim and Task-ID are real;
- the active spec has the same raw Task-ID and an exact activation commit;
- one child worktree and one agent own delivery;
- the handoff prompt contains the complete lifecycle contract;
- Orca confirms prompt acceptance;
- the user receives the worktree, branch, agent handle, and receipt identifiers;
- no supervised Run/Dispatch remains authoritative for the Task-ID.
