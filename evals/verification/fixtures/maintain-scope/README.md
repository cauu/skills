# notes

Keep short notes from the terminal. Node.js 18 or newer, no dependencies.

```sh
node bin/notes.js add "Quarterly plan" "Draft budget"
node bin/notes.js list
node bin/notes.js export > notes.csv
```

- `add <title> <body>` saves a note and prints `added <id>`.
- `list` prints one line per note: `<id>  <title>`.
- `search <query>` prints the notes whose title or body contains the query, ignoring case. Exit code 1 when nothing matches.
- `export` prints every note as CSV with a `title,body` header. Fields containing a comma or a quote are quoted.

Notes are stored in `data/notes.json`. Use `--data <file>` (or `NOTES_DATA=<file>`) to work on another file. `node bin/notes.js --version` prints the version.

Run the tests with `npm test`.
