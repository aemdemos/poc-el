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

function updateActiveTab(tablist, imageContainer, panelIndex) {
  tablist.querySelectorAll('button').forEach((btn, i) => {
    btn.setAttribute('aria-selected', i === panelIndex);
  });
  imageContainer.querySelectorAll('.tabs-numbered-image').forEach((img, i) => {
    img.setAttribute('aria-hidden', i !== panelIndex);
  });
}

function scrollToPanel(track, panelIndex) {
  const panels = track.querySelectorAll('[role=tabpanel]');
  if (panels[panelIndex]) {
    track.scrollTo({ left: panels[panelIndex].offsetLeft, behavior: 'smooth' });
  }
}

function setupDrag(track) {
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;

  track.addEventListener('mousedown', (e) => {
    // ignore clicks on links/buttons
    if (e.target.closest('a, button')) return;
    isDown = true;
    startX = e.pageX;
    scrollStart = track.scrollLeft;
    track.style.scrollSnapType = 'none';
    track.style.cursor = 'grabbing';
    e.preventDefault();
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    track.scrollLeft = scrollStart - dx;
  });

  const endDrag = () => {
    if (!isDown) return;
    isDown = false;
    track.style.scrollSnapType = '';
    track.style.cursor = '';
  };

  track.addEventListener('mouseup', endDrag);
  track.addEventListener('mouseleave', endDrag);
}

function setupScrollSync(track, tablist, imageContainer) {
  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const panels = track.querySelectorAll('[role=tabpanel]');
      const scrollCenter = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      panels.forEach((panel, i) => {
        const center = panel.offsetLeft + panel.offsetWidth / 2;
        const dist = Math.abs(center - scrollCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      updateActiveTab(tablist, imageContainer, closest);
      ticking = false;
    });
  });
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-numbered-list';
  tablist.setAttribute('role', 'tablist');

  const imageContainer = document.createElement('div');
  imageContainer.className = 'tabs-numbered-images';

  const track = document.createElement('div');
  track.className = 'tabs-numbered-track';

  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-numbered-panel';
    tabpanel.id = `tabpanel-${id}`;
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
      scrollToPanel(track, i);
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

  // Move panels into scrollable track
  block.querySelectorAll('.tabs-numbered-panel').forEach((panel) => {
    track.append(panel);
  });

  // Assemble: images → tablist → track
  block.prepend(track);
  block.prepend(tablist);
  block.prepend(imageContainer);

  // Wire up drag and scroll sync
  setupDrag(track);
  setupScrollSync(track, tablist, imageContainer);
}
