// Read the expense file. Every record comes back as { date, cents }.
const fs = require('fs');

function load(file) {
  const records = JSON.parse(fs.readFileSync(file, 'utf8'));
  return records.map((record) => ({
    date: record.date,
    cents: record.amountCents ?? record.amount,
  }));
}

module.exports = { load };
