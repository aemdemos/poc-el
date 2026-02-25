import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // strip button classes from footer links
  footer.querySelectorAll('.button-container').forEach((bc) => {
    bc.classList.remove('button-container');
  });
  footer.querySelectorAll('a.button').forEach((a) => {
    a.classList.remove('button', 'primary');
  });

  // split the link section UL into 3 columns based on <strong> headers
  const linkSection = footer.querySelector(':scope > div:nth-child(2) .default-content-wrapper');
  if (linkSection) {
    const ul = linkSection.querySelector('ul');
    if (ul) {
      const columns = [];
      let currentCol = document.createElement('div');
      currentCol.className = 'footer-col';
      const currentUl = document.createElement('ul');
      currentCol.append(currentUl);
      columns.push(currentCol);

      [...ul.children].forEach((li) => {
        const strong = li.querySelector('strong');
        if (strong && !li.querySelector('a')) {
          // start a new column
          currentCol = document.createElement('div');
          currentCol.className = 'footer-col';
          const heading = document.createElement('p');
          heading.className = 'footer-col-heading';
          heading.textContent = strong.textContent;
          currentCol.append(heading);
          const newUl = document.createElement('ul');
          currentCol.append(newUl);
          columns.push(currentCol);
        } else {
          const lastCol = columns[columns.length - 1];
          lastCol.querySelector('ul').append(li);
        }
      });

      linkSection.innerHTML = '';
      columns.forEach((col) => linkSection.append(col));
    }
  }

  block.append(footer);
}
