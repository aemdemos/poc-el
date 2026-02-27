export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Check if first two rows both contain images (desktop + mobile)
  const firstRowPic = rows[0]?.querySelector('picture');
  const secondRowPic = rows[1]?.querySelector('picture');

  if (firstRowPic && secondRowPic) {
    // Mark first row as desktop image, second as mobile image
    rows[0].classList.add('hero-enterprise-img-desktop');
    rows[1].classList.add('hero-enterprise-img-mobile');
  } else if (!firstRowPic) {
    block.classList.add('no-image');
  }

  // Merge content rows (non-image rows) into a single div
  const contentRows = rows.filter((r) => !r.classList.contains('hero-enterprise-img-desktop')
    && !r.classList.contains('hero-enterprise-img-mobile')
    && !r.querySelector('picture'));

  if (contentRows.length > 1) {
    const target = contentRows[0];
    const inner = target.querySelector(':scope > div') || target;
    for (let i = 1; i < contentRows.length; i += 1) {
      while (contentRows[i].firstElementChild?.firstElementChild) {
        inner.append(contentRows[i].firstElementChild.firstElementChild);
      }
      contentRows[i].remove();
    }
  }

  // Convert paragraphs with markdown heading syntax to actual headings
  block.querySelectorAll('p').forEach((p) => {
    const text = p.textContent.trim();
    const match = text.match(/^(#{1,6})\s+(.*)/);
    if (match) {
      const level = match[1].length;
      const heading = document.createElement(`h${level}`);
      [, , heading.textContent] = match;
      p.replaceWith(heading);
    }
  });
}
