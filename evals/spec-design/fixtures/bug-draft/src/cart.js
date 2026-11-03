const DISCOUNTS = { SAVE10: 0.1, SAVE25: 0.25 };

function discountRate(code) {
  return code ? DISCOUNTS[code] || 0 : 0;
}

function lineTotal(item, rate) {
  return item.price * item.qty * (1 - rate);
}

function subtotal(cart, rate) {
  return cart.items.reduce((sum, item) => sum + lineTotal(item, rate), 0);
}

function cartTotal(cart, code) {
  const rate = discountRate(code);
  const shipping = cart.shipping || 0;
  return subtotal(cart, rate) * (1 - rate) + shipping;
}

module.exports = { cartTotal, discountRate };
