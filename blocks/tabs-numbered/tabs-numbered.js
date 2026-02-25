// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function parseMigrationContent(contentDiv) {
  const p = contentDiv.querySelector('p');
  if (!p) return;

  const hasBr = p.querySelector('br');
  const hasRawHeading = p.textContent.includes('##');
  if (!hasBr && !hasRawHeading) return;

  const picture = p.querySelector('picture');
  const link = p.querySelector('a');
  const rawHTML = p.innerHTML;
  const parts = rawHTML.split(/<br\s*\/?>/gi).map((s) => s.trim()).filter(Boolean);

  contentDiv.innerHTML = '';

  parts.forEach((part) => {
    if (part.startsWith('<picture') || part.startsWith('<a ')) return;

    const headingMatch = part.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const [, hashes, text] = headingMatch;
      const heading = document.createElement(`h${hashes.length}`);
      heading.textContent = text;
      contentDiv.append(heading);
      return;
    }

    const textOnly = part.replace(/<[^>]*>/g, '').trim();
    if (!textOnly) return;

    const para = document.createElement('p');
    para.innerHTML = part;
    contentDiv.append(para);
  });

  if (picture) contentDiv.prepend(picture);

  if (link) {
    const linkContainer = document.createElement('p');
    linkContainer.className = 'button-container';
    linkContainer.append(link);
    contentDiv.append(linkContainer);
  }
}

function switchTab(block, tablist, imageContainer, panelIndex) {
  block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
    panel.setAttribute('aria-hidden', true);
  });
  tablist.querySelectorAll('button').forEach((btn) => {
    btn.setAttribute('aria-selected', false);
  });
  imageContainer.querySelectorAll('.tabs-numbered-image').forEach((img) => {
    img.setAttribute('aria-hidden', true);
  });

  const panels = block.querySelectorAll('[role=tabpanel]');
  const buttons = tablist.querySelectorAll('button');
  const images = imageContainer.querySelectorAll('.tabs-numbered-image');

  if (panels[panelIndex]) panels[panelIndex].setAttribute('aria-hidden', false);
  if (buttons[panelIndex]) buttons[panelIndex].setAttribute('aria-selected', true);
  if (images[panelIndex]) images[panelIndex].setAttribute('aria-hidden', false);
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-numbered-list';
  tablist.setAttribute('role', 'tablist');

  const imageContainer = document.createElement('div');
  imageContainer.className = 'tabs-numbered-images';

  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-numbered-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    const button = document.createElement('button');
    button.className = 'tabs-numbered-tab';
    button.id = `tab-${id}`;

    moveInstrumentation(tab.parentElement, tabpanel.lastElementChild);
    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      switchTab(block, tablist, imageContainer, i);
    });
    tablist.append(button);
    tab.remove();
    moveInstrumentation(button.querySelector('p'), null);
  });

  // Parse migration content in each panel
  block.querySelectorAll('.tabs-numbered-panel').forEach((panel) => {
    const contentDiv = panel.querySelector(':scope > div');
    if (contentDiv) parseMigrationContent(contentDiv);
  });

  // Extract images from panels into shared image container
  block.querySelectorAll('.tabs-numbered-panel').forEach((panel, i) => {
    const picture = panel.querySelector('picture');
    const imageDiv = document.createElement('div');
    imageDiv.className = 'tabs-numbered-image';
    imageDiv.setAttribute('aria-hidden', !!i);
    if (picture) imageDiv.append(picture);
    imageContainer.append(imageDiv);
  });

  // Insert: image container first, then tablist
  block.prepend(tablist);
  block.prepend(imageContainer);
}
