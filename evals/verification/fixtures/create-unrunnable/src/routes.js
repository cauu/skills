function send(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(value));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch (error) { reject(error); }
    });
  });
}

async function handle(pool, req, res) {
  try {
    if (req.method === 'GET' && req.url === '/health') {
      await pool.query('SELECT 1');
      return send(res, 200, { ok: true, db: 'up' });
    }
    if (req.method === 'GET' && req.url === '/notes') {
      const { rows } = await pool.query('SELECT id, title, body FROM notes ORDER BY id');
      return send(res, 200, rows);
    }
    if (req.method === 'POST' && req.url === '/notes') {
      const { title, body } = await readJson(req);
      if (!title || typeof body !== 'string') return send(res, 400, { error: 'title and body are required' });
      const { rows } = await pool.query('INSERT INTO notes (title, body) VALUES ($1, $2) RETURNING id, title, body', [title, body]);
      return send(res, 201, rows[0]);
    }
    return send(res, 404, { error: 'not found' });
  } catch (error) {
    return send(res, 500, { error: error.message });
  }
}

module.exports = { handle };
