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

  // split the link section UL into 2 columns:
  // col 1 = general links, col 2 = WHY LUMEN + RESOURCES stacked
  const linkSection = footer.querySelector(':scope > div:nth-child(2) .default-content-wrapper');
  if (linkSection) {
    const ul = linkSection.querySelector('ul');
    if (ul) {
      const col1 = document.createElement('div');
      col1.className = 'footer-col';
      const col1Ul = document.createElement('ul');
      col1.append(col1Ul);

      const col2 = document.createElement('div');
      col2.className = 'footer-col';
      let currentUl = null;

      [...ul.children].forEach((li) => {
        const strong = li.querySelector('strong');
        if (strong && !li.querySelector('a')) {
          // heading for a sub-section in col 2
          const heading = document.createElement('p');
          heading.className = 'footer-col-heading';
          heading.textContent = strong.textContent;
          col2.append(heading);
          currentUl = document.createElement('ul');
          col2.append(currentUl);
        } else if (currentUl) {
          currentUl.append(li);
        } else {
          col1Ul.append(li);
        }
      });

      linkSection.innerHTML = '';
      linkSection.append(col1);
      linkSection.append(col2);
    }
  }

  block.append(footer);
}
