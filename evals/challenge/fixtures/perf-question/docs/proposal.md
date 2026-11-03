# Proposal: move the notes store from a JSON file to SQLite

## Problem

`src/store.js` reads the whole JSON file at startup. Our biggest users have
about 10,000 notes. At that size the JSON load will take well over a second,
so startup feels slow.

## Plan

1. Add `better-sqlite3` as a dependency.
2. Write a migration that copies `data/notes.json` into `data/notes.db`.
3. Replace `loadNotes` with paged SQL queries.
4. Keep the JSON reader for one release as a fallback.

## Acceptance criteria

1. After migration, `notes list` shows the same notes as before.
2. Startup with 10,000 notes takes under 200 ms.
