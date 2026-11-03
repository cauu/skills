# verification eval case review

This file is repository evaluation source and is not installed with the skill.

Status: designed for S0001 p1-7 (TC-9 to TC-12), validated without an agent. **Approved by the user on 2026-11-03** ("按建议"), including every judgment listed below.

All cases name the skill in the task, so they prove application of the skill, not automatic routing to it. Each runs once and requires 100%. All assertions are deterministic. No LLM judge is used.

## Added for S0001 (approved)

| caseId | Fixture | Task (after naming the skill) | Pass requires | Rejected outcomes |
|---|---|---|---|---|
| `verification.create-proves-before-handover` (TC-9) | `create-cli`: a zero-dependency Node CLI (`add`, `list`, `export`) with `data/notes.json`; no verify tool | "Run create for this project. I won't be around to answer questions, so decide from the repository." | a `verify-*` wrapper in `.claude/skills/` or `.agents/skills/` pointing to `docs/verification/<app>/`; `drive-contract.md` copied verbatim; feature files with the five H2s; `Last full run: <run-id>` with files under `.verify-artifacts/<run-id>/<feature>/`; `.verify-artifacts/` ignored and not committed; tool committed; `bin`, `src`, `test`, `package.json`, `README.md`, `data` unchanged | a run claimed with no evidence; a draft handed over on a runnable app; pstack's single-directory layout; driving the project's own data file |
| `verification.create-unrunnable-stays-draft` (TC-10) | `create-unrunnable`: a Node HTTP API that needs the `pg` package (not installed, network blocked) and a PostgreSQL server (absent) | same as above | nothing written, or every body says `Last full run: none ...`; no commit; `server.js`, `src`, `schema.sql`, `package.json`, `README.md` unchanged; output names the blocker (Postgres, database, `DATABASE_URL`, or `pg`) | a tool marked proven or committed; the database replaced in product code; a tool with no draft marker |
| `verification.maintain-reports-regression` (TC-11) | `maintain-regression`: the same CLI with a D1 tool. Drift: `features/list.md` still says `notes ls`, while `CHANGELOG.md` says it was renamed to `list`. Regression: `export` no longer prints the `title,body` header, which `README.md` and `test/run.js` still require | "Run a full maintain on this project's verify tool. I won't be around to answer questions, so decide from the repository." | `list.md` drives `list`, not `ls`; `export.md`'s driving section still expects `title,body`; product files unchanged; only tool files changed, in exactly one new commit; output mentions export/CSV with regression/bug/broken/defect, and says `changed` | the map rewritten to match the missing header; the product fixed by maintain; the drift left in place |
| `verification.maintain-scope-only-mapped` (TC-12) | `maintain-scope`: the same CLI and tool, no drift; a new `search` command (`src/commands/search.js`, one line in `src/commands/index.js`, a README line) that the map lacks | "I just added a `notes search` command. Run maintain --scope for that change: src/commands/search.js (new), src/commands/index.js, README.md." | a new feature file with the five H2s whose `Source entry points` lists `src/commands/search.js`, indexed in `features/README.md`; evidence under `.verify-artifacts/<run>/<that feature-id>/`; no evidence directory for `add`, `list`, or `export`; `add.md`, `list.md`, `export.md` unchanged; product unchanged; exactly one new commit | `list` and `export` driven too; `add.md` edited; `search` driven but never mapped |

## Judgments for the reviewer

- **create, `data/` must stay unchanged.** The drive contract requires each run to use its own data, so a drive that writes to the project's `data/notes.json` fails the case. If you consider that too strict for a first create, drop `data` from `productUnchanged`.
- **create, the tool must be committed.** SKILL.md step 7 says so. An agent that leaves a proven tool uncommitted fails.
- **create, verbatim contract copy.** Compared byte for byte with the candidate skill's `references/drive-contract.md`.
- **create-unrunnable, two passing shapes.** Writing nothing and leaving an uncommitted draft both pass. Committing anything fails, including a draft, because SKILL.md says not to commit a draft.
- **maintain-regression, drift versus regression.** The case assumes the CHANGELOG makes the rename intentional and the README plus the failing unit test make the missing header a regression. `outcomeChanged` (the word "changed" in the output) and `reportsRegression` (keywords) are weak signals; the decisive checks are the file states and the single commit.
- **maintain-scope, what counts as affected.** `src/commands/index.js` and `README.md` are in the diff but in no feature's `Source entry points`, so by the skill's rule they affect nothing. An agent that reasons "index.js dispatches every command, so drive them all" fails. The tool's Doctor runs `list`; that is fine unless the agent files Doctor output under `.verify-artifacts/<run>/list/`.
- **Diff as a path list.** The shared hook makes one commit per fixture, so the scope is given as paths, not a Git range. Supporting a range would need a second commit in `evals/lib/hooks.cjs`, which other suites share.

## Known omissions

- Web, desktop, long-lived server, and Aiken targets (pilots p2-1, p2-2).
- Isolation between two parallel runs (TC-4), harness gaps, stand-in runs, the per-feature read-only subagents of the full pass.
- Appending maintain evidence to an active spec.

## Validation done without an agent

- Each fixture app was run in a temporary copy: `create-cli` and `maintain-scope` work (`search budget` exit 0, `search volcano` exit 1); in `maintain-regression`, `notes ls` exits 2 with usage, `export` has no header, and `test/run.js` throws; `create-unrunnable` fails with `Cannot find module 'pg'`, and the eval PATH has no `psql`, `createdb`, or `postgres`.
- `tests/verification/eval-simulations.cjs` builds each workspace with `evals/lib/hooks.cjs`, applies a simulated outcome, and runs the real assertion: 20 of 20 judged as intended (5 correct outcomes pass, 15 wrong outcomes fail), after the change recorded below.
- Leak check: no assertion check name and no pass criterion appears in a task or fixture. The only keyword hit is the verbatim drive-contract copy inside the two maintain fixtures, which is the tool's own file.
- `promptfoo validate config -c evals/verification/promptfooconfig.yaml`: "Configuration is valid."

## Real runs

- 2026-11-03 run 1 (`cauu-skill-eval.sIFfyp`): 3 passed; `maintain-reports-regression` failed on `driftFixed` only, see "Changed after approval".
- 2026-11-03 rerun of `maintain-reports-regression` (`cauu-skill-eval.5t639W`): every file check passed, but `outcomeChanged` failed. The agent waited on three background source-reader subagents, and the provider returned an interim message after 9 turns as the final output, although the agent went on to finish and commit. Treated as an output-capture problem and not used as evidence.
- 2026-11-03 run 3, the full suite after S0001 p1-4-fix1 changed SKILL.md (`cauu-skill-eval.6AYJhG`): 4 passed, exit 0. Reported cost per case: 0.92, 0.76, 0.31, 0.24 USD list-price equivalent. No case came near the 40-turn limit (most turns: 23).
- In every create run the sandbox refused writes under `.claude/skills/`, so only the `.agents/skills/` wrapper was written. The case accepts that (an approved judgment). The pilots, which run outside the sandbox, must show both wrappers.
- `pg` was not in the local npm cache; the offline install failed as expected.

## Changed after approval

- 2026-11-03 `verification.maintain-reports-regression`, check `driftFixed`: now inspects only the feature's "Driving it with" section instead of the whole `list.md`. Reason: in the first real run every other check passed and the agent reported that it changed `list.md` to `list`, yet `driftFixed` failed; the whole-file negative match also rejects a correct file that mentions the old `notes ls` name elsewhere (for example a Gotcha about the rename), which is narrower than the approved intent "the recipe drives `list`, not `ls`". The decisive requirement is unchanged: the recipe must drive `list` and must not drive `ls`. Two simulations were added for this boundary (a Gotcha naming the old command passes; a renamed entry point with a recipe that still drives `ls` fails). The original workspace had been overwritten by the next case, so the exact cause is inferred, not observed. Task and fixture unchanged.
