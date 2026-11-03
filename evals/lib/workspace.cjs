// Read-only helpers for assertions. Assertions inspect the workspace after the agent finishes.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ws = () => process.env.EVAL_WORKSPACE;
const read = (rel) => { const p = path.join(ws(), rel); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; };
const exists = (rel) => fs.existsSync(path.join(ws(), rel));
const git = (...args) => execFileSync('git', args, { cwd: ws(), encoding: 'utf8' }).trim();
const commitCount = () => Number(git('rev-list', '--count', 'HEAD'));

module.exports = { ws, read, exists, git, commitCount };
