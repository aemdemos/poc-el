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

  // Section 1: extract social icons, add search box
  const section1 = footer.querySelector(':scope > div:first-child .default-content-wrapper');
  if (section1) {
    const socialUl = section1.querySelector('ul');

    // add search box after logo
    const searchBox = document.createElement('div');
    searchBox.className = 'footer-search';
    searchBox.innerHTML = '<input type="text" placeholder="Search" aria-label="Search">';
    if (socialUl) {
      section1.insertBefore(searchBox, socialUl);
    } else {
      section1.append(searchBox);
    }

    // clone social icons for mobile (placed inside link section)
    if (socialUl) {
      socialUl.className = 'footer-social-desktop';
      const socialClone = socialUl.cloneNode(true);
      socialClone.className = 'footer-social-mobile';
      // store clone to insert into link section later
      footer._socialClone = socialClone;
    }
  }

  // Section 2: split links into quick-links, social, main-links, WHY LUMEN, RESOURCES
  const linkSection = footer.querySelector(':scope > div:nth-child(2) .default-content-wrapper');
  if (linkSection) {
    const ul = linkSection.querySelector('ul');
    if (ul) {
      const quickLinks = document.createElement('div');
      quickLinks.className = 'footer-quick-links';
      const quickUl = document.createElement('ul');
      quickLinks.append(quickUl);

      const mainLinks = document.createElement('div');
      mainLinks.className = 'footer-main-links';
      const mainUl = document.createElement('ul');
      mainLinks.append(mainUl);

      const col2 = document.createElement('div');
      col2.className = 'footer-col-right';
      let currentUl = null;
      let quickCount = 0;
      const quickLinkNames = ['contact us', 'sign in', 'billing', 'support'];

      [...ul.children].forEach((li) => {
        const strong = li.querySelector('strong');
        if (strong && !li.querySelector('a')) {
          // heading for WHY LUMEN / RESOURCES in col 2
          const heading = document.createElement('p');
          heading.className = 'footer-col-heading';
          heading.textContent = strong.textContent;
          col2.append(heading);
          currentUl = document.createElement('ul');
          col2.append(currentUl);
        } else if (currentUl) {
          currentUl.append(li);
        } else {
          // split first 4 links into quick-links
          const linkText = li.textContent.trim().toLowerCase();
          if (quickCount < 4 && quickLinkNames.includes(linkText)) {
            quickUl.append(li);
            quickCount += 1;
          } else {
            mainUl.append(li);
          }
        }
      });

      linkSection.innerHTML = '';
      linkSection.append(quickLinks);

      // insert mobile social icons clone after quick links
      if (footer._socialClone) {
        linkSection.append(footer._socialClone);
        delete footer._socialClone;
      }

      linkSection.append(mainLinks);
      linkSection.append(col2);
    }
  }

  block.append(footer);
}
