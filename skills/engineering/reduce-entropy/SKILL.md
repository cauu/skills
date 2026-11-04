---
name: reduce-entropy
description: User-triggered periodic cleanup. Find entropy (repeated mistakes, dead code, one-caller wrappers, redundant validators, comments that restate code), pin behavior before each change, delete before adding, revert changes that do not lower reader load, and turn each mistake that happened twice into the highest-level check that catches it.
disable-model-invocation: true
---

# Reduce Entropy

Structure changes. Behavior does not. A change is kept only if a reader now has less to hold in their head for the same behavior.

## Scope

Use the paths the user names, otherwise the whole repository. For history, use the window the user names, otherwise everything since the last reduce-entropy commit, capped at about 100 commits. If history is not in Git (imported, squashed), use what the user points to: exported logs, PR review comments.

Work on a branch, not the default branch. Do not push or merge.

## 1. Scan

List every entropy source before changing anything. Each entry needs evidence a reader can check: commit SHAs, `file:line`, or a review comment.

- **Repeated mistakes.** Read recent commits, reverts, review comments, agent instruction files, and comments that explain workarounds. Group them into classes. A class counts once it has happened twice. List each occurrence. A mistake seen once is not a class yet.
- **Dead code.** No caller anywhere: search names in code, strings, config, dynamic dispatch, tests, and docs. Anything exported from a published package is not dead without the user's word.
- **One-caller wrappers.** A module whose only caller could call what it wraps, and which adds nothing but a name. Apply the deletion test: if deleting it makes complexity vanish, it was a pass-through.
- **Redundant validators.** Checks that repeat what a type, the only caller, or an earlier check already guarantees. Name the guarantee.
- **Comments that restate code.** Keep comments that say why, or that record a constraint the code cannot express.

Output:

| # | Kind | Location | Evidence | Action | Size |
|---|---|---|---|---|---|

`Action` is delete, collapse, or encode at level N (section 3), or leave with a reason. `Size` is small or large.

Verify every citation before it goes in the table: run `git show <sha>` for each commit and open each `file:line`, and confirm it shows what the entry claims. A commit from the same feature or PR is not enough. Correct a citation that does not match, or drop it.

If the user asked only for the scan, stop here.

## 2. Change, one entry at a time

**Small** means a few files in one module, no interface used outside the repository, and a diff one reviewer checks in minutes. Everything else is **large**: do not change code for it. Write each large entry as a Task file the user can file: a draft spec under `docs/specs/draft/` where the project uses immutable-spec, otherwise `docs/tasks/<slug>.md`. It holds the entry with its evidence, the target shape, and the pin plan. Commit it on the branch and list its path in the report. The run is not finished while a large entry has no Task file.

Every change meets the refactor evidence gate (same text as `immutable-spec`):

<!-- gate:refactor -->
- `refactor`: pin current behavior before moving structure (characterization test, snapshot, or old-versus-new output comparison) and show it unchanged afterwards. Type checks and lint do not count. Pin before changing code.
<!-- /gate -->

For each small entry:

1. **Pin** through an interface that survives the change (an exported function, CLI, or endpoint), never through the code you are about to delete, so the same pin runs before and after. Put it where the project's test command runs it. Run it on the unchanged code and see it pass.
2. **Delete before adding.** Remove dead code, collapse the wrapper, drop the validator, or delete the comment before introducing anything new. Ship the smallest change that reaches the target.
3. **Change an interface in one wave.** Migrate every caller and delete the old interface in the same change. No compatibility shims, aliases, re-exports, or parallel old and new paths. Search strings, docs, and config for the old name.
4. **Prove.** Run the same pin, unedited. It must pass.
5. **Keep or revert.** Count what a reader must hold for this behavior: names, indirections, branches, files to open. If nothing went down, revert. A cleanup that only "might help" is reverted.
6. **Commit** one entry per commit, the pin first if it is new.

If you find a bug, do not fix it. Keep its current behavior pinned and report it for the bug-fix flow. Cleanup never changes behavior.

## 3. Turn repeated mistakes into structure

For each mistake class, use the highest level that works:

1. **Architecture.** Make the mistake unexpressible: one owner per piece of state, one supported way per task, internals hidden so the wrong import fails, one source of truth instead of hand-synced lists. Delete the old way an agent would copy.
2. **Types.** Make the bad state unwritable.
3. **Lint or CI check** whose error names the fix: the function, type, or file to use instead. If the pattern is already common, fail only on new occurrences.
4. **Test** of the behavior.
5. **Docs or agent rules**, only for judgment calls. Nothing fails when they are skipped.

Wire the check into a command the project already runs (test, lint, or CI). Prove it on a real past mistake: replay one recorded occurrence against the current code and show the check fails with its message; show it passes without the replay. In the report, record verbatim how you replayed it (the exact edit or `git show <sha>:<file>` you restored), each command you ran, and the output lines that show the failure and the pass. A result without its command is not proof. Do not add a check that cannot catch a real past mistake.

## Report

- The inventory table, citations verified.
- Per change: the pin, its result before and after, the reader-load delta, kept or reverted, and the commit.
- Per mistake class: its occurrences, the level chosen, why a higher level did not work, and the replay commands with their output.
- Bugs found and left alone, the Task file path for each large entry, and entries left with reasons.

Small changes go to review as they are, on the branch. The user merges.
