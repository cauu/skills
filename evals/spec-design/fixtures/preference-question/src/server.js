const http = require('http');
const fs = require('fs');
const path = require('path');
const { loadNotes } = require('./store');

const PUBLIC = path.join(__dirname, '..', 'public');

function handle(req, res) {
  if (req.url === '/api/notes') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(loadNotes()));
    return;
  }
  const file = path.join(PUBLIC, req.url === '/' ? 'index.html' : req.url);
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file)) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200);
  res.end(fs.readFileSync(file));
}

if (require.main === module) {
  http.createServer(handle).listen(process.env.PORT || 3000);
}

module.exports = { handle };
