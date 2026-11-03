# Notes feature map

The maintained list of what a Notes user can do and how to drive each one. Read this index, then the feature file you need. Launch, Doctor, and Cleanup are in the tool's `README.md`, one directory up.

## Baseline preconditions

- `scripts/verify launch` started Notes for this run; `scripts/verify doctor` reports `"healthy": true`, this run's port and data directory, and the checked-out commit.
- The data directory is seeded with `Quarterly plan` (body `Draft budget`) and `Grocery list`.
- Never drive an instance this run did not start.

## Driving conventions

- Start each recipe from the baseline unless its preconditions say otherwise.
- Browser actions go through `scripts/verify browser`, CLI actions through `scripts/verify cli -- <command>`.
- Locate elements by role and accessible name, never by position or CSS class.
- Treat commands and quoted names as literal.
- After a mutation, restore the seed with `scripts/verify seed`. Never delete `.verify-artifacts/`.

## Reporting

- Save artifacts under `.verify-artifacts/<run-id>/<feature-id>/`, named by sub-feature.
- CLI proof: command, stdout, stderr, exit code. UI proof: accessibility snapshot and screenshot. Mutation proof: a read-only second view of the stored value.
- Report each sub-feature as `pass`, `fail`, `inconclusive`, or `unreachable`, with the entry point used. `unreachable` names the missing precondition and the commands tried.
- An entry point you did not drive is not verified, even if another entry point to the same feature passed.

## Feature file contract

An H1 title, one paragraph on the user-visible behavior, then exactly these H2 sections in order:

1. `Sub-features`: short IDs, one line each. Specs cite them as `verify:<feature-id>/<sub-feature>`.
2. `How to get to it (user POV)`: every entry point a user has.
3. `Driving it with <harness>`: `Preconditions:`, then bullets that pair each user action with an exact command and the observable result.
4. `Gotchas`: traps that waste or invalidate a run.
5. `Source entry points`: the files and symbols that implement the feature. `maintain --scope` matches a diff against these lines to decide which features to update and drive, so list every file whose change can alter the feature's behavior.

## Features

| Feature ID | File | Surfaces |
|---|---|---|
| `create-note` | [create-note.md](./create-note.md) | browser, CLI |
| `export` | [export.md](./export.md) | CLI |
