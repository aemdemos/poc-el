export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  // First row: background image, second row: text content
  const imgRow = rows[0];
  const img = imgRow.querySelector('img');
  if (!img) return;

  // Create background container
  const bg = document.createElement('div');
  bg.className = 'hero-bg';
  const pic = imgRow.querySelector('picture') || img.parentElement;
  bg.append(pic);
  imgRow.remove();

  // Prepend background behind content
  block.prepend(bg);
}
