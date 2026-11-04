const http = require('http');
const { Pool } = require('pg');
const routes = require('./src/routes');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required, for example postgres://localhost/notes');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT || 3000);

http.createServer((req, res) => routes.handle(pool, req, res)).listen(port, () => {
  console.log(`notes-api listening on ${port}`);
});
