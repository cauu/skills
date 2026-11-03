const assert = require('assert');
const { greet } = require('../src/greet');

assert.strictEqual(greet('Ada'), 'Hello, Ada');
console.log('greet ok');
