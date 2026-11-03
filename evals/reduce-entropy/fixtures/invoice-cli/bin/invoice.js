#!/usr/bin/env node
const { loadOrders } = require('../src/orders');
const { renderReport } = require('../src/report');
const { renderCsv } = require('../src/export');

const commands = {
  report: renderReport,
  csv: renderCsv,
};

function main(argv) {
  const file = argv[0];
  if (!file) {
    console.error('usage: invoice <orders.json> [--csv]');
    return 2;
  }
  const mode = argv.includes('--csv') ? 'csv' : 'report';
  try {
    console.log(commands[mode](loadOrders(file)));
    return 0;
  } catch (err) {
    console.error(`error: ${err.message}`);
    return 1;
  }
}

process.exitCode = main(process.argv.slice(2));
