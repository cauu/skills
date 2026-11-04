# notes-api

HTTP API for shared notes. Notes are stored in PostgreSQL 15.

## Run locally

```sh
npm install
createdb notes
DATABASE_URL=postgres://localhost/notes npm run db:setup
DATABASE_URL=postgres://localhost/notes PORT=3000 npm start
```

The server prints `notes-api listening on <port>` when it is ready.

## API

- `GET /health` returns `{"ok":true,"db":"up"}` when the database answers.
- `GET /notes` returns every note as JSON.
- `POST /notes` with `{"title":"...","body":"..."}` creates a note and returns it with its `id`.
