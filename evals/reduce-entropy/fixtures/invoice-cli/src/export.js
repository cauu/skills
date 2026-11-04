const { formatLocalDate } = require('./dates');
const { lineTotal } = require('./pricing');

function renderCsv(orders) {
  const stamp = formatLocalDate(new Date());
  const rows = [`# exported ${stamp}`, 'order,date,qty,unit_cents,line_cents'];
  for (const order of orders) {
    for (const line of order.lines) {
      rows.push([order.id, formatLocalDate(order.date), line.qty, line.unitCents, lineTotal(line)].join(','));
    }
  }
  return rows.join('\n');
}

module.exports = { renderCsv };
