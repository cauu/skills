# tdd eval case review

This file is repository evaluation source and is not installed with the skill.

Status: designed for S0004 (TC-3), validated without an agent, approved by the user on 2026-11-03 together with the judgments below ("按建议").

The case names the skill in the task, so it proves application of the skill, not automatic routing to it. It runs once and requires 100%. The assertion is deterministic. No LLM judge is used.

## Added for S0004 (approved)

| caseId | Fixture | Task (after naming the skill) | Pass requires | Rejected outcome |
|---|---|---|---|---|
| `tdd.bug-test-before-fix` | `slug-bug`: `src/slug.js` turns each non-alphanumeric character into a dash, so `slugify('Hello   World')` returns `hello---world`; one passing test in `test/slug.test.js`; `npm test` is `node --test` | "Bug report: slugify('Hello   World') (three spaces) returns 'hello---world', but it should return 'hello-world'. Please fix it. The seam is the exported slugify() in src/slug.js; that is agreed, no need to ask me. Commit your work when you are done." | some new commit changes test files and not `src/slug.js`, and `node --test` fails on a clean export of that commit; a later commit changes `src/slug.js`; `node --test` passes on a clean export of HEAD; `src/slug.js` has no uncommitted changes | test and fix in one commit; a test commit that already passes; the fix before the test; the fix left uncommitted; a fix without a test |

The assertion runs the suite on `git archive` exports of individual commits, so the agent's working tree cannot influence the result.

## Judgments (approved by the user on 2026-11-03)

- **"Commit your work when you are done" invites a single commit.** That is deliberate: it is the realistic request the new rule must override. If you think the task should not mention committing, the rule cannot be observed in Git and the case would need a different signal.
- **The seam is pre-confirmed in the task.** The skill requires confirming seams with the user; without this the correct behavior is to ask and stop, and nothing would be committed.
- **"Fails for the reported reason" is not checked.** Any failing test in a test-only commit counts. Checking the failure message would depend on the agent's assertion style.
- **Other test edits in the red commit are allowed**, as long as `src/slug.js` is untouched and the suite fails there.

## Known omissions

- A bug the agent cannot reproduce (it should stop and report the paths tried).
- Seam confirmation.
- Whether the failing test fails for the reported reason rather than another one.

## Validation done without an agent

- The fixture was built with the real `beforeEach` hook. `node --test` passes (1 test, 0 failures) and `slugify('Hello   World')` prints `hello---world`.
- The assertion was run against 1 simulated correct and 5 simulated wrong Git histories; 6 of 6 judged as intended.
- Leak check: the task does not mention reproducing, red/green, test-first, or separate commits; no fixture contains them.

## Cost of one full suite run

About 0.18 USD list-price equivalent with `claude-opus-5-5` (see `evals/README.md`).
