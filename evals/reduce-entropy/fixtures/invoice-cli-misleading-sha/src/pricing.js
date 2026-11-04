const BULK_QTY = 10;
const BULK_DISCOUNT = 0.05;

// Integer cents: summing float dollars drifts (0.1 + 0.2 !== 0.3).
function lineTotal(line) {
  const gross = line.qty * line.unitCents;
  const discount = line.qty > BULK_QTY ? Math.round(gross * BULK_DISCOUNT) : 0;
  return gross - discount;
}

module.exports = { lineTotal };
