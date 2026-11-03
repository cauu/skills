# Verify notes

Last full run: 20261101T100000Z-notes

Notes is a command-line app, `bin/notes.js`. There is no server: every drive is one short command against this run's scratch data file. The drive rules are in [drive-contract.md](drive-contract.md); the features are in [features/README.md](features/README.md).

## Launch

Nothing to build (Node.js 18 or newer, no dependencies). Start each run with:

```sh
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)-$(basename "$PWD")"
SCRATCH="${TMPDIR:-/tmp}/verify-notes-$RUN_ID"
mkdir -p "$SCRATCH" ".verify-artifacts/$RUN_ID"
cp data/notes.json "$SCRATCH/notes.json"
```

Ready when `node bin/notes.js --version` exits 0.

## Doctor

- `node bin/notes.js --version` prints the `version` in `package.json`.
- `node bin/notes.js --data "$SCRATCH/notes.json" list` exits 0 and prints the 2 seeded notes.

## Drive

Run every command as `node bin/notes.js --data "$SCRATCH/notes.json" <command> [args]`. Never drive without `--data`: that writes to the project's own `data/notes.json`. Recipes are in the feature files.

## Evidence

For each sub-feature, save the command, stdout, stderr, and exit code to `.verify-artifacts/$RUN_ID/<feature-id>/<sub-feature>.txt`. For a mutation, also save a read-back with `list`.

## Cleanup

`rm -rf "$SCRATCH"`. Never delete `.verify-artifacts/`.

## Helpers

None.

## Isolation

Each run has its own scratch data file named after the run-id, so runs from several worktrees do not share state.
