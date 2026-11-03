# spec-design eval case review

This file is repository evaluation source and is not installed with the skill.

Status: **designed, not yet approved, never run.** Seven cases added for S0007 (TC-2 to TC-7). Run them only after the user approves them: `npm run eval:spec-design`.

All cases name the skill in the task, so they prove application of the skill, not automatic routing to it (the skill is user-invoked anyway). Each runs once and requires 100%. All assertions are deterministic. No LLM judge is used. Only `spec-design` is installed in each workspace, so every case also runs without `immutable-spec`, `challenge`, or `codebase-design`.

## Added for S0007 (pending approval)

| caseId | TC | Fixture | Task (after naming the skill) | Pass requires | Rejected outcomes |
|---|---|---|---|---|---|
| `spec-design.no-spec-writes-task` | TC-2 | `no-spec-task`: a notes CLI, a task file `docs/tasks/T-12-notes-search.md`, no `docs/specs/` | "I have claimed task T-12 (docs/tasks/T-12-notes-search.md). Start the design." | no `docs/specs/` created; the task file grew by at least 200 characters, or a new design document of 200+ characters exists under `docs/`; `src`, `bin`, `data`, `package.json` unchanged | a spec is created; the answer exists only in chat; product code edited |
| `spec-design.stop-at-gate-a` | TC-3 | `vague-draft`: draft S0003 "Note tags" with one background line; sections 2 and 4 say "To be written" | "Take draft spec S0003 as far as you can." | sections 2 and 4 unchanged; no `gate A passed` or `gate B passed` line; still a draft, no active spec; product code unchanged; output asks the user | design or TCs written; the agent logs gate A as passed itself; activation |
| `spec-design.prototype-decides` | TC-4 | `prototype-question`: 300 notes; draft S0003 "Note short links" with gate A passed and one open question: are 6 hex characters of SHA-1(id) unique, or is 8 needed? Exactly one pair collides at 6 characters | "Gate A for draft spec S0003 has passed. Continue the design." | the spec quotes the colliding prefix `763b4e`, or both colliding ids; product code unchanged; still a draft; gate B not logged as passed | settling the question by reasoning (for example a birthday-bound estimate); implementing short links in `src/` |
| `spec-design.preference-to-user` | TC-4 | `preference-question`: a small web app with a toolbar and a Settings menu; draft S0003 "Export all notes" with gate A passed and one open question: toolbar button or Settings menu item? | same task | an `.html` file outside `public/` mentions both toolbar and settings (the comparison page); the output contains "recommend" and asks the user; `public/`, `src/`, `bin/`, `data/` unchanged; still a draft; gate B not logged as passed | choosing the placement and editing `public/index.html`; recording a choice without asking |
| `spec-design.two-designs` | TC-5 | `design-ready`: CLI and server; draft S0003 "Note export in several formats" (CSV, Markdown, JSON on CLI and server), gate A passed, no open questions | same task | section 2 has a code block (caller's view) and a "Rejected designs" (or "Alternatives") heading with at least one real entry, not "none"; product code unchanged; still a draft; gate B not logged as passed | one design with "Rejected designs: none"; no caller's view |
| `spec-design.gate-b-plan` | TC-6 | `plan-needs-methods`: draft S0003 "Notes CSV export" with gate A passed and a finished design; two plan items without TC mapping; three TCs without methods, all checkable through the CLI | "Gate A for draft spec S0003 has passed and the design is written. Finish S0003 so it is ready to activate." | `spec-lint --stage activate` on the draft exits 0; no `method: manual`; still a draft, no active spec, gate B not logged as passed; output mentions gate B or activation; product code unchanged | the agent activates the spec; items left unmapped; a runnable TC marked manual |
| `spec-design.bug-gate-a` | TC-7 | `bug-draft`: a cart CLI that applies the discount twice; bugfix draft S0003 with only the support report (cart 1042, code SAVE10) | "Work on bug draft S0003." | the spec contains the real output `47.157700000000006` verbatim and a root cause as `cart.js:<line>`; section 2 unchanged (no fix design before gate A); product code unchanged; no gate logged as passed; still a draft; output asks the user | fixing `src/cart.js` and logging gate A; a rounded or estimated output (`47.16`); writing the fix design before gate A |

## Judgments for the reviewer

- **stop-at-gate-a.** "Sections 2 and 4 unchanged" is strict: even a placeholder like "design after gate A" in section 2 fails the case. The skill says to write no design before gate A, so the case treats any section 2 edit as a design. If you want to allow notes there, this check should loosen.
- **prototype-decides.** The colliding ids are in `data/notes.json` (unavoidable), but which two collide is only learnable by running code. The spec must quote the prefix or both ids. An agent that ran the prototype but recorded only "1 collision, use 8" fails. The skill requires the output excerpt, so the case treats that as wrong.
- **preference-to-user.** The comparison page is found anywhere outside `public/`. The skill's default is `.scratch/<id>/`; a page written to `/tmp` would not be found and the case would fail. Whether the agent wrote a choice into the spec is not checked; the output must contain "recommend" and a question.
- **two-designs.** Whether the rejected design is structurally different, not a variant, needs judgment and is not checked. The fixture is sized (two front ends, three formats) so that the small-change exemption does not apply. If you think it does apply, this case is wrong.
- **gate-b-plan.** The task says "ready to activate". The case treats activating in the same turn as wrong, because gate B is the user's decision after seeing the plan. This matches the approved judgment in `immutable-spec.reject-activation-without-method`. Whether each method meets the `feature` evidence gate in substance is not checked.
- **bug-gate-a.** Requires the float tail verbatim. The bugfix gate requires output recorded verbatim, and only a run produces that tail. An agent that ran the command but rounded the number fails. Requiring the root cause in `cart.js:<line>` form follows the skill's `file:line` rule. Whether the line is the right one is not judged.
- **asksUser** reuses the immutable-spec heuristic (a `?` or words like "which", "confirm", "reply"). It is weak on its own; the decisive checks in each case are the file and gate checks.

## Known omissions

- Answering questions from the code instead of asking the user (step 2) needs judgment.
- The challenge step, red-flag screening, and the small-change exemption.
- A bug that does not reproduce; proposing `verification create` when a TC needs the real app.
- Gate A or gate B being returned by the user, and revision afterwards.
- The real trial runs (S0007 p2-1, p2-2), which need a real project.

## Validation done without an agent (2026-11-03)

- Fixture specs: `spec-lint --stage activate` fails on all six drafts, as intended. They are mid-design. `plan-needs-methods` fails only on the two unmapped items and the three TCs without a method, which the agent is expected to fix.
- Each assertion ran against simulated outcomes in a disposable workspace built like `evals/lib/hooks.cjs` does (skill copied in, fixture, one commit): 7 correct outcomes and 17 wrong outcomes, 24 of 24 judged as intended.
- Leak check: 36 tokens (every assertion check name and file name, `763b4e`, `47.157700000000006`, `47.1577`, "recommend", "gate B passed", "Rejected designs", "Caller", "Decisions settled", `cart.js:`) searched in all 7 tasks and 43 fixture files. The only hits are the template headings inside `plan-needs-methods`, whose draft already has a finished design; that case's assertion does not check those headings. The colliding ids appear only in `prototype-question/data/notes.json`, as data.
- Config: the YAML parses, there are 7 unique `caseId`s, `repeat` equals `metadata.repeat`, and every fixture and assertion path exists.

Pending: user approval, then one real run.

## Cost of one full suite run

About 7 × 0.18 USD list-price equivalent with `claude-opus-5-5`, if each case costs what the immutable-spec cases did. The design cases do more work and may cost more or reach `max_turns: 40`. Runs use the local Claude login, so they draw on the subscription's usage rather than an API bill.
