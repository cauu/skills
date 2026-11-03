// Split a list into fixed-size pages. Pages are numbered from 1.
const PAGE_SIZE = 3;

function pageCount(items, size) {
  return Math.max(1, Math.ceil(items.length / size));
}

function page(items, n, size) {
  const start = (n - 1) * size;
  const end = start + size - 1;
  return items.slice(start, end);
}

module.exports = { PAGE_SIZE, page, pageCount };
