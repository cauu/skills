const test = require('node:test');
const assert = require('node:assert');
const { slugify } = require('../src/slug');

test('lowercases a title and joins its words with a dash', () => {
  assert.strictEqual(slugify('Hello World'), 'hello-world');
});
