import { moveInstrumentation } from '../../scripts/scripts.js';

let tabBlockCnt = 0;

// Tab intro text: maps tab names to intro paragraphs shown above accordions
const TAB_INTRO_TEXT = {
  Savvis: 'Savvis Service Guides (End of Sale)',
  'Time Warner': 'Time Warner',
};

// Accordion icon lookup: maps title keywords to icon SVGs
const ACCORDION_ICONS = {
  'doing-business': ['Agreements', 'Colocation', 'Network'],
  'governance-documentation': ['Service Level Agreements', 'Digital Content'],
};

function getAccordionIcon(title) {
  const match = Object.entries(ACCORDION_ICONS)
    .find(([, keywords]) => keywords.some((kw) => title.startsWith(kw)));
  if (match) {
    const img = document.createElement('img');
    img.src = `/icons/${match[0]}.svg`;
    img.setAttribute('aria-hidden', 'true');
    return img;
  }
  return null;
}

export default function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-wa-list';
  tablist.setAttribute('role', 'tablist');
  tabBlockCnt += 1;

  const rows = [...block.children];

  // Group rows into tabs: each row whose first cell has class "tab-label"
  // or the first cell content is a tab heading (non-accordion row after a tab-label)
  // Structure: each child row is either a "tab" row (tab-name | tab-content)
  // The tab-content cell contains HTML with optional accordion markup.
  // Rows are paired: odd = tab label, even = tab content
  // Actually for EDS: each row represents a tab. Col1 = tab label, Col2 = tab content.

  rows.forEach((row, i) => {
    const label = row.children[0];
    const content = row.children[1];
    if (!label || !content) return;

    const id = `tabs-wa-${tabBlockCnt}-${i}`;

    // Create tab button
    const button = document.createElement('button');
    button.className = 'tabs-wa-tab';
    button.id = `tab-${id}`;
    button.innerHTML = label.textContent.trim();
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    // Create tab panel
    const panel = document.createElement('div');
    panel.className = 'tabs-wa-panel';
    panel.id = id;
    panel.setAttribute('aria-hidden', !!i);
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.setAttribute('role', 'tabpanel');
    moveInstrumentation(row, panel);

    // Process content: look for accordion markers (details/summary already in HTML
    // or div separators for accordion items)
    // The content cell has the full HTML of the tab panel.
    // We need to find sub-blocks that are accordions within it.
    // Convention: accordion items are marked with <h3> headings as accordion titles
    // and the content after each <h3> until the next <h3> is the accordion body.
    // Check if content has accordion structure (h3 elements used as accordion headers)
    const hasAccordions = content.querySelector('h3');

    if (hasAccordions) {
      // Split content into intro (before first h3) and accordion items
      const intro = document.createElement('div');
      intro.className = 'tabs-wa-intro';
      let currentAccTitle = null;
      let currentAccIcon = null;
      let currentAccBody = null;
      const accordionContainer = document.createElement('div');
      accordionContainer.className = 'tabs-wa-accordions';

      [...content.children].forEach((child) => {
        if (child.tagName === 'H3') {
          // Finish previous accordion item
          if (currentAccTitle) {
            const details = document.createElement('details');
            details.className = 'tabs-wa-accordion-item';
            const summary = document.createElement('summary');
            summary.className = 'tabs-wa-accordion-label';
            if (currentAccIcon) {
              currentAccIcon.className = 'tabs-wa-accordion-icon';
              summary.append(currentAccIcon);
            }
            const titleSpan = document.createElement('span');
            titleSpan.className = 'tabs-wa-accordion-title';
            titleSpan.textContent = currentAccTitle;
            summary.append(titleSpan);

            // Add chevron
            const chevron = document.createElement('span');
            chevron.className = 'tabs-wa-chevron';
            summary.append(chevron);

            currentAccBody.className = 'tabs-wa-accordion-body';
            details.append(summary, currentAccBody);
            accordionContainer.append(details);
          }
          currentAccTitle = child.textContent.trim();
          currentAccIcon = getAccordionIcon(currentAccTitle);
          currentAccBody = document.createElement('div');
        } else if (currentAccTitle) {
          currentAccBody.append(child);
        } else {
          intro.append(child);
        }
      });

      // Finish last accordion item
      if (currentAccTitle) {
        const details = document.createElement('details');
        details.className = 'tabs-wa-accordion-item';
        const summary = document.createElement('summary');
        summary.className = 'tabs-wa-accordion-label';
        if (currentAccIcon) {
          currentAccIcon.className = 'tabs-wa-accordion-icon';
          summary.append(currentAccIcon);
        }
        const titleSpan = document.createElement('span');
        titleSpan.className = 'tabs-wa-accordion-title';
        titleSpan.textContent = currentAccTitle;
        summary.append(titleSpan);
        const chevron = document.createElement('span');
        chevron.className = 'tabs-wa-chevron';
        summary.append(chevron);
        currentAccBody.className = 'tabs-wa-accordion-body';
        details.append(summary, currentAccBody);
        accordionContainer.append(details);
      }

      // Inject intro text from mapping if no intro content from HTML
      const tabName = label.textContent.trim();
      if (intro.childNodes.length === 0 && TAB_INTRO_TEXT[tabName]) {
        const p = document.createElement('p');
        p.textContent = TAB_INTRO_TEXT[tabName];
        intro.append(p);
      }
      if (intro.childNodes.length > 0) panel.append(intro);
      panel.append(accordionContainer);
    } else {
      // Plain content - just move it in
      content.className = 'tabs-wa-content';
      panel.append(content);
    }

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((p) => {
        p.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      panel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });

    tablist.append(button);
    row.replaceWith(panel);
  });

  block.prepend(tablist);
}
