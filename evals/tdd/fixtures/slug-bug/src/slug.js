// Turn a note title into a URL slug.
function slugify(title) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
}

module.exports = { slugify };
