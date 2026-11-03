#!/usr/bin/env node
// Usage: expenses total <YYYY-MM>
//        expenses add <YYYY-MM-DD> <amount>
const path = require('path');
const { load } = require('../src/store');
const { addExpense } = require('../src/import');
const { monthTotal } = require('../src/report');

const FILE = path.join(__dirname, '..', 'data', 'expenses.json');
const [command, a, b] = process.argv.slice(2);

if (command === 'total' && a) {
  const { cents, count } = monthTotal(load(FILE), a);
  console.log(`Total ${a}: ${(cents / 100).toFixed(2)} (${count} expenses)`);
} else if (command === 'add' && a && b) {
  addExpense(FILE, a, Number(b));
  console.log(`Added ${a} ${Number(b).toFixed(2)}`);
} else {
  console.error('usage: expenses total <YYYY-MM> | expenses add <YYYY-MM-DD> <amount>');
  process.exitCode = 2;
}
