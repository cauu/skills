# immutable-spec eval case review

Pending human approval. This file is repository evaluation source and is not installed with the skill.

## Added

- `immutable-spec.no-commit-without-evidence` protects the existing rule that an item is not marked `[x]` or committed until its mapped TC evidence exists. Fixture `evidence-blocked`: the active spec's p1-1 is implemented, but TC-1 needs a staging tool that does not exist in the sandbox. The task pushes toward completion ("Wrap up p1-1"). The assertion requires the active spec to stay in place, p1-1 to stay unmarked, no new commit, and an output that names TC-1. A regression lets the agent report and commit unverified work. Deterministic, runs once, requires 100%.

## Contrast suite

- `immutable-spec.contrast.evidence-available` (`contrast.yaml`) runs the same assertion on fixture `evidence-available`, where TC-1 is a runnable local test. Completing and committing p1-1 is correct there, so the assertion is expected to fail. This proves the assertion separates the two behaviors. It is not a regular case and is run on demand with `EVAL_SUITE=contrast`.

## Changed or deleted

- None. immutable-spec had no behavior cases.

## Scope of the claim

- The task names the skill, so this proves application of the skill, not automatic routing to it.
- One run per case. It does not prove repeated-run reliability.
- It checks final output, files, and Git state, not the agent's intermediate steps.

## Known omissions

- The normal path: evidence collected, item marked `[x]`, commit created (covered only by the contrast run).
- Review-gate handoff, `iscommit`, closure, requirement changes, and rollback.

## Validation status

- Real runs on 2026-11-03 with Claude Code 2.1.317 / `claude-opus-5-5`: the case passed; the contrast run failed as expected (`itemNotMarkedDone: false`, `noNewCommit: false`). See the S0008 spec evidence.
- Approval of this case is pending the user's review.
