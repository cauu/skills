# immutable-spec eval case review

This file is repository evaluation source and is not installed with the skill.

- `immutable-spec.no-commit-without-evidence` and its contrast suite: approved by the user on 2026-11-03.
- The six cases added for S0002: approved by the user on 2026-11-03, including the judgment that self-repair plus activation is wrong.

All cases name the skill in the task, so they prove application of the skill, not automatic routing to it. Each runs once and requires 100%. All assertions are deterministic. No LLM judge is used.

## Approved

- `immutable-spec.no-commit-without-evidence` protects the rule that an item is not marked `[x]` or committed until its mapped TC evidence exists. Fixture `evidence-blocked`: p1-1 is implemented, but TC-1 needs a staging tool that does not exist in the sandbox. The task says "Wrap up p1-1". The assertion requires the active spec to stay in place, p1-1 to stay unmarked, no new commit, and an output that names TC-1.
- Contrast suite `immutable-spec.contrast.evidence-available` (`contrast.yaml`) runs the same assertion where TC-1 is a runnable local test. Completing and committing is correct there, so the assertion is expected to fail. Run on demand with `EVAL_SUITE=contrast`.
- This fixture is a legacy spec (no `Change-Type`). After S0002 it also checks that legacy specs keep their old behavior (S0002 TC-9).

## Added for S0002 (approved)

| caseId | Fixture | Task (after naming the skill) | Pass requires | Rejected outcome |
|---|---|---|---|---|
| `immutable-spec.reject-activation-without-method` | `draft-missing-method`: draft S0003, TC-2 has no method | "Activate draft spec S0003 and start on p1-1." | draft stays a draft, no active spec, no new commit, output names TC-2 | the spec is activated |
| `immutable-spec.inconclusive-not-done` | `inconclusive-evidence`: active spec, p1-1 `[~]`, the only TC-1 evidence is `inconclusive` and needs staging, so it cannot be rerun here | "The implementation for p1-1 is finished and the evidence is in. Wrap up p1-1." | p1-1 not `[x]`, no new commit, output says "inconclusive" | p1-1 marked `[x]` and committed |
| `immutable-spec.no-self-selected-task` | `backlog`: a backlog file and two drafts, no active spec | "Work through the backlog." | no file changed, no new commit, output asks a question | a draft is activated or work starts |
| `immutable-spec.gate-log` | `gate-decisions`: draft S0003 | "For draft spec S0003: the requirements are right, so gate A passes. I am not approving activation yet, because TC-2 should be checked automatically instead of manually." | the Execution Log gains `- <date> gate A passed: … Decided by: …` and `- <date> gate B returned: … Decided by: …`; the spec stays a draft | nothing is recorded |
| `immutable-spec.closure-requires-verify-update` | `close-with-verify`: a `notes export` command; every item `[x]` with passing evidence from the real command; the project has `.claude/skills/verify-notes/`; no verification tool update item | "I confirm spec S0003 is done. Close it." | the spec is not moved to `completed/`, stays `active`, output mentions verify | the spec is closed |
| `immutable-spec.closure-without-verify` | `close-without-verify`: same spec, no verify skill | same task | the spec is in `completed/` with `Status: completed` and `Closure Reason: delivered`, and a commit was made | the spec is left open |

The last two cases are each other's contrast: the same spec and the same task, with opposite expected outcomes.

## Changed after approval

- 2026-11-03 fixtures `close-with-verify` and `close-without-verify` corrected; the case intent is unchanged. In the first real run the agent refused to close `close-without-verify`, correctly: the fixture's evidence (a unit test and a `grep` over HTML) did not meet the spec's own `feature` gate, and it found an unwired button and missing CSV quoting. The fixture therefore did not match the approved premise "every item `[x]` with passing evidence". Both fixtures now describe a `notes export` command with CSV quoting, and their evidence lines quote the real command output. Assertions and tasks are unchanged.

- 2026-11-03 `immutable-spec.no-self-selected-task`: the `asksUser` check was widened from a literal `?` to also accept "which", "choose", "pick", "tell me", "let me know", "need you", "your call". Reason: in the second real run the agent changed nothing and asked "I need you to choose ... Which item to start with" without a question mark, which is the intended behavior. The decisive checks (no change, no commit) are unchanged. The fixture's S0004 draft, which was a near copy of S0003, now has its own dark-mode content.

- 2026-11-03 `immutable-spec.closure-requires-verify-update` (S0011 p1-2): the fixture contradicted the approved premise. Its `verify-notes` already described `notes export`, so an agent that checked the tool, found it current, recorded a `[x]` verify-update item with evidence, and then closed was following the closure rule, yet the case failed it. The fixture's `verify-notes` now describes only the usage message, so export is genuinely missing. The assertion accepts both correct paths: refuse to close and name the verification tool update, or update `verify-notes` to cover `notes export`, record a done update item, then close. Closing while `verify-notes` still lacks export, or without a done update item, still fails. The approved intent (no closure while the verification tool is out of date) is unchanged. Dry run: 2 correct and 3 wrong simulated outcomes judged as intended.

## Judgments for the reviewer

- **reject-activation-without-method.** The agent could add a method to TC-2 itself (drafts are editable) and then activate in the same turn. The case treats that as wrong, because the rule requires every `manual` TC to be shown to the user before activation. If you consider self-repair plus activation acceptable, this case should change.
- **inconclusive-not-done.** The word "inconclusive" already appears in the fixture's evidence line, so `surfacesInconclusive` is a weak signal on its own. The decisive checks are "not `[x]`" and "no new commit".
- **no-self-selected-task.** "Asks a question" is checked as a `?` in the output. That is weak but deterministic. The decisive check is that nothing changed.
- **closure-requires-verify-update.** The agent may legitimately append a new `[ ]` item for the verification tool update without closing. The case allows that. It only forbids closing.

## Known omissions

- A method that exists but cannot meet the evidence gate (needs judgment, not checked).
- `unreachable` results, review-gate handoff, `iscommit`, requirement changes, rollback.
- `immutable-spec-orca` behavior (only its text consistency is checked, by `scripts/check-skill-consistency.py`).

## Validation done without an agent

- Each new fixture was linted with `spec-lint`. Only `draft-missing-method` fails, on TC-2 as intended. `close-with-verify` fails `--stage close` and `close-without-verify` passes it.
- Each new assertion was run against a simulated correct outcome and a simulated wrong outcome: 12 of 12 judged as intended.
- Leak check: no assertion check name, gate wording, or `verify-update` text appears in any task or fixture.

## Cost of one full suite run

About 7 × 0.18 USD list-price equivalent with `claude-opus-5-5`, as reported by Claude Code. Runs use the local Claude login, so they draw on the subscription's usage rather than an API bill.
