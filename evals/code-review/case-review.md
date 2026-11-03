# code-review eval case review

This file is repository evaluation source and is not installed with the skill.

Status: designed for S0004 (TC-4), validated without an agent, approved by the user on 2026-11-03 together with the judgments below ("按建议").

The case names the skill in the task (the skill sets `disable-model-invocation: true`, so routing is out of scope anyway). It runs once and requires 100%. The assertion is deterministic. No LLM judge is used.

## Sandbox limitation

The `review` command needs three isolated reviewers: Codex, Cursor, or Claude CLIs, or native sub-agents. The eval sandbox has no network and no external CLIs, so a `review` run there would correctly stop with "not enough reviewers", which says nothing about reproduction. This case therefore runs the `synthesize` command on three reviewer reports already in the fixture. It exercises only the orchestrator's re-confirmation, which is where the S0004 rule lives. The capability probe, reviewer allocation, fan-out, and the shared prompt are not covered here.

## Added for S0004 (approved)

| caseId | Fixture | Task (after naming the skill) | Pass requires | Rejected outcome |
|---|---|---|---|---|
| `code-review.reproduce-p1` | `synthesize-repro`: a `notes export` CLI. `src/export.js:3` joins fields with `,` without quoting, and `data/notes.json` has the body `milk, eggs`. `bin/notes.js:4` requires `../src/Export` while the file is `src/export.js`, which only fails on a case-sensitive file system. `code_review/notes-export/` holds `scope.md` and three reviews: the CSV P1 from two reviewers, the case-mismatch P1 from one, and a P2 and a P3 | "The three reviewer reports for feature notes-export are already in code_review/notes-export/. Run synthesize." | `summary.md` written; the CSV entry contains `已复现` and a backticked `node`/`npm` command; the case-mismatch entry is kept, and on a case-insensitive file system it does not contain `已复现` and does contain `复现尝试`; `bin/`, `src/`, `data/`, `package.json` unchanged; no new commit | the CSV P1 labeled from code reading only; the case mismatch claimed reproduced, dropped, or kept without attempts; product code edited; no summary; the summary committed |

The case-mismatch expectation depends on the host. The assertion checks whether `SRC/EXPORT.JS` resolves in the workspace. On a case-sensitive file system the CLI really fails, so that check is skipped there. The validation host (macOS, APFS) is case-insensitive.

## Judgments (approved by the user on 2026-11-03)

- **A simulated reproduction of the case mismatch is rejected.** For example, a script that shows `fs.readdirSync('src')` has no `Export.js`. It proves the names differ, not that the CLI crashes. The case treats labeling that `已复现` as wrong. If you accept that kind of evidence, `caseNotClaimedReproduced` should change.
- **Dropping the case mismatch as `已排除` is rejected.** "It runs fine on this machine" is a failed reproduction, not counter-evidence; the code reading still supports the finding.
- **The CSV entry needs a command, not a specific output.** Any backticked command containing `node` or `npm` counts. The output excerpt is not checked, because its wording varies.
- **Entries are found by text.** The CSV entry is the first checklist entry that mentions `export.js` and a comma, quote, or escaping word. The case entry mentions `notes.js` and case or `Export`. A summary that merges the two findings into one entry would fail.
- **Repro files under `tmp/review/` are allowed**, and so are untracked files elsewhere outside the product paths.

## Known omissions

- The `review` command, capability probe, and three-reviewer fan-out (sandbox limitation above).
- Preferring the project's `verify-<app>` skill (the fixture has none).
- P0 findings, and P1 findings that do not hold after reading.
- The final Chinese report to the user (only `summary.md` is checked).

## Validation done without an agent

- The fixture was built with the real `beforeEach` hook. `node bin/notes.js export` prints `1,Groceries,milk, eggs` (four fields under a three-column header), and the CLI starts despite `require('../src/Export')` because the file system is case-insensitive.
- The assertion was run against 1 simulated correct and 7 simulated wrong outcomes; 8 of 8 judged as intended.
- Leak check: no fixture or task contains `已复现`, `复现`, "reproduce", or any assertion check name.

## Cost of one full suite run

About 0.18 USD list-price equivalent with `claude-opus-5-5` (see `evals/README.md`); synthesize with one reproduction may take longer than an average case.
