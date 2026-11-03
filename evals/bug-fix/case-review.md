# bug-fix eval case review

This file is repository evaluation source and is not installed with the skill.

Status: designed for S0003 (TC-2, TC-3, TC-4, TC-7), validated without an agent, approved by the user on 2026-11-03 ("按建议"), including every judgment below and the optional `withSkills` var in `evals/lib/hooks.cjs`. Run with `npm run eval:bug-fix`.

All cases name the skill in the task, so they prove application of the skill, not automatic routing to it (the skill is model-invoked, so routing is a real gap; see Known omissions). Each runs once and requires 100%. All assertions are deterministic. No LLM judge is used.

## Added for S0003 (approved)

| caseId | TC | Fixture | Task (after naming the skill) | Pass requires | Rejected outcomes |
|---|---|---|---|---|---|
| `bug-fix.unreproducible-stops` | TC-2 | `export-report`: a notes CLI whose CSV export is correct (every field quoted, trailing newline, no `process.exit`); 5 notes; task T-31 says a customer with about 1,200 notes loses the last note from `node bin/notes.js export > notes.csv`, and their file was not attached | "I have claimed task T-31 (docs/tasks/T-31-export-drops-last-note.md). Please fix it." | `src`, `bin`, `test`, `package.json`, `data/notes.json` unchanged (committed or not); the output or the task says it did not reproduce; lines the agent added to the task include a `notes.js export` command it tried and a missing condition (`missing`, `need`, `require`, `without`) | a speculative fix in `src/csv.js`; a committed test; overwriting `data/notes.json` with generated data; the record only in chat; only editing the task's Status line |
| `bug-fix.simple-red-before-fix` | TC-3, TC-4 | `paging-bug`: `src/paging.js` ends each page one item early, so `node bin/notes.js list --page 2` prints `#4 Fix bike`, `#5 Gym`, `page 2 of 3 (2 shown)`; one passing CLI test with a `cli(...)` helper; task T-14 names that command | "I have claimed task T-14 (docs/tasks/T-14-short-pages.md). Please fix it and commit your work when you are done." | a new commit touches tests but not `src/` or `bin/`, its added lines drive the CLI (`notes.js` or `cli(`), and `node --test` fails on a clean export of it; a later commit changes `src/` or `bin/`; `node --test` passes at HEAD; `node bin/notes.js list --page 2` at HEAD prints `#6 Pay rent` and `(3 shown)`; nothing in `src`/`bin` uncommitted; lines added to the task contain `list --page 2`, `(2 shown)`, `(3 shown)`, and `simple` | test and fix in one commit; fix before test; red check is a unit test of `page()`; a weakened test with the CLI still broken at HEAD; fix left uncommitted; no commits; record without the failing output; record without the complexity call |
| `bug-fix.complex-lite-spec` | TC-7, TC-4 | `expense-units`: old records store dollars in `amount`, new ones (since completed spec S0001) store `amountCents`; `src/store.js:8` reads `amountCents ?? amount` as cents, so `total 2026-10` prints `Total 2026-10: 126.51 (5 expenses)` instead of 187.39. The fix needs a decision (migrate the file or convert on read). `immutable-spec` and `spec-design` are installed next to the candidate (`vars.withSkills`) | "I have claimed task T-22 (docs/tasks/T-22-october-total-too-low.md). Please fix it." | a new draft under `docs/specs/draft/` with `Change-Type: bugfix`, "Reproduction record" and "Root cause" (lite template), the real output `126.51`, and `store.js:<line>`; `complex` in the spec or in lines added to the task; `src`, `bin`, `data`, `test`, `package.json` unchanged; no `gate A/B passed` line; `Status: draft` and no active spec; the output asks the user | also fixing `src/store.js`; migrating `data/expenses.json`; logging gate A as passed; activating the spec; no spec (record only in the task); paraphrasing the output; a root cause without `file:line`; no complexity call; not asking |

## Shared change

`evals/lib/hooks.cjs` gained an optional `vars.withSkills` (comma-separated skill names). Those skills are copied from `skills/` into `.claude/skills/` before the fixture. A comma string, not a YAML list, because Promptfoo expands array vars into separate tests. The provider still loads only the candidate skill, so a companion skill is present as files the candidate can read, not as a loaded skill. Suites that do not set the var get exactly the workspace they got before (checked below).

## Judgments for the reviewer

- **"Please fix it" in the unreproducible case is deliberate.** It is the request the stop rule must override. Changing generated data inside `data/notes.json` counts as a code change; a generated file elsewhere (for example `/tmp` or a new untracked file outside the checked paths) is allowed, because tightening conditions needs input data.
- **The missing-condition check is weak.** Any added task line with `missing`, `need`, `require`, or `without` passes. Whether the condition named is the right one (the customer's notes file) needs judgment and is not checked.
- **"Commit your work" in the simple case** follows the approved `tdd` case: without it, Git cannot show red before green.
- **"Drives the CLI" is a text check** on the red commit's added lines (`notes.js` or the fixture's `cli(` helper). A red test that spawns the CLI some other way would fail the case. The skill says the failing check goes at the reproduction entry point, so a unit test of `page()` is treated as wrong.
- **The task is the only record checked.** The skill allows "task or PR"; there is no PR in the sandbox. A record written only in the commit message fails.
- **`simple` / `complex` are word checks.** An agent that writes "not complex" in the simple case still passes; one that never uses the words fails even with a correct judgment in other words.
- **Complex case: the lite spec is required** because `immutable-spec` is installed in that workspace. The case does not check that the agent noticed the installation on its own; the skill tells it where the template is.
- **The complex case requires `126.51` verbatim.** It can be computed by hand only by already knowing the bug; a run gives it directly.
- **asksUser** reuses the spec-design heuristic (a `?` or words like "which", "confirm"). It is weak alone; the file and gate checks decide the case.

## Known omissions

- Automatic routing to the skill (the tasks name it).
- The claim precondition (a task that is not claimed).
- A complex bug without `immutable-spec`, where the record goes into the task.
- Gate A passed or returned by the user, and delivery after it.
- Whether the fix is minimal, whether the blast-radius fact was named, and whether refuted hypotheses were reverted (intermediate steps are not observable).
- Real-project trials (TC-8, TC-9, S0003 p2-1).

## Validation done without an agent (2026-11-03)

- Fixtures: `export-report` exports all rows; a generated 1,200-note file (with quotes and line breaks in titles) exported to a file and through a pipe still ends with `"n1200"` and has 1,200 data rows, so the report does not reproduce. `paging-bug` prints `page 2 of 3 (2 shown)` for page 2 and its test passes. `expense-units` prints `Total 2026-10: 126.51 (5 expenses)` and its test passes.
- Each assertion ran against simulated outcomes in a workspace built by the real `evals/lib/hooks.cjs` (skill copied in, companions when asked, fixture, one commit): 3 correct and 21 wrong outcomes, 24 of 24 judged as intended. The hook copied `bug-fix,immutable-spec,spec-design` with `withSkills` and only `bug-fix` without it.
- Leak check: 39 tokens (every assertion check name, `126.51`, `187.39`, `(2 shown)`, `(3 shown)`, `#6 Pay rent`, `store.js:`, `simple`, `complex`, `reproduce`, "Reproduction record", "Root cause", `gate A`, `missing`, `need`, `failing`, `same entry point`, `verbatim`, `cli(`, and others) searched in the 3 tasks and 22 fixture files. Hits: `187.39` in T-22 (the report's expected total; not asserted); `notes.js export` in T-31 and `list --page 2` in T-14 (the reported commands; assertions count only lines the agent added, and the "only edits the Status line" outcome proves the report text does not count); `Pay rent` in `paging-bug/data/notes.json` (data; `#6 Pay rent` needs the fixed CLI); `cli(` in the fixture test (the existing helper); `red` and `spec` as substrings of other words and of the project's own completed spec.
- Config: `promptfoo validate` says "Configuration is valid"; 3 unique `caseId`s; `repeat` equals `metadata.repeat`; every fixture and assertion path exists.

## Cost of one full suite run

Not measured. The existing suites report 0.18 to 0.69 USD per case list-price equivalent with `claude-opus-5-5` (see `evals/README.md`), so expect roughly 0.6 to 2 USD for these three.

## Runs (2026-11-03)

- First full run after approval (`cauu-skill-eval.1c4ibf`): 3 of 3 passed in 4 min 11 s. Reported cost 0.26, 0.23 and 0.31 USD (about 0.80 USD for the suite, list-price equivalent).
  - `unreproducible-stops`: "I couldn't reproduce T-31, so I haven't fixed anything." The agent tried 5 notes, 1,200 notes, tricky titles, a pipe, and 100,000 notes. It also offered an unconfirmed guess (file order versus date order) without acting on it.
  - `simple-red-before-fix`: the failing CLI test was committed first, then the one-line fix at `src/paging.js:10`. The task records `page 2 of 3 (2 shown)` before and `(3 shown)` after. The complexity call was "Simple".
  - `complex-lite-spec`: `Total 2026-10: 126.51 (5 expenses)` was recorded verbatim, with the root cause at `src/store.js:8`. The call was "Complexity: complex", decided by "data is involved". Nothing was fixed or committed, and the agent asked for gate A. It also said the user could reasonably downgrade the bug to simple, because the code change is one line.
- Shared-hook regression check:
  - `npm run eval:tdd`: 1 of 1 passed.
  - `npm run eval:immutable-spec`: 6 of 7 passed. `immutable-spec.gate-log` failed on `gateBReturnedLogged` alone, and failed again the same way when rerun alone (`cauu-skill-eval.VfOACJ`). The agent logged gate A as passed but wrote "Gate B pending" instead of a `gate B returned` line.
  - Not caused by the hook: building all 19 fixtures of the immutable-spec, tdd, spec-design, challenge and code-review suites with the old hook (`d1a5418`) and the new one gives byte-identical workspaces. The immutable-spec skill and its eval sources have not changed since S0002 recorded this case as passing. This is left open for the user; it is outside S0003.

## Changed after approval

- None. No case, fixture, or assertion was changed.
