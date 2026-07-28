---
name: immutable-spec-delivery
description: Execute software delivery with append-only specification documents as the single source of truth. Use when the user requires each request to be tracked in one spec containing requirement details, solution design, execution plan, and test acceptance criteria, and requires item-level commits (for example p3-1) that reference the spec filename.
---

# Immutable Spec Delivery

## Core Rules

1. Treat the spec as the only execution and acceptance standard for that request.
2. Keep specs append-only: never rewrite or delete existing text in a spec; add new sections or new entries only.
3. Create a new spec file for every new requirement or scope change.
4. Preserve traceability: every code change, test, and commit must map to a spec item ID.
5. Auto-commit after each completed item unless the user explicitly disables auto-commit or requires a review gate before commits.
6. Keep delivery linear: allow multiple historical spec files to exist, but permit only one active spec at any time.
7. Do not close or complete the active spec until the user explicitly confirms that the spec is finished, replaced, or cancelled.
8. Allow `draft` specs to be edited freely before execution starts.
9. Once a spec becomes `active`, treat it as append-only.

## Spec Location and Naming

Store specs under:

```text
docs/specs/                  # current active spec only
docs/specs/draft/            # not yet started
docs/specs/completed/        # finished specs
```

Rules:
- `docs/specs/` root may contain only one spec file, and it must be the current `active` spec.
- `docs/specs/draft/` may contain multiple draft specs.
- `docs/specs/completed/` contains all finished specs, regardless of whether they ended as delivered, replaced, or cancelled.

Spec-ID allocation rules:
- `Spec-ID` values use zero-padded auto-incrementing identifiers such as
  `S0001`, `S0002`, `S0003`.
- Allocate the next ID by scanning existing draft, active, and completed spec
  filenames or headers and choosing the next unused number.
- Never reuse an old `Spec-ID`, even if the older spec was cancelled or
  replaced.
- If the user explicitly provides a `Spec-ID`, honor it only if it does not
  collide with an existing spec.

Filename rules:

1. Draft specs use a stable `Spec-ID` filename:

```text
docs/specs/draft/S0007-mithril-bootstrap.md
```

2. Active and completed specs use the execution start timestamp prefix plus the same `Spec-ID`:

```text
docs/specs/20260308T1030-S0007-mithril-bootstrap.md
docs/specs/completed/20260308T1030-S0007-mithril-bootstrap.md
```

3. When a draft becomes active:
- move it from `draft/` to `docs/specs/`
- rename it to `YYYYMMDDTHHMM-SpecID-slug.md`
- record `Start Time` and `Previous Spec-ID` in the spec header

4. When an active spec becomes completed:
- move it to `docs/specs/completed/`
- keep the same filename
- record `Completion Time` and `Closure Reason` in the spec header

Timestamp rules:
- Spec header timestamps must use ISO 8601 with an explicit numeric UTC offset,
  for example `2026-03-10T15:04:05+08:00`.
- Spec filenames use the repository-local sortable convention
  `YYYYMMDDTHHMM` without a timezone suffix.
- Do not mix ambiguous human-readable timestamps such as `3/10/26 3:04 PM`.

## Spec File Contract

Use one spec file per request. Include all of these sections in that file:

```markdown
# <Spec Title>

Spec-ID: S0007
Status: draft | active | completed
Created Time:
Start Time:
Completion Time:
Previous Spec-ID:
Closure Reason:

## 1. Requirement Details
- Background
- Scope
- Constraints
- Non-goals

## 2. Outline Design
- Architecture / modules impacted
- Data model and interfaces
- Risk and rollback strategy

## References
- docs/codebase-map.md
- <other spec-local references as needed>

## 3. Execution Plan
- [ ] pX-1 <deliverable>
- [ ] pX-2 <deliverable>
- ...

## 4. Test and Acceptance Criteria
- TC-1 ...
- TC-2 ...
- Pass/fail criteria

## 5. Execution Log (append-only)
- <date> pX-1 started ...
- <date> pX-1 completed ...

## 6. Validation Evidence (append-only)
- <date> command/result summary mapped to TC-*

## 7. Change Requests (append-only)
- <date> requirement change / replacement / cancellation note
```

State rules:
- `draft`: written but not yet used for execution; content may be edited
- `active`: the only spec allowed to drive current work; content is append-only
- `completed`: execution is finished and the spec is closed with a terminal reason

Reference rules:
- Every spec should include a `References` section.
- Add only references that materially support execution, such as repository
  indexes, design docs, API mappings, ADRs, or external requirement documents.
- `References` support the spec; they do not replace the spec's own
  requirement, design, execution, or acceptance sections.
- See [`references/codebase-map.md`](references/codebase-map.md) for the
  repository-index reference rules.

Do not allow more than one `active` spec at the same time.

Completion rules:
- A spec can remain `active` even when all currently known items are marked `[x]`.
- Only change a spec from `active` to `completed` after the user explicitly says the spec is done.
- If the user reports bugs, regressions, or missing acceptance details before explicit closure, keep using the same active spec and append the follow-up work there.
- `completed` does not imply only one success case. It means the spec has ended.
- Required `Closure Reason` values:
  - `delivered`
  - `replaced`
  - `cancelled`

## Delivery Workflow

1. Read the active spec and extract pending item IDs (`pX-*`) plus mapped `TC-*`.
2. Implement exactly one item at a time.
3. Run the minimal test set that proves the mapped acceptance criteria.
4. Append execution and validation evidence to the spec (do not edit prior entries).
5. Commit immediately for that item.
6. Repeat until all plan items are complete.
7. After all known items are complete, keep the spec open until the user explicitly closes it or declares it complete.
8. When the user explicitly closes the active spec:
   - update `Status` to `completed`
   - fill `Completion Time`
   - fill `Closure Reason`
   - move the file into `docs/specs/completed/`

## Item State Progression

Use only these states in `Execution Plan`:

- `[ ]` not started
- `[~]` in progress
- `[x]` completed

Transition rules:
- Change `[ ]` to `[~]` when work on that item actually starts.
- Change `[~]` to `[x]` only after implementation is complete, the mapped `TC-*` evidence is appended, and the item is ready to commit.
- Do not mark `[x]` based on implementation alone.
- If a closed-looking spec receives a bug report before user sign-off, append a new item instead of reopening history by editing old log statements.

## Item ID Convention

Use item IDs in the form `pX-N`.

Rules:
- `X` is the execution bucket inside the current spec, such as a phase,
  workstream, or grouped delivery slice.
- `N` is the sequence number within that bucket.
- For small specs with a single bucket, default to `p1-1`, `p1-2`, `p1-3`.
- When the plan has clearly separate grouped tracks, use distinct buckets such
  as `p2-*`, `p3-*`, or `p5-*`.
- Do not interpret `X` as the `Spec-ID` number.
- Follow-up repair items may continue the existing sequence or use a scoped
  suffix such as `p3-6-fix1` when that improves traceability.

## Commit Standard

Use one commit per completed item with this format:

```text
spec(<spec-filename>): <item-id> <short action>
```

Use this commit body template:

```text
Spec: <spec path>
Item: <item-id>
Acceptance: <TC list>
```

Rules:
- Include the spec filename and item ID in every commit message.
- Do not mix multiple item IDs in one commit unless the user explicitly approves.
- Do not submit an item as done without evidence mapped to `TC-*`.
- Treat "item completed" as all of: implementation finished, acceptance verified, and spec evidence appended.
- If the user requires pre-commit review, stop after code changes and evidence are ready, present the delta for review, and wait for explicit approval before committing.
- If the worktree contains unrelated uncommitted changes, do not auto-commit until those changes are isolated or the user explicitly approves the mixed commit.
- Follow-up bug-fix commits before spec closure must still use the same active spec filename and the new appended item ID.

Review-gate handoff template:
- Append an execution-log line such as:
  `<date> <item-id> awaiting review: implementation and validation evidence are ready; commit paused pending user approval.`
- Do not create the commit until the user explicitly approves.

## Manual Intervention Commit (iscommit)

Use this workflow when the user has manually authored code changes outside of Claude and wants to reconcile those changes with the active spec.

### Preconditions

- An active spec must exist in `docs/specs/`.
- The worktree must have uncommitted changes (`git status` shows modified or untracked files).

### Workflow

1. **Collect changes** — run `git status` and `git diff` (staged and unstaged). Summarize the changed files and the nature of each change to the user.

2. **Read active spec** — extract the execution plan items (with their `[ ]`/`[~]`/`[x]` states), the item ID numbering convention, and the current `TC-*` list.

3. **Map changes to item(s)** — determine which spec item(s) the manual changes satisfy:
   - If the changes match an existing `[ ]` or `[~]` item, propose mapping to that item.
   - If no existing item covers the changes, propose a new item ID following the spec's numbering convention.
   - If the changes span multiple items, ask the user whether to split into separate commits or combine under one item.
   - **Wait for user confirmation** before proceeding. Do not edit the spec until the user approves the mapping.

4. **Update spec (append-only)** — after user confirmation:
   - Mark the mapped item `[x]` (or add a new `[x]` item if one was proposed).
   - Append an execution log entry with a `(manual)` tag, for example:
     `<date> <item-id> completed (manual): <short description of manual changes>`
   - Add new `TC-*` entries to the acceptance criteria section if the manual changes introduce untested behavior.

5. **Run validation** — execute build and test commands for the mapped `TC-*` entries. Append validation evidence using the standard format. If any validation fails, stop and report the failure to the user — do not commit.

6. **Commit** — use the standard commit format:
   ```text
   spec(<spec-filename>): <item-id> <short action>
   ```
   Stage only the files relevant to the mapped item. Include the spec file in the commit.

### Rules

- Must confirm the change-to-item mapping with the user before editing the spec.
- Do not mark an item `[x]` without appended validation evidence.
- Stop on partial validation failure — do not commit partially validated work.
- If the user's diff contains in-place edits to existing spec content (not append-only additions), reject those edits and ask the user to revert the spec changes. The spec remains append-only.
- All existing commit rules, item ID conventions, and validation evidence formats apply without modification.

## Validation Evidence

Use one append-only evidence line per acceptance check. Keep the format stable:

```text
TC-<n> | stack: <rust|node|python|ansible|ui|other> | command: <cmd or manual step> | result: <pass|fail> | note: <short observation>
```

Examples:
- `TC-1 | stack: rust | command: cargo test -q | result: pass | note: deploy payload defaults covered`
- `TC-2 | stack: node | command: pnpm build | result: pass | note: deploy wizard renders with new defaults`
- `TC-3 | stack: ansible | command: ansible-playbook --syntax-check ansible/playbooks/deploy.yml | result: pass | note: playbook syntax valid`
- `TC-4 | stack: ui | command: manual validation of takeover banner | result: pass | note: probe warning shown for running node`

Choose commands based on the project stack. Standardize the evidence format, not the toolchain.

## Bug Fixes Before Spec Closure

If the user reports a bug, regression, or missing acceptance detail for an active spec:

1. Do not create a new spec by default.
2. Append a new item to the same active spec for that bug fix.
3. Append any new `TC-*` acceptance lines needed for the bug fix.
4. Add new execution log and validation evidence entries for that appended item.
5. Commit the bug fix with the same spec filename and the appended item ID.

Recommended item naming:
- Continue the existing numbering if practical, for example `p35-7`.
- If the plan is already frozen and you need a clearly scoped repair item, use a suffix such as `p35-6-fix1`.

Create a new spec only when the user changes scope, constraints, or requirements beyond the current spec boundary.

## Handling Requirement Changes

1. Do not modify active spec requirement/design/plan sections in-place beyond append-only updates.
2. Create a new draft spec file for new scope or changed constraints.
3. Draft specs may be edited until they become active.
4. When a new spec replaces the current active spec:
   - mark the current active spec as `completed`
   - set `Closure Reason: replaced`
   - move it to `docs/specs/completed/`
   - promote the new draft to the only active spec
5. Record the replaced spec's `Spec-ID` in the new active spec as `Previous Spec-ID`.
6. Do not inherit unfinished plan items automatically into the new spec. Re-state the new scope and plan explicitly in the new spec.

## Codebase Map and Repository Index

Use the repository index rules in
[`references/codebase-map.md`](references/codebase-map.md).

That reference defines:
- where `docs/codebase-map.md` lives
- how specs should reference it
- when to trust it versus rescan code
- when to update it incrementally versus regenerate it fully

## Exceptions

Allow delayed commit only in these cases:

1. The user explicitly requests a single combined commit.
2. The item is partially implemented but does not yet satisfy its acceptance criteria.
3. An external blocker prevents collecting the required evidence.
4. The user requires review and explicit approval before each commit.
5. The user invokes `iscommit` for manually authored changes — follow the Manual Intervention Commit workflow instead of the standard delivery workflow.

If an exception is used, append the reason to `Execution Log` before pausing the commit.

## Rollback and Recovery

Treat rollback as a new forward-only change, not as history rewrite.

Rules:
- Never rewrite or delete old spec content to represent a rollback.
- Prefer `git revert <commit>` over destructive history editing.
- Create a new rollback draft spec for committed or released changes that must be undone.
- Record which original spec and item are being rolled back.
- Add rollback acceptance evidence before marking the rollback item complete.

Rollback spec minimum content:
- rollback reason
- affected original spec filename
- affected item IDs or commit SHAs
- rollback steps
- validation criteria after rollback

Rollback execution rules:
1. For uncommitted local mistakes, fix them in the working tree; this is not a formal rollback.
2. For committed but unreleased changes, prefer a new item that reverts or corrects the prior commit.
3. For released, deployed, or externally validated changes, require a new rollback spec and a dedicated rollback commit.
