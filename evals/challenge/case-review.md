# challenge eval case review

This file is repository evaluation source and is not installed with the skill.

Status: designed for S0004 (TC-1, TC-2), validated without an agent, approved by the user on 2026-11-03 together with the judgments below ("按建议").

Both cases name the skill in the task, so they prove application of the skill, not automatic routing to it. Each runs once and requires 100%. All assertions are deterministic. No LLM judge is used.

## Added for S0004 (approved)

| caseId | Fixture | Task (after naming the skill) | Pass requires | Rejected outcome |
|---|---|---|---|---|
| `challenge.unverifiable-criteria` | `criteria-review`: a small notes CLI and `docs/proposal.md` for a CSV export. Criteria 1 and 2 are runnable (header line, `"milk, eggs"` quoted). Criterion 3 is "The export feels intuitive and pleasant to use", with no check and no reason | "Review the proposal in docs/proposal.md before we build it." | a line that mentions "intuitive" or "pleasant" also uses a verifiability word (verify, measure, testable, subjective, reason, human, runnable, rewrite, check, ...); no other line about the header or `milk, eggs` calls it unverifiable; `docs/proposal.md` unchanged; no new commit | criterion 3 not mentioned; a runnable criterion called unverifiable; the proposal rewritten; an implementation committed |
| `challenge.prototype-open-question` | `perf-question`: `src/store.js` loads a JSON file, `scripts/seed.js` generates notes, and `docs/proposal.md` proposes a SQLite migration because "at 10,000 notes the JSON load will take well over a second" | same task | a line that names a prototype, spike, benchmark, or measurement and carries a command in backticks, or a reported timing in ms (other than the proposal's own 200 ms) next to 10,000 notes; the Recommendation is not plain "Execute"; `src/store.js` unchanged; no new commit | the migration approved; a paper argument with no run; the store rewritten |

## Judgments (approved by the user on 2026-11-03)

- **unverifiable-criteria, the verifiability word list is broad.** A line that mentions "intuitive" together with "check" passes even if it approves the criterion. The decisive signal is that criterion 3 is discussed in verifiability terms at all; the old skill had no rule for it. Narrowing the list (for example to "unverifiable", "reason", "human only") would make the case stricter and more wording-dependent.
- **unverifiable-criteria, the agent may supply the reason itself** (`human only: <reason>`). The case accepts that. The skill text asks for the reason to be stated; it does not say the reviewer cannot propose one.
- **prototype-open-question, the old skill may already pass.** The old text already said "recommend a bounded investigation or reversible experiment". This case protects the behavior rather than proving the new text changed it.
- **prototype-open-question, actually running the measurement is accepted.** In the fixture, loading 10,000 seeded notes takes about 8.5 ms (measured during validation), so a reviewer that runs it will find the premise false. Either running it or recommending what to run passes.
- **prototype-open-question, "Revise before execution" and "Do not execute" both pass.** Only an unconditional "Execute" fails.

## Changed after approval

- 2026-11-03 `challenge.unverifiable-criteria`: `runnableCriteriaNotFlagged` now judges sentences instead of whole lines, and skips sentences that name criterion 3. Reason: in the first real run (`cauu-skill-eval.yGuCBF`) the agent did the intended thing. It gave criteria 1 and 2 `agent:` commands and marked criterion 3 `unverifiable:` with a runnable rewrite. But its Recommendation paragraph is one line that mentions the data (`milk, eggs`) and then says "criterion 3 can't be tested", so the line-level check read it as flagging a runnable criterion. The check was narrower than the approved intent. It still rejects any sentence that calls the header or the `milk, eggs` criterion unverifiable (simulated outcome re-judged: still fails). The other checks are unchanged.

## Known omissions

- Behavior, timing, and layout questions other than performance.
- Criteria that already carry a valid reason for human-only judgment (no false-flag case).
- Whether the proposed runnable rewrite or measurement is a good one.

## Validation done without an agent

- Each fixture was built with the real `beforeEach` hook. `node bin/notes.js list` prints two notes; `node scripts/seed.js 10000` writes 10,000 notes and `loadNotes` reads them in about 8.5 ms.
- Each assertion was run against simulated outcomes: `unverifiable-criteria` 1 correct and 4 wrong, `prototype-open-question` 2 correct and 3 wrong; 10 of 10 judged as intended.
- Leak check: no assertion check name, expected label, or rule wording (prototype, measure, unverifiable, verifiable, reproduce) appears in any task or fixture.

## Cost of one full suite run

About 2 × 0.18 USD list-price equivalent (first real run: 0.22 + 0.13 USD) with `claude-opus-5-5` (see `evals/README.md`).
