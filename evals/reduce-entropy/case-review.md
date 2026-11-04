# reduce-entropy eval case review

This file is repository evaluation source and is not installed with the skill.

Status: designed for S0005 p1-3 on 2026-11-03. All three cases and the seven judgments below approved by the user on 2026-11-03 ("按建议").

All cases name the skill in the task, so they prove application, not routing (the skill is user-invoked anyway). Each runs once and requires 100%. All assertions are deterministic. No LLM judge is used.

## Fixture

All three cases share `fixtures/invoice-cli`, a small Node CLI (`node bin/invoice.js data/orders.json [--csv]`, `npm test` runs `node --test`). Planted in `src/report.js`:

- `getLineTotal`: a one-caller wrapper around `pricing.lineTotal`, not exported;
- `formatRowLegacy`: dead code;
- `assertValidLine`: a redundant validator (`loadOrders` already checks the same fields, and `bin/invoice.js` is the only caller);
- comments that restate code (`// loop over the orders`, ...);
- a real bug: the grand total skips the first order (`for (let i = 1; ...)`), although the README says "the grand total of all orders".

Also present: `renderCsv` reached only through a string-keyed command table (looks unused, is not), and a "why" comment in `pricing.js` that should stay.

### History

The eval hook (`evals/lib/hooks.cjs`) makes exactly one commit, so the fixture cannot carry Git history. Decision: encode the history as files the project could plausibly have after a squashed import, and say so in the task:

- `docs/git-log.txt`: a `git log -p` export of five commits. The mistake `toISOString().slice(0, 10)` (UTC day instead of local day) was introduced twice (91b2e6a, e41c0d2) and fixed twice (a3f9c21, 7be0d44). A one-off typo fix (5d18b7e) is a mistake seen once.
- `docs/review-notes.md`: exported PR comments, including "this keeps slipping through review".

Rejected alternative: extend the shared hook to replay a history script per fixture. That changes infrastructure every suite uses, for one suite's need. The cost of the chosen route: reading real `git log` is not exercised (listed under omissions).

## Cases

| caseId | Task (after naming the skill) | Pass requires | Rejected outcomes (simulated) |
|---|---|---|---|
| `reduce-entropy.inventory-with-evidence` | "This repo was imported without its Git history: the old `git log -p` is in docs/git-log.txt and the old PR review comments are in docs/review-notes.md. Scan the repo and give me the list. Don't change anything yet." | clean working tree and no new commit; output names `formatRowLegacy`, `getLineTotal`, `assertValidLine`, `src/report.js`, and one commit of each occurrence of the repeated mistake (91b2e6a or a3f9c21, and e41c0d2 or 7be0d44) | code changed and committed; a report file written; the repeated mistake listed without commit evidence |
| `reduce-entropy.pin-before-change` | "Clean up src/report.js." | wrapper and dead code gone from `src/` and `bin/`; CLI output, stderr and exit code on three hidden inputs identical before and after (so the grand-total bug is not fixed); a test file was added; the agent's non-production files, laid over the **original** code, pass `npm test`; `npm test` passes on the result; the same pin over the original code with `getLineTotal(line) + 1` at the wrapper's call site fails; at least one new commit | bug fixed inside the cleanup and pin re-recorded; no pin; a smoke test that pins nothing; a pin of `pricing.lineTotal` only (does not cover the restructured path); a pin written against a new export (fails on the original code); wrapper and dead code left in place |
| `reduce-entropy.repeated-mistake-to-check` | same history sentence, then "Some mistakes keep coming back here. Deal with those; leave the rest of the cleanup for another day." | every `test`, `*lint*`, `*check*` npm script passes on the result; after adding a new module containing the line from e41c0d2 (`new Date().toISOString().slice(0, 10)`) and staging it, at least one of those scripts fails and its output contains `formatLocalDate`; the reply cites one commit of each occurrence | a docs or agent-rule note only; a lint whose error does not name the fix; a check not wired into any npm script; a behavior test of the report (does not catch the mistake in new code); a reply without commit evidence |

Behavior and regression risk for each case are in `promptfooconfig.yaml` metadata.

## Judgments for the reviewer

1. **History as exported files** (see above). If you want real Git history, the shared hook has to change first.
2. **pin-before-change treats fixing the bug as wrong.** The skill says cleanup never changes behavior and bugs go to the bug-fix flow. An agent that fixes the grand total fails, even if it reports the fix.
3. **The pin must run under `npm test`.** A pin run by another command (a separate snapshot script, a manual old-versus-new diff in the reply) fails `pinAdded` or `pinPassesOnOriginal`. The skill says "put it where the project's test command runs it", so this is intended, but it excludes valid pin styles.
4. **pin-before-change requires a commit.** The skill says to commit one entry per commit. The task does not ask for commits.
5. **Removing `assertValidLine` and the restating comments is not required** in pin-before-change. Only the wrapper and the dead code are. Deleting the validator is a judgment call (an exported function loses its own guard), so the case neither requires nor forbids it.
6. **repeated-mistake-to-check replays the mistake in a new file.** A behavior test of the existing report cannot catch that, a source check can. This encodes the skill's order (lint is above test). Architecture and types are not feasible in this plain-JS fixture, so the case does not check that the agent tried them.
7. **"Don't change anything" includes not writing a report file** in inventory-with-evidence.
8. **Either the introducing or the fixing commit counts** as evidence for an occurrence.

## Known omissions

- Restating comments in the inventory (no stable identifier); false positives such as calling `renderCsv` dead; promoting the once-seen typo to a class.
- Reverting a change that does not lower reader load.
- Large changes handed back as a Task instead of being made.
- Interface changes migrating every caller in one wave (the wrapper is internal).
- Real `git log` reading, and history windows.
- Whether the agent itself ran the pin before changing code (the assertion proves the pin holds on the original code, not when it was run).

## Validation done without an agent

Run on 2026-11-03 with `node /tmp/s0005-validate/validate.cjs <repo>` (a scratch harness, not committed): it rebuilds the workspace through `evals/lib/hooks.cjs`, applies a simulated outcome with plain file edits and commits, and calls the assertion.

- Fixture: `npm test` exits 0; the report prints three rows and `TOTAL  $148.70` (the bug: the first order, $32.82, is left out); `--csv` works; `getLineTotal` has one caller, `formatRowLegacy` none, `toISOString` does not occur in `src/` or `bin/`.
- Assertions: 18 simulated outcomes, 3 correct and 15 wrong, all judged as intended. The first draft of pin-before-change accepted a pin that covered only `pricing.lineTotal`, because the mutation was in `pricing.js`; the mutation now sits at the wrapper's call site in `src/report.js`.
- Leak check: no hidden input, mutation, replay text, check name, or fixture identifier appears in any task; none of the hidden values appear in the fixture; the skill names no fixture identifier.
- `promptfoo validate -c evals/reduce-entropy/promptfooconfig.yaml`: "Configuration is valid."

## Real run

2026-11-03, `npm run eval:reduce-entropy` (result `cauu-skill-eval.lf3mwA`): 3 of 3 passed on the first run, exit 0, 3 min 37 s. Claude Code reported 0.21, 0.43 and 0.25 USD list-price equivalent (about 0.89 USD in total). No case hit the 40-turn limit.

- inventory-with-evidence: nothing changed; every planted entry listed with `file:line` and both occurrences of the repeated mistake cited by SHA.
- pin-before-change: the agent committed `test/report.test.js` first (through `bin/invoice.js`), then made 5 more commits; it reported the grand-total bug and pinned the wrong total instead of fixing it. It also deleted `assertValidLine` (allowed by judgment 5).
- repeated-mistake-to-check: the agent chose a source-scanning test run by `npm test`, explained why architecture, types and lint did not fit, replayed `src/export.js` from e41c0d2 itself, and did not promote the once-seen typo.

## Changed after approval

None. The cases and assertions are unchanged.

## Rerun after p1-1-fix1 (2026-11-04)

The skill gained three rules from the bubble-hub pilot audit: verify every cited SHA and `file:line` before listing it, write each large entry as a committed Task file, and record replay commands and output verbatim. `npm run eval:reduce-entropy` (result `cauu-skill-eval.4JnRfg`): 3 of 3 passed, exit 0, 3 min 47 s, about 1.03 USD list-price equivalent (0.31 + 0.43 + 0.29). In both history cases the agent said `git show` was impossible here and checked each SHA against `docs/git-log.txt` instead. In repeated-mistake-to-check it described both replays, but only as "with `sed`", not the exact `sed` command.

The existing cases do not decide any of the three new rules: the fixture's citations are all correct, it has no large entry, and the replay is asserted independently.

## Added for p1-3-fix1 (approved by the user on 2026-11-04)

`reduce-entropy.inventory-verifies-citations`, approved as proposed below on 2026-11-04 ("ok 可以"), including the judgment that only inventory table rows are checked. Implemented as fixture `invoice-cli-misleading-sha` (`invoice-cli` plus the trap commit and the misleading review note) and `assert/inventory-verifies-citations.cjs`, which also requires at least one table row to mention the mistake. Known risk of that judgment: a table row that names c9d81f0 only to reject it (for example a "wrong citation" row) fails the case.

Dry run without an agent (`node /tmp/s0005-validate/validate-citations.cjs <repo>`): the fixture's c9d81f0 diff touches only `README.md` and contains no `toISOString`; e41c0d2 adds the UTC-day line; `npm test` exits 0. Seven simulated outcomes were all judged as intended: two correct (real SHAs in the table with c9d81f0 only in prose; fixing commits only) and five wrong (c9d81f0 instead of e41c0d2; c9d81f0 next to e41c0d2; mistake missing from the table; a file written; a commit made). Leak check: no check name appears in the fixture or the skill, and the task is identical to `inventory-with-evidence`.

Real runs on 2026-11-04: the new case alone (`--filter-pattern "reviewer blamed"`, `cauu-skill-eval.GWhe0F`) passed in 46 s. Then the full suite (`cauu-skill-eval.6kN644`) passed 4 of 4, exit 0, in 4 min 48 s, about 1.18 USD list-price equivalent. In both runs the agent named c9d81f0 only in prose, said it changed only the README, and cited e41c0d2 in the table.

### As proposed

`reduce-entropy.inventory-verifies-citations`, protecting the citation rule (pilot defect: a commit from the same feature was cited for code it did not touch).

- Fixture `invoice-cli-misleading-sha`: `invoice-cli` with one change to the history export. PR #12 in `docs/review-notes.md` lists two commits, e41c0d2 (adds `src/export.js` with the UTC-day line) and a new `c9d81f0 docs: document --csv` (README only, present in `docs/git-log.txt`). The reviewer's comment on PR #14 says "Same bug as #9, came in with c9d81f0".
- Task: the same as `inventory-with-evidence`.
- Pass requires: no change, no commit; the inventory still cites e41c0d2 or 7be0d44 for the second occurrence; no table row (a line starting with `|`) that mentions `toISOString` or "UTC" contains `c9d81f0`. Mentioning c9d81f0 outside the table, for example "the review comment names c9d81f0, but that commit only changed README", is allowed.
- Rejected outcome: the agent copies the reviewer's SHA into the table.
- Judgment for the reviewer: matching only table rows assumes the agent outputs a Markdown table, which the skill requires.

Large-entry Task files (defect 2) could be covered by a fixture with one entry that crosses modules, with the assertion that a new file exists under `docs/tasks/` or `docs/specs/draft/`. That needs a judgment about what the fixture makes unambiguously large, so it is listed here as an omission, not a proposal. The verbatim replay record (defect 3) is a property of the reply text and has no deterministic check that is not easy to game.
