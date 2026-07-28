---
name: multi-agent-review
description: Orchestrate a multi-agent code review where Claude is the primary agent and Codex + Cursor run as headless reviewers, each writing one review file, then Claude synthesizes a single checklist summary. Use when the user asks to review current changes, review the active spec's changes, or get a multi-model/second-opinion code review. Integrates with immutable-spec-delivery (active spec in docs/specs/) but also works with no active spec.
---

# Multi-Agent Review

Claude (primary) fans a code review out to multiple agents — Codex and Cursor via
their headless CLIs, plus Claude itself — collects one review file per agent under
`code_review/<feature>/`, then synthesizes them into one human-controlled
`summary.md` checklist. Review-only by default: **never modify product code**.

This skill pairs with `immutable-spec-delivery`. When an active spec exists it is
used either as the review *target* or as the review *standard*, depending on the
command (see Scope Resolution).

## Commands

- `review` (default): resolve scope, fan out to all available agents, write one
  `<model>.md` per agent, then synthesize `summary.md`.
- `synthesize`: only merge existing `code_review/<feature>/*.md` review files into
  `summary.md`. Do not re-run agents.

If the user does not name a command, infer `review`.

## Scope Resolution

First detect the active spec: a single `*.md` file directly in `docs/specs/`
(not in `draft/` or `completed/`) is the active spec. Exact git commands are in
[`references/scope-resolution.md`](references/scope-resolution.md). Three cases:

1. **Review the spec's changes** — user asks to review "this spec" / "本次 spec
   的变更". Requires an active spec. Review *all* changes attributable to the spec,
   including already-committed ones. The base is the parent of the spec's first
   commit (found via `git log --grep=<spec-filename>`); the scope is
   `git diff <base>` (committed + uncommitted) plus any unstaged work. The spec
   file is included both as a changed file and as the acceptance standard.

2. **Review the code changes** — user asks to review "the code" / "本次代码变更".
   Scope is the uncommitted working-tree diff only (unstaged + staged). If an
   active spec exists, pass its requirements as the **review standard** (does the
   uncommitted code satisfy the spec?), but do not expand the diff to committed
   work.

3. **No active spec** — review the uncommitted working-tree diff directly. If the
   working tree is clean, fall back to `main...HEAD` (then `master...HEAD`). If no
   base can be inferred, ask the user.

Explicit user-provided refs (branch, commit range, PR) always override the above.

When the request is ambiguous (an active spec exists but the user just says
"review"), ask whether they mean the spec's full changes (case 1) or only the
uncommitted code (case 2).

## Feature Folder

Derive `<feature>` so the folder is stable and scannable:

- with an active spec: use the Spec-ID slug, e.g. `S0044-update-compatibility`.
- no spec: use the branch name or a short sanitized summary of the diff.

All artifacts live under `code_review/<feature>/`:

```text
code_review/<feature>/
  scope.md        # what was reviewed + how (base, diff stat, spec standard)
  codex.md        # Codex review
  cursor.md       # Cursor review
  claude.md       # Claude review
  summary.md      # synthesized checklist (human approval boundary)
```

Recommend adding `code_review/` to `.gitignore` if absent. Do not edit
`.gitignore` unless the user asks.

## Orchestration Workflow

1. **Resolve scope** (above). Run the git commands, then write
   `tmp/review/<feature>/changes.diff` (the full diff) and
   `code_review/<feature>/scope.md` (human-readable: case, base ref, `git diff
   --stat`, and — if applicable — the active spec's requirement/acceptance
   sections quoted as the standard).

2. **Check agent availability.** For each of `codex`, `cursor-agent`:
   `command -v <bin>` and a quick auth probe (`cursor-agent status`; for Codex
   confirm it runs). Skip any agent that is missing or unauthenticated and record
   the skip in `scope.md`. Claude always reviews. Proceed as long as at least one
   reviewer (including Claude) runs.

3. **Build the review prompt** once, shared by all agents. Codex and Cursor do
   not load Claude skills, so the prompt must be **self-contained**: inline the
   checklist and template content rather than only linking to them. The prompt
   must instruct the agent to:
   - read `tmp/review/<feature>/changes.diff` and `code_review/<feature>/scope.md`
     (both are real files in the repo the agent runs in);
   - apply the embedded review checklist — copy the body of
     [`references/review-checklist.md`](references/review-checklist.md) (P0–P3
     severities, SOLID/security/quality, plus spec-compliance when scope.md gives
     a spec standard) directly into the prompt;
   - write its review to `code_review/<feature>/<model>.md` following the embedded
     [`references/templates/review-template.md`](references/templates/review-template.md);
   - reply once, compactly, with no progress chatter (token contract).

   The `run_review_agent.sh` wrapper already appends the output-target and token
   contract, so the prompt file itself only needs the diff/context pointers,
   the inlined checklist, and the inlined template.

4. **Fan out in parallel.** Run each external agent via the wrapper, in the
   background, then wait:

   ```bash
   bash .claude/skills/multi-agent-review/scripts/run_review_agent.sh \
     codex <feature> tmp/review/<feature>/review.prompt.txt &
   bash .claude/skills/multi-agent-review/scripts/run_review_agent.sh \
     cursor <feature> tmp/review/<feature>/review.prompt.txt &
   wait
   ```

   Meanwhile Claude performs its own review against the same checklist and writes
   `code_review/<feature>/claude.md`.

5. **Confirm outputs.** Verify each expected `<model>.md` exists and is
   non-empty. If an agent produced nothing, note it in `summary.md` rather than
   failing the whole run.

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
- **the more agents independently raise the same finding, the more likely it is
  real** — sort within each severity so multi-agent findings come first, and treat
  them as high-confidence;
- preserve genuine disagreement (don't silently drop a single-agent / minority
  finding — label it `仅 <agent> 提出`, lower confidence);
- order by severity P0 → P3;
- when a spec standard was used, add a **规格符合性 (Spec Compliance)** section
  mapping each acceptance criterion / spec item to 满足 / 部分满足 / 未满足 with
  evidence;
- every fixable finding gets an unchecked `[ ]` checkbox — checked means
  "approved to fix" and is the human boundary. This skill never fixes anything;
  it only reviews and reports.

### Re-confirmation (required before finalizing summary.md)

Do NOT just copy agent claims. Claude independently re-checks findings against the
ACTUAL code before writing them into the summary:

1. Re-verify EVERY P0/P1 finding and EVERY multi-agent finding by reading the
   referenced `file:line` in the real diff/code — confirm the issue actually holds.
2. Spot-check single-agent P2/P3 findings; drop or downgrade ones that don't hold.
3. Give each finding a `复核:` verdict — one of `确认` (verified against code),
   `存疑` (plausible but unverified / needs the author's input), or `误报`
   (checked and does not hold; exclude from the checklist or list under a
   "误报 / 已排除" note with the reason).
4. If agents disagree on the same spot, resolve it by reading the code and state
   which side the evidence supports.

Finish by reporting to the user IN CHINESE: counts per severity, how many findings
each agent raised + how many were cross-confirmed, where the files are, and that
the `summary.md` checkboxes are theirs to tick (fixes are out of scope).

## Guardrails

- Review-only. Never edit product code, never commit, never revert user changes.
- Never trust a single agent's narrative — Claude independently re-derives the
  diff scope and spot-checks at least the P0/P1 findings against the actual code.
- Keep external-agent invocations read-oriented; do not pass `--force`/`--yolo`.
- Cursor runs with its **auto** model selection (the wrapper passes no
  `--model`); only pin a fixed model via `CURSOR_EXTRA_ARGS` if the user asks.
- Keep raw agent run logs under `tmp/review/`; keep curated reviews under
  `code_review/`.
