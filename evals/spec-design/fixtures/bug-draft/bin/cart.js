#!/usr/bin/env node
const fs = require('fs');
const { cartTotal } = require('../src/cart');

const [file, code] = process.argv.slice(2);
if (!file) {
  console.error('usage: cart <cart.json> [discount-code]');
  process.exit(2);
}
const cart = JSON.parse(fs.readFileSync(file, 'utf8'));
console.log(`Total: ${cartTotal(cart, code)}`);
