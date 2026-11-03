// Shared result shape: every named check must hold.
module.exports = (checks) => {
  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(Boolean).length;
  return { pass: passed === total, score: passed / total, reason: JSON.stringify(checks) };
};
