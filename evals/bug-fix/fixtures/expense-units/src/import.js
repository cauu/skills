// Append one expense. Since format v2 (S0001), amounts are stored as integer cents.
const fs = require('fs');

function addExpense(file, date, amount) {
  const records = JSON.parse(fs.readFileSync(file, 'utf8'));
  records.push({ date, amountCents: Math.round(amount * 100), v: 2 });
  fs.writeFileSync(file, JSON.stringify(records, null, 2) + '\n');
}

module.exports = { addExpense };
