export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cols = [...row.children];
  const imgCol = cols.find((col) => col.querySelector('picture'));
  const textCol = cols.find((col) => !col.querySelector('picture'));
  if (!imgCol || !textCol) return;

  // Build image section
  const imgSection = document.createElement('div');
  imgSection.classList.add('columns-industry-img-section');
  const pic = imgCol.querySelector('picture');
  if (pic) imgSection.append(pic);

  // Parse text content from the paragraph
  const p = textCol.querySelector('p');
  if (!p) return;

  const nodes = [...p.childNodes];
  let eyebrowText = '';
  const strongs = [];
  let titleText = '';
  const descParts = [];
  let ctaLink = null;
  let foundTitle = false;

  nodes.forEach((node) => {
    if (node.nodeName === 'BR') return;
    if (node.nodeName === 'A') {
      ctaLink = node.cloneNode(true);
      return;
    }
    if (node.nodeName === 'STRONG') {
      strongs.push(node.textContent.trim());
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (!text) return;
      if (!eyebrowText) {
        eyebrowText = text;
        return;
      }
      if (!foundTitle && text.startsWith('##')) {
        titleText = text.replace(/^#+\s*/, '');
        foundTitle = true;
        return;
      }
      if (foundTitle) {
        descParts.push(text);
      }
    }
  });

  const caseStudyLabel = strongs[0] || '';
  const companyName = strongs[1] || '';

  // Build content section
  const contentSection = document.createElement('div');
  contentSection.classList.add('columns-industry-content-section');

  // Eyebrow
  if (eyebrowText) {
    const eyebrow = document.createElement('div');
    eyebrow.classList.add('columns-industry-eyebrow');
    eyebrow.textContent = eyebrowText;
    contentSection.append(eyebrow);
  }

  // Dropdown
  const dropdown = document.createElement('div');
  dropdown.classList.add('columns-industry-dropdown');

  const dropdownHeader = document.createElement('button');
  dropdownHeader.classList.add('columns-industry-dropdown-header');
  dropdownHeader.setAttribute('aria-expanded', 'false');

  const selectedSpan = document.createElement('span');
  selectedSpan.classList.add('columns-industry-selected');
  selectedSpan.textContent = companyName || titleText;
  dropdownHeader.append(selectedSpan);

  const arrow = document.createElement('span');
  arrow.classList.add('columns-industry-arrow');
  dropdownHeader.append(arrow);

  dropdown.append(dropdownHeader);

  // Dropdown list (single option for now, extensible for multiple rows)
  const dropdownList = document.createElement('div');
  dropdownList.classList.add('columns-industry-dropdown-list');
  dropdownList.hidden = true;

  const option = document.createElement('div');
  option.classList.add('columns-industry-dropdown-option', 'selected');
  option.textContent = companyName || titleText;
  dropdownList.append(option);

  dropdown.append(dropdownList);
  contentSection.append(dropdown);

  // Toggle dropdown
  dropdownHeader.addEventListener('click', () => {
    const expanded = dropdownHeader.getAttribute('aria-expanded') === 'true';
    dropdownHeader.setAttribute('aria-expanded', String(!expanded));
    dropdownList.hidden = expanded;
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdownHeader.setAttribute('aria-expanded', 'false');
      dropdownList.hidden = true;
    }
  });

  // Case study item
  const item = document.createElement('div');
  item.classList.add('columns-industry-item');

  if (caseStudyLabel) {
    const label = document.createElement('div');
    label.classList.add('columns-industry-label');
    label.textContent = caseStudyLabel;
    item.append(label);
  }

  if (companyName) {
    const company = document.createElement('div');
    company.classList.add('columns-industry-company');
    company.textContent = companyName;
    item.append(company);
  }

  if (titleText) {
    const title = document.createElement('h3');
    title.classList.add('columns-industry-title');
    title.textContent = titleText;
    item.append(title);
  }

  if (descParts.length) {
    const desc = document.createElement('div');
    desc.classList.add('columns-industry-description');
    desc.textContent = descParts.join(' ');
    item.append(desc);
  }

  if (ctaLink) {
    const ctaContainer = document.createElement('div');
    ctaContainer.classList.add('columns-industry-cta');
    ctaLink.classList.add('columns-industry-cta-link');
    ctaContainer.append(ctaLink);
    item.append(ctaContainer);
  }

  contentSection.append(item);

  // Replace block content
  block.textContent = '';
  block.append(imgSection);
  block.append(contentSection);
}
