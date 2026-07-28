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

## Engineering Skills

### User-invoked

- **[code-review](./skills/engineering/code-review/SKILL.md)** — Review a
  resolved code-change scope using three isolated reviewer executions, verify
  candidate findings against the code, and produce an advisory checklist for
  human confirmation.

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
  validation evidence, and commits.
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
    └── tdd/
```

Every distributable skill is a directory containing a valid `SKILL.md`.
Supporting references, scripts, assets, and agent-specific metadata live inside
the same directory.

The skills.sh CLI handles GitHub downloads, skill discovery, agent-specific
installation paths, source tracking, and updates. This repository does not
publish an npm package or implement its own installer.
