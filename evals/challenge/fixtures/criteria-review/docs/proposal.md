# Proposal: CSV export for notes

## Problem

Users copy notes into spreadsheets by hand. They want a CSV file instead.

## Plan

Add a `notes export` command next to `notes list`. It prints every note as CSV
to stdout: a header line `id,title,body`, then one line per note. Fields that
contain a comma or a double quote are quoted, with inner quotes doubled.

## Acceptance criteria

1. `node bin/notes.js export` prints `id,title,body` as its first line, followed by one line per note in `data/notes.json`.
2. A note whose body is `milk, eggs` is exported as `"milk, eggs"`.
3. The export feels intuitive and pleasant to use.
