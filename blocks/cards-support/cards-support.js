import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  let heroRow = null;

  // Check if first row is a hero image (has picture but no text body)
  const firstRow = rows[0];
  if (firstRow) {
    const cols = [...firstRow.children];
    const hasOnlyImage = cols.length >= 1
      && cols[0].querySelector('picture')
      && (!cols[1] || cols[1].textContent.trim() === '');
    if (hasOnlyImage) {
      heroRow = firstRow;
      rows.shift();
    }
  }

  // Build hero banner if present - insert at section level
  if (heroRow) {
    const section = block.closest('.section');
    if (section) {
      const heroBanner = document.createElement('div');
      heroBanner.className = 'cards-support-hero';
      const pic = heroRow.querySelector('picture');
      if (pic) {
        const img = pic.querySelector('img');
        if (img) {
          const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '1400' }]);
          moveInstrumentation(img, optimizedPic.querySelector('img'));
          heroBanner.append(optimizedPic);
        }
      }
      // Insert hero before the default-content-wrapper (first child of section)
      section.insertBefore(heroBanner, section.firstElementChild);
    }
  }

  /* change to ul, li */
  const ul = document.createElement('ul');
  rows.forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-support-card-image';
      else div.className = 'cards-support-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
