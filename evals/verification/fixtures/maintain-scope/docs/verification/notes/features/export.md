# Export notes

A user prints every note as CSV.

## Sub-features

- `csv` prints a `title,body` header and one row per note.
- `quoting` quotes a field that contains a comma.

## How to get to it (user POV)

- `notes export` in a terminal.

## Driving it with node

Preconditions:

- Baseline state.

- **CSV.** `node bin/notes.js --data "$SCRATCH/notes.json" export`. Exit code 0; the first line is `title,body`, then `Quarterly plan,Draft budget`.
- **Quoting.** In the same output, the second row is `Grocery list,"Milk, eggs"`.

## Gotchas

- The header is printed even when there are no notes.

## Source entry points

- `src/commands/export.js`
- `src/csv.js`: `toCsv`
- `src/store.js`: `load`
