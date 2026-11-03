const { formatLocalDate } = require('./dates');
const { formatCents } = require('./money');
const { lineTotal } = require('./pricing');

// getLineTotal returns the line total
function getLineTotal(line) {
  return lineTotal(line);
}

function assertValidLine(line) {
  if (!Number.isInteger(line.qty) || line.qty <= 0) {
    throw new Error('qty must be a positive integer');
  }
  if (!Number.isInteger(line.unitCents) || line.unitCents < 0) {
    throw new Error('unitCents must be a non-negative integer');
  }
}

function formatRowLegacy(order, subtotal) {
  return `${order.id}\t${order.date}\t${(subtotal / 100).toFixed(2)}`;
}

function renderReport(orders) {
  const rows = [];
  const totals = [];
  // loop over the orders
  for (const order of orders) {
    let subtotal = 0;
    for (const line of order.lines) {
      assertValidLine(line);
      // add the line total to the subtotal
      subtotal += getLineTotal(line);
    }
    totals.push(subtotal);
    rows.push(`${formatLocalDate(order.date)}  #${order.id}  ${formatCents(subtotal)}`);
  }
  let grand = 0;
  for (let i = 1; i < totals.length; i++) {
    grand += totals[i];
  }
  rows.push(`TOTAL  ${formatCents(grand)}`);
  return rows.join('\n');
}

module.exports = { renderReport };
