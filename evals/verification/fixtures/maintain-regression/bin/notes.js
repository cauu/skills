#!/usr/bin/env node
const { run } = require('../src/commands');

process.exitCode = run(process.argv.slice(2));
