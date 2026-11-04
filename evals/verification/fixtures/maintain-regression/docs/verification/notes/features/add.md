# Add a note

A user saves a note with a title and a body.

## Sub-features

- `save` stores the note and prints its new ID.
- `usage` rejects a missing body.

## How to get to it (user POV)

- `notes add <title> <body>` in a terminal.

## Driving it with node

Preconditions:

- Baseline state.

- **Save.** `node bin/notes.js --data "$SCRATCH/notes.json" add "Release checklist" "Tag and publish"`. Exit code 0; stdout `added 3`.
- **Read back.** `node bin/notes.js --data "$SCRATCH/notes.json" list`. The last line is `3  Release checklist`.
- **Usage.** `node bin/notes.js --data "$SCRATCH/notes.json" add "Only a title"`. Exit code 2; stderr starts with `usage: notes add`.

## Gotchas

- IDs continue from the highest existing ID, so the expected ID depends on the seed.

## Source entry points

- `src/commands/add.js`
- `src/store.js`: `load`, `save`
