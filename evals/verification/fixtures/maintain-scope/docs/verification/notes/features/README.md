# Notes feature map

## Baseline preconditions

- Launch and Doctor from `../README.md` passed for this run.
- The scratch data file holds the 2 seeded notes: `Quarterly plan` and `Grocery list`.

## Driving conventions

- Commands are literal; always pass `--data "$SCRATCH/notes.json"`.
- After a mutation, copy `data/notes.json` over the scratch file again before the next recipe.

## Reporting

- Report each sub-feature as `pass`, `fail`, `inconclusive`, or `unreachable`, with the command used.

## Features

| Feature ID | File |
|---|---|
| `add` | [add.md](./add.md) |
| `list` | [list.md](./list.md) |
| `export` | [export.md](./export.md) |
