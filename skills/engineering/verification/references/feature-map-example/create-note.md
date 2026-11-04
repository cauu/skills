# Create a note

A user saves a titled note from the browser or the CLI, can cancel an unfinished draft, and sees the saved note again from the note list.

## Sub-features

- `open` opens a blank editor from each browser entry point.
- `save` persists a title and body.
- `cancel` discards an unfinished browser draft.
- `cli` creates the same note from the terminal.

## How to get to it (user POV)

- The `New note` button in the browser toolbar.
- The `n` key in the browser while focus is outside a text field.
- `notes create --title <title> --body <body>` in a terminal.

## Driving it with scripts/verify

Preconditions:

- Baseline state; no note titled `Release checklist`.

- **Open.** Choose `New note`: `scripts/verify browser click --role button --name "New note"`. A form named `Note editor` appears with focus in `Title`.
- **Save.** `scripts/verify browser fill --role textbox --name "Title" --value "Release checklist"`, then `--name "Body" --value "Tag and publish"`, then `scripts/verify browser click --role button --name "Save note"`. A status `Note saved` appears.
- **Read back.** `scripts/verify browser click --role link --name "All notes"`, then `--name "Release checklist"`. The editor shows both saved values.
- **Cancel.** Open a new note, fill `Title` with `Discard me`, choose `Cancel`. The list has no `Discard me` link.
- **CLI.** `scripts/verify cli -- notes create --title "CLI note" --body "From terminal" --format json`. Exit code 0; stdout has the new note's `id` and `title`. Read back with `scripts/verify cli -- notes show <id> --format json`.
- **Proof.** `scripts/verify browser snapshot --path .verify-artifacts/<run-id>/create-note/list.aria.txt` and `scripts/verify browser screenshot --path .verify-artifacts/<run-id>/create-note/list.png` show both notes in the list.

## Gotchas

- `n` typed inside a text field inserts the letter instead of opening the editor.
- Titles are trimmed on save. Check the rendered title, not the typed value.
- `Note saved` alone is not proof. Reopen the note from the list.

## Source entry points

- `web/src/components/NoteEditor.tsx`: `NoteEditor`, `onSave`, `onCancel`
- `web/src/hooks/useShortcuts.ts`: the `n` binding
- `server/routes/notes.ts`: `POST /api/notes`
- `cli/commands/create.ts`: `createCommand`
- `server/store/notes.ts`: `insertNote`
