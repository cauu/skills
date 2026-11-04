# List notes

A user sees every saved note, one per line.

## Sub-features

- `all` prints every note as `<id>  <title>`.

## How to get to it (user POV)

- `notes list` in a terminal.

## Driving it with node

Preconditions:

- Baseline state.

- **All.** `node bin/notes.js --data "$SCRATCH/notes.json" list`. Exit code 0; stdout is `1  Quarterly plan` then `2  Grocery list`.

## Gotchas

- Two spaces separate the ID and the title.

## Source entry points

- `src/commands/list.js`
- `src/commands/index.js`: the `list` entry in the command table
- `src/store.js`: `load`
