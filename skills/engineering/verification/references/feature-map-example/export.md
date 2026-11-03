# Export notes

A user exports every note to a CSV file from the terminal, or previews the export without writing a file.

## Sub-features

- `csv` writes all notes to a CSV file with a header row.
- `dry-run` prints what would be written and writes nothing.

## How to get to it (user POV)

- `notes export --out <file>` in a terminal.
- `notes export --out <file> --dry-run` in a terminal.

## Driving it with scripts/verify

Preconditions:

- Baseline state (two seeded notes).

- **CSV.** `scripts/verify cli -- notes export --out .verify-artifacts/<run-id>/export/notes.csv`. Exit code 0. The file's first line is `title,body`, followed by one line per note; `Quarterly plan,Draft budget` is present.
- **Dry run.** `scripts/verify cli -- notes export --out .verify-artifacts/<run-id>/export/dry.csv --dry-run`. Exit code 0; stdout lists 2 rows; `dry.csv` does not exist afterwards.
- **Proof.** Keep `notes.csv`, the stdout of both commands, and `ls` output of the export directory under `.verify-artifacts/<run-id>/export/`.

## Gotchas

- A body containing a comma is quoted. Seed data has none; add one with `notes create` to check quoting.
- `--dry-run` still reads the database. Check that no file appears, not that nothing ran.

## Source entry points

- `cli/commands/export.ts`: `exportCommand`
- `server/export/csv.ts`: `toCsv`
