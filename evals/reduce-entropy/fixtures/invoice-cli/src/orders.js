const fs = require('fs');

function loadOrders(file) {
  const orders = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(orders)) throw new Error('orders file must contain an array');
  for (const order of orders) {
    if (!order.id || !order.date || !Array.isArray(order.lines)) {
      throw new Error(`order ${order.id || '?'} needs id, date and lines`);
    }
    for (const line of order.lines) {
      if (!Number.isInteger(line.qty) || line.qty <= 0) {
        throw new Error(`order ${order.id}: qty must be a positive integer`);
      }
      if (!Number.isInteger(line.unitCents) || line.unitCents < 0) {
        throw new Error(`order ${order.id}: unitCents must be a non-negative integer`);
      }
    }
  }
  return orders;
}

module.exports = { loadOrders };
