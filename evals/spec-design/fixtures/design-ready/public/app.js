fetch('/api/notes')
  .then((res) => res.json())
  .then((notes) => {
    const list = document.getElementById('notes');
    for (const note of notes) {
      const item = document.createElement('li');
      item.textContent = note.title;
      list.appendChild(item);
    }
  });

document.getElementById('settings-toggle').addEventListener('click', () => {
  const menu = document.getElementById('settings-menu');
  menu.hidden = !menu.hidden;
});
