// Monthly totals over records shaped { date, cents }.
function monthTotal(records, month) {
  const inMonth = records.filter((record) => record.date.startsWith(month));
  return {
    cents: inMonth.reduce((sum, record) => sum + record.cents, 0),
    count: inMonth.length,
  };
}

module.exports = { monthTotal };
