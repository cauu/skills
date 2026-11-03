# cauu-skills

[![skills.sh](https://skills.sh/b/cauu/skills)](https://skills.sh/cauu/skills)

Small, focused engineering skills for coding agents.

The skills are designed to be independently installable and usable across
Claude Code, Codex, Cursor, and other Agent Skills-compatible tools. Install
only the skills you need and adapt them to your own workflow.

## Quickstart

Run the [skills.sh](https://skills.sh) installer:

```bash
npx skills@latest add cauu/skills
```

The installer discovers the skills in this repository and lets you choose:

1. which skills to install;
2. which coding agents should receive them; and
3. whether to install them for the current project or globally.

Install one skill directly:

```bash
npx skills@latest add cauu/skills --skill code-review
```

For example, install TDD for Codex globally:

```bash
npx skills@latest add cauu/skills \
  --skill tdd \
  --agent codex \
  --global
```

## Update

Update installed skills from their tracked source:

```bash
npx skills@latest update
```

## Invocation

The skills split on who may invoke them.

- **User-invoked** skills run only when the user explicitly requests them. They
  orchestrate work with visible cost or a human decision boundary.
- **Model-invoked** skills may be invoked explicitly or selected automatically
  by an agent when the task matches their description.

Each skill remains a standalone installation unit. A skill may optionally read
ordinary project artifacts produced by another workflow, but it must not require
another skill to be installed unless its own documentation says so.

For a Chinese overview of the skills and the recommended AI engineering
workflow, see
[AI 工程 Skills 与工作流概览](./docs/ai-engineering-workflow-overview.md).

## Engineering Skills

### User-invoked

- **[code-review](./skills/engineering/code-review/SKILL.md)** — Review a
  resolved code-change scope using three isolated reviewer executions, verify
  candidate findings against the code, and produce an advisory checklist for
  human confirmation.
- **[verification](./skills/engineering/verification/SKILL.md)** — Generate
  and maintain a project-local `verify-<app>` tool that launches the real app,
  drives its features the way a user does, and keeps evidence. `create` proves
  the tool by running it once; `maintain --scope <diff>` updates only the
  features a change touched; `maintain` checks every feature. The tool is plain
  files under `docs/verification/<app>/` with thin wrappers in `.claude/skills/`
  and `.agents/skills/`, so it needs no skill installed to use.

### Model-invoked

- **[challenge](./skills/engineering/challenge/SKILL.md)** — Review a proposed
  solution from an adversarial perspective: challenge the problem, unnecessary
  complexity, inherited constraints, assumptions, and acceptance criteria.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)** — Use
  deep-module vocabulary and principles to design small interfaces with high
  leverage, clean seams, locality, and testability.
- **[codebase-map](./skills/engineering/codebase-map/SKILL.md)** — Build and
  maintain a concise repository index for codebase navigation without replacing
  the code as the source of truth.
- **[immutable-spec](./skills/engineering/immutable-spec/SKILL.md)** — Execute
  delivery from an append-only active specification with item-level traceability,
  validation evidence, and commits. Every spec declares a change type with its
  evidence gate and gives each acceptance check a method the agent runs itself;
  `scripts/spec-lint` checks these rules before activation and closure.
- **[immutable-spec-orca](./skills/engineering/immutable-spec-orca/SKILL.md)** —
  Activate a task-scoped spec and hand full delivery ownership to one agent in an
  Orca worktree. Requires `immutable-spec`.
- **[tdd](./skills/engineering/tdd/SKILL.md)** — Develop one vertical behavior
  slice at a time through pre-agreed seams using a test-first red → green loop.
  When an active immutable spec exists, use it as the behavior and acceptance
  source.

## Repository Structure

```text
skills/
└── engineering/
    ├── challenge/
    ├── code-review/
    ├── codebase-design/
    ├── codebase-map/
    ├── immutable-spec/
    ├── immutable-spec-orca/
    ├── tdd/
    └── verification/
```

Every distributable skill is a directory containing a valid `SKILL.md`.
Supporting references, scripts, assets, and agent-specific metadata live inside
the same directory.

Repository-only material is never installed:

- `evals/` holds agent behavior evaluations for the skills. See
  [evals/README.md](./evals/README.md).
- `tests/` holds script tests, for example `tests/spec-lint/run.sh`,
  `tests/consistency/run.sh`, and `tests/verification/`.
- `scripts/check-skill-consistency.py` checks that rules shared between skills
  stay identical.

The skills.sh CLI handles GitHub downloads, skill discovery, agent-specific
installation paths, source tracking, and updates. This repository does not
publish an npm package or implement its own installer.
