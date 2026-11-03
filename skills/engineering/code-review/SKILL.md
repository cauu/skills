---
name: code-review
description: Run a platform-neutral code review with three isolated agent executions, then synthesize one human-controlled advisory checklist.
disable-model-invocation: true
---

# Code Review

The agent running this skill is the **orchestrator**. It resolves the review
scope, allocates exactly three isolated reviewer executions from the capabilities
available in its environment, collects their candidate findings, verifies the
evidence, and synthesizes one human-controlled `summary.md` checklist.

Reviewers may be Claude, Codex, Cursor, repeated isolated sessions of the same
provider, or native sub-agents supplied by the host environment. Provider
diversity is preferred but not required. Review-only by default: **never modify
product code**.

## Commands

- `review` (default): resolve scope, fan out to all available agents, write one
  `<reviewer-id>-<provider>.md` per reviewer, then synthesize `summary.md`.
- `synthesize`: only merge existing `code_review/<feature>/*.md` review files into
  `summary.md`. Do not re-run agents.

If the user does not name a command, infer `review`.

## Scope Resolution

Resolve two independent inputs:

1. **Review scope** — the code changes to inspect.
2. **Review standard** — an optional requirement, design, acceptance, or policy
   document supplied by the user.

Exact git commands are in
[`references/scope-resolution.md`](references/scope-resolution.md).

Scope precedence:

1. Use an explicit user-provided PR, branch, commit, commit range, diff, or file
   list.
2. Otherwise review the uncommitted working-tree diff (staged and unstaged).
3. If the working tree is clean, fall back to `main...HEAD`, then
   `master...HEAD`.
4. If no scope can be inferred, ask the user.

Never discover or interpret another skill's files or conventions, except a
project `verify-<app>` skill used optionally to reproduce findings (see
Re-confirmation). A review
standard is used only when the user explicitly supplies it or identifies its
path. Treat it as an ordinary input document and do not require a particular
filename, directory, ID scheme, heading structure, or commit format.

## Feature Folder

Derive `<feature>` so the folder is stable and scannable, using the first
available source:

- a user-provided feature name;
- the branch or commit-range name;
- a short sanitized summary of the diff.

All artifacts live under `code_review/<feature>/`:

```text
code_review/<feature>/
  scope.md                  # scope, capability probe, reviewer allocation
  review-01-<provider>.md    # candidate review
  review-02-<provider>.md    # candidate review
  review-03-<provider>.md    # candidate review
  summary.md                # advisory checklist (human approval boundary)
```

Recommend adding `code_review/` to `.gitignore` if absent. Do not edit
`.gitignore` unless the user asks.

## Orchestration Workflow

1. **Resolve scope** (above). Run the git commands, then write
   `tmp/review/<feature>/changes.diff` (the full diff) and
   `code_review/<feature>/scope.md` (human-readable: scope source, base ref,
   `git diff --stat`, and any user-provided review standard).

2. **Probe capabilities and allocate reviewers.**

   Detect capabilities, not the orchestrator's brand:

   - determine whether the current host exposes a native sub-agent facility;
   - check `command -v` for `claude`, `codex`, and `cursor-agent`;
   - use a lightweight, non-mutating authentication/status probe when the CLI
     provides one;
   - record available and unavailable providers in `scope.md`.

   Allocate exactly three reviewer slots:

   1. Prefer distinct available external providers.
   2. Fill remaining slots with native sub-agents when available.
   3. If slots still remain, launch additional isolated sessions of an available
      provider.
   4. Native sub-agents may run concurrently or sequentially, but each must start
      with a fresh isolated context.

   The orchestrator does not count as a reviewer. If three isolated executions
   cannot be obtained, stop and report the available reviewer capacity. Never
   imitate multiple reviewers inside one context or silently downgrade to a
   single-agent review.

   Record the final allocation in `scope.md`, including for each slot:
   `reviewer_id`, `provider`, `execution` (`external-cli` or `native-subagent`),
   and model when reliably known.

3. **Build the review prompt** once, shared unchanged by all three reviewers.
   Reviewers do not inherit the orchestrator's loaded skills, so the prompt must
   be **self-contained**: inline the checklist and template content rather than
   only linking to them. The prompt
   must instruct the agent to:
   - read `tmp/review/<feature>/changes.diff` and `code_review/<feature>/scope.md`
     (both are real files in the repo the agent runs in);
   - apply the embedded review checklist — copy the body of
     [`references/review-checklist.md`](references/review-checklist.md) (P0–P3
     severities, SOLID/security/quality, plus compliance checks when `scope.md`
     includes a review standard) directly into the prompt;
   - return its review following the embedded
     [`references/templates/review-template.md`](references/templates/review-template.md);
   - reply once, compactly, with no progress chatter (token contract).

   The `run_review_agent.sh` wrapper already appends the output-target and token
   contract, so the prompt file itself only needs the diff/context pointers,
   the inlined checklist, and the inlined template.

4. **Fan out.** Run external reviewers via the wrapper. Pass a stable reviewer
   ID so repeated providers do not overwrite one another:

   Resolve `CODE_REVIEW_SKILL_DIR` to the installed directory containing this
   `SKILL.md`, then run:

   ```bash
   bash "$CODE_REVIEW_SKILL_DIR/scripts/run_review_agent.sh" \
     codex review-01 <feature> tmp/review/<feature>/review.prompt.txt &
   bash "$CODE_REVIEW_SKILL_DIR/scripts/run_review_agent.sh" \
     cursor review-02 <feature> tmp/review/<feature>/review.prompt.txt &
   bash "$CODE_REVIEW_SKILL_DIR/scripts/run_review_agent.sh" \
     claude review-03 <feature> tmp/review/<feature>/review.prompt.txt &
   wait
   ```

   Use only the allocated external slots; the example is illustrative.

   For each allocated `native-subagent` slot, use the host environment's native
   sub-agent mechanism with a fresh context and the exact same prompt. Tell it to
   return the complete Markdown review without modifying files, then save its
   final response as
   `code_review/<feature>/<reviewer-id>-native.md`.

5. **Confirm three outputs.** Verify each allocated reviewer file exists and is
   non-empty. A failed reviewer execution may be retried once or replaced with
   another isolated provider/session. Do not synthesize until exactly three
   non-empty reviewer reports exist.

6. **Synthesize** → `summary.md` (see below).

## Synthesize

Read every `code_review/<feature>/*.md` except `scope.md` and `summary.md`, then
produce `summary.md` using
[`references/templates/summary-template.md`](references/templates/summary-template.md).

**Write `summary.md` in Chinese (中文).** The summary report prose, section
headers, and finding text are all in Chinese. Keep only stable machine tokens
(file:line refs, `agreement`, severity codes P0–P3) as-is.

Synthesis rules:

- merge duplicate findings across agents into ONE entry;
- **attribute every finding to the agent(s) that raised it by name** — record a
  `提出者:` list (e.g. `提出者: codex, cursor`) AND an `agreement: N/M` count;
- use agreement to set verification priority, not truth — inspect multi-agent
  findings first, but do not accept them without independent evidence;
- preserve genuine disagreement (don't silently drop a single-agent / minority
  finding when it has concrete evidence — label it `仅 <agent> 提出`;
- order by severity P0 → P3;
- when a review standard was supplied, add a **标准符合性 (Standard Compliance)**
  section mapping its applicable requirements or acceptance criteria to
  满足 / 部分满足 / 未满足 with evidence;
- every retained finding gets an unchecked `[ ]` checkbox — checked means a human
  accepts the advisory finding and authorizes follow-up. An unchecked finding
  never authorizes a fix. This skill never fixes anything; it only reviews and
  reports.

### Re-confirmation (required before finalizing summary.md)

Before adjudicating candidate findings, read
[`references/review-meta-rules.md`](references/review-meta-rules.md). These rules
apply only to the orchestrating agent; do not include them in external reviewer
prompts.

Treat every reviewer finding as a candidate, not an accepted defect. The
orchestrating agent independently re-checks candidates against the ACTUAL code
before writing them into the summary:

1. Re-verify EVERY P0/P1 finding and EVERY multi-agent finding by reading the
   referenced `file:line` in the real diff/code.
2. Try to reproduce EVERY P0/P1 finding that holds after reading: run its
   trigger against the real code and observe the impact. Prefer the project's
   `verify-<app>` skill (a `verify-*` directory under `.claude/skills/`,
   `.agents/skills/`, or another agent skill directory at the project root) when
   one exists and covers the path; otherwise use existing tests, the app's own
   command or entry point, or a minimal script. Put every repro file under
   `tmp/review/<feature>/`; never edit product code to reproduce.
3. Spot-check single-agent P2/P3 findings; drop or downgrade ones that don't hold.
4. Give each retained finding a `证据状态:` verdict — `证据支持（已复现）` (a run
   showed the impact; record the `复现:` command and an excerpt of its output),
   `证据支持` (the code supports the candidate, still pending human
   confirmation), or `需要确认` (a concrete trigger and plausible impact exist,
   but evidence is incomplete). A P0/P1 that was not reproduced keeps its
   code-reading verdict and records `复现尝试:` — each path tried and why it did
   not reproduce: it ran and the impact did not appear (`inconclusive`), or it
   could not run, naming the missing precondition (`unreachable`). Candidates
   that do not hold are `已排除`; omit them from the checklist and optionally
   list them under an exclusion note with the reason.
5. If agents disagree on the same spot, resolve it by reading the code and state
   which side the current evidence supports. Preserve genuine uncertainty.

Finish by reporting to the user IN CHINESE: counts per severity, how many findings
each agent raised, how many were raised by multiple agents, how many P0/P1 were
reproduced, where the files are,
and that every result is advisory until they confirm it. The `summary.md`
checkboxes are theirs to tick; fixes are out of scope.

## Guardrails

- Review-only. Never edit product code, never commit, never revert user changes.
- Reproduction runs read-oriented: repro scripts and their output stay under
  `tmp/review/<feature>/`; do not run commands that write to shared or remote
  state.
- Never treat reviewer agreement or the orchestrating agent's evidence check as
  final human confirmation.
- Keep external-agent invocations read-oriented; do not pass `--force`/`--yolo`.
- Cursor runs with its **auto** model selection (the wrapper passes no
  `--model`); only pin a fixed model via `CURSOR_EXTRA_ARGS` if the user asks.
- Keep raw agent run logs under `tmp/review/`; keep curated reviews under
  `code_review/`.
