# cauu-skills

Agent Skills distributed through the [skills.sh](https://skills.sh) ecosystem.

## Available skills

- `mock-skill` — confirms that Skill discovery, installation, and loading work.

## Install

Interactively select skills and target agents:

```bash
npx skills@latest add cauu/cauu-skills
```

Install `mock-skill` for Codex:

```bash
npx skills@latest add cauu/cauu-skills \
  --skill mock-skill \
  --agent codex
```

Install it globally:

```bash
npx skills@latest add cauu/cauu-skills \
  --skill mock-skill \
  --agent codex \
  --global
```

## Update

Update the installed skill from its tracked source:

```bash
npx skills@latest update mock-skill
```

## Repository structure

```text
skills/
└── mock-skill/
    ├── SKILL.md
    └── agents/
        └── openai.yaml
```

Each distributable Skill is a directory under `skills/` containing a valid `SKILL.md`. The skills.sh CLI handles GitHub downloads, Skill discovery, Agent-specific installation paths, and updates.
