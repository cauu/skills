# Skill behavior evaluations

These evaluations check whether a fresh agent that reads one of this repository's skills does what the skill says. They are repository source only. They live outside `skills/`, so skills.sh never installs them.

## What runs

- [Promptfoo](https://promptfoo.dev) 0.122.0 runs each case, checks the assertions, and keeps the raw result. This repository adds only a thin runner.
- The agent under test is local Claude Code, `claude-opus-5-5`, through Promptfoo's `anthropic:claude-agent-sdk` provider. It uses your local Claude login. No API key is needed.
- Each test gets a fresh Git workspace: the candidate skill under `.claude/skills/<skill>/`, then the test's fixture, then one commit. The real repository is not touched.
- The agent loads only project settings and only the candidate skill. Network access from its tools is blocked by the sandbox. It receives an environment allowlist, not your shell environment.

## Requirements

- Node.js 22.22.0 or newer (for example `nvm use 24`).
- Claude Code installed and logged in (`claude` on `PATH`).
- `npm ci` once.

## Run

```sh
npm run eval:immutable-spec
# or any suite: [EVAL_SUITE=<name>] evals/run.sh <skill> [promptfoo args...]
EVAL_SUITE=contrast evals/run.sh immutable-spec
```

The command exits 0 only when every assertion passes. A missing login, a missing suite, or an old Node.js version exits non-zero. It is never a pass. The last line prints the path of the raw `result.json`. The disposable workspace sits next to it for inspection.

## Cost

About 0.18 USD and 30 seconds per case run with `claude-opus-5-5` (measured 2026-11-03).

## Evidence boundary

A passing case proves that, in that fixture, an agent explicitly told to use the skill produced the asserted final output, files, and Git state. It does not prove:

- automatic routing to the skill (tasks name the skill);
- reliability across repeated runs (cases run once unless `repeat` says otherwise);
- the agent's intermediate steps;
- behavior with other harnesses or models.

## Add or change cases

Use the internal `skill-eval-case-designer` skill in `.claude/skills/`. It explains the layout, the case contract, and the integrity rules. Every suite has a `case-review.md` for human approval.
