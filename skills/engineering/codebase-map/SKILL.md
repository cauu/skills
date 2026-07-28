---
name: codebase-map
description: Build and maintain a concise repository index for codebase navigation. Use when exploring an unfamiliar repository, documenting module responsibilities and key entry points, reducing repeated full-repository scans, or refreshing a stale structural map after meaningful codebase changes.
---

# Codebase Map

Maintain a persistent repository index that improves navigation without duplicating implementation or architecture documentation.

The map is a discovery aid. Actual code remains the source of truth for implementation behavior.

## Location

Store the canonical map at:

```text
docs/codebase-map.md
```

Maintain this file in place. It is not append-only.

## Format

Include:

1. A concise repository tree
2. Short descriptions of important modules
3. Key entry points or functions only when they materially improve navigation

Use this structure:

```markdown
# Codebase Map

Version:
Last Full Scan:
Last Incremental Update:
Last Verified Commit:

## Repository Tree
<tree with short functional notes>

## Module Glossary

### path/to/module
Responsibilities:
- ...

Key Functions:
- ...
```

Keep descriptions short, functional, and operationally useful. Do not turn the map into a full architecture narrative.

Metadata rules:

- Use a simple integer or lightweight project-local revision for `Version`.
- Set `Last Verified Commit` to a concrete Git ref that makes staleness easy to judge against `HEAD`.
- Prefer `Last Verified Commit` over `Version` when determining whether the map is trustworthy.

## Repository Tree

- Highlight major directories and important files.
- Add functional notes only when they improve navigation.
- Exclude generated files, vendor directories, build output, and low-signal assets.
- Optimize for discovery rather than exhaustive enumeration.

## Module Glossary

- Include independently meaningful module boundaries, deployable services, public interfaces, route registries, and data layers.
- Describe responsibilities with a few short bullets.
- List key functions only when they help a reader enter or trace the module.
- Do not document every function.

For a monorepo, default to one top-level map. Add sub-maps only when the root map becomes materially difficult to navigate, and retain a short root index pointing to them.

## Discovery Workflow

1. Read `docs/codebase-map.md` before considering a broad repository scan.
2. Compare `Last Verified Commit` with the current repository state.
3. Use the map to select the smallest relevant set of modules.
4. Inspect those modules and their direct dependencies, wiring, tests, and configuration.
5. When the map and code disagree, follow the code and update the map.

Do not rescan the entire repository when the existing map remains structurally consistent.

## Full Regeneration

Perform a full repository scan only when:

- `docs/codebase-map.md` does not exist;
- a large repository restructuring occurred;
- referenced modules cannot be located;
- imports, wiring, or dependencies appear broadly inconsistent;
- the map is too stale to narrow discovery safely; or
- the user explicitly requests regeneration.

Otherwise, prefer an incremental update.

## Incremental Updates

Update only affected portions when any of these change:

- repository structure;
- module ownership or responsibilities;
- major routes or entry points;
- important public interfaces;
- key dependency or wiring relationships.

Purely local implementation details do not require a map update unless they materially affect navigation.

For an incremental update:

1. Identify the changed modules.
2. Inspect those modules and the minimum surrounding dependencies.
3. Update the relevant tree and glossary entries.
4. Refresh `Last Incremental Update` and `Last Verified Commit`.

## Lazy Validation

Trust the map as a starting point, not as an authority.

Validate relevant entries when:

- files cannot be located;
- expected functions or modules are missing;
- imports, routes, or dependencies conflict with the map;
- tests or runtime behavior contradict documented structure.

If work proceeds cleanly and the relevant entries remain accurate, do not inspect or rewrite unrelated sections.
