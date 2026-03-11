function parseRowContent(textCol) {
  // Content may be in a <p> or directly in the div
  const container = textCol.querySelector('p') || textCol;
  if (!container || !container.childNodes.length) return null;

  const nodes = [...container.childNodes];
  const textsBefore = [];
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
      if (!foundTitle && text.startsWith('##')) {
        titleText = text.replace(/^#+\s*/, '');
        foundTitle = true;
        return;
      }
      if (foundTitle) {
        descParts.push(text);
      } else {
        textsBefore.push(text);
      }
    }
  });

  return {
    textsBefore, strongs, titleText, descParts, ctaLink,
  };
}

function buildIndustryItem(data) {
  const item = document.createElement('div');
  item.classList.add('columns-industry-item');

  if (data.caseStudyLabel) {
    const label = document.createElement('div');
    label.classList.add('columns-industry-label');
    label.textContent = data.caseStudyLabel;
    item.append(label);
  }

  if (data.companyName) {
    const company = document.createElement('div');
    company.classList.add('columns-industry-company');
    company.textContent = data.companyName;
    item.append(company);
  }

  if (data.titleText) {
    const title = document.createElement('h3');
    title.classList.add('columns-industry-title');
    title.textContent = data.titleText;
    item.append(title);
  }

  if (data.descParts.length) {
    const desc = document.createElement('div');
    desc.classList.add('columns-industry-description');
    desc.textContent = data.descParts.join(' ');
    item.append(desc);
  }

  if (data.ctaLink) {
    const ctaContainer = document.createElement('div');
    ctaContainer.classList.add('columns-industry-cta');
    data.ctaLink.classList.add('columns-industry-cta-link');
    ctaContainer.append(data.ctaLink);
    item.append(ctaContainer);
  }

  return item;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // Parse all rows into industry data
  const industries = [];
  let eyebrowText = '';
  let picture = null;

  rows.forEach((row, i) => {
    const cols = [...row.children];
    const imgCol = cols.find((col) => col.querySelector('picture'));
    // Text column is always the last column (first col may be image or placeholder)
    const textCol = cols[cols.length - 1];

    // Extract image from first row that has one
    if (imgCol && !picture) {
      picture = imgCol.querySelector('picture');
    }

    const parsed = parseRowContent(textCol);
    if (!parsed) return;

    if (i === 0) {
      // First row: first text = eyebrow, second text = industry name
      eyebrowText = parsed.textsBefore[0] || '';
      const industryName = parsed.textsBefore[1] || parsed.titleText;
      industries.push({
        name: industryName,
        caseStudyLabel: parsed.strongs[0] || '',
        companyName: parsed.strongs[1] || '',
        titleText: parsed.titleText,
        descParts: parsed.descParts,
        ctaLink: parsed.ctaLink,
      });
    } else {
      // Subsequent rows: first text = industry name
      const industryName = parsed.textsBefore[0] || parsed.titleText;
      industries.push({
        name: industryName,
        caseStudyLabel: parsed.strongs[0] || '',
        companyName: parsed.strongs[1] || '',
        titleText: parsed.titleText,
        descParts: parsed.descParts,
        ctaLink: parsed.ctaLink,
      });
    }
  });

  if (!industries.length) return;

  // Build image section
  const imgSection = document.createElement('div');
  imgSection.classList.add('columns-industry-img-section');
  if (picture) imgSection.append(picture);

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
  selectedSpan.textContent = industries[0].name;
  dropdownHeader.append(selectedSpan);

  const arrow = document.createElement('span');
  arrow.classList.add('columns-industry-arrow');
  dropdownHeader.append(arrow);
  dropdown.append(dropdownHeader);

  // Dropdown list
  const dropdownList = document.createElement('div');
  dropdownList.classList.add('columns-industry-dropdown-list');
  dropdownList.hidden = true;

  industries.forEach((ind, idx) => {
    const option = document.createElement('div');
    option.classList.add('columns-industry-dropdown-option');
    if (idx === 0) option.classList.add('selected');
    option.textContent = ind.name;
    option.dataset.index = idx;
    dropdownList.append(option);
  });

  dropdown.append(dropdownList);
  contentSection.append(dropdown);

  // Build all industry items
  const itemsContainer = document.createElement('div');
  itemsContainer.classList.add('columns-industry-items');

  industries.forEach((ind, idx) => {
    const item = buildIndustryItem(ind);
    item.dataset.index = idx;
    if (idx !== 0) item.hidden = true;
    itemsContainer.append(item);
  });

  contentSection.append(itemsContainer);

  // Selection logic
  function selectIndustry(idx) {
    selectedSpan.textContent = industries[idx].name;
    dropdownHeader.setAttribute('aria-expanded', 'false');
    dropdownList.hidden = true;

    dropdownList.querySelectorAll('.columns-industry-dropdown-option').forEach((opt) => {
      opt.classList.toggle('selected', Number(opt.dataset.index) === idx);
    });

    itemsContainer.querySelectorAll('.columns-industry-item').forEach((item) => {
      item.hidden = Number(item.dataset.index) !== idx;
    });
  }

  // Toggle dropdown
  dropdownHeader.addEventListener('click', () => {
    const expanded = dropdownHeader.getAttribute('aria-expanded') === 'true';
    dropdownHeader.setAttribute('aria-expanded', String(!expanded));
    dropdownList.hidden = expanded;
  });

  // Option click
  dropdownList.addEventListener('click', (e) => {
    const option = e.target.closest('.columns-industry-dropdown-option');
    if (option) {
      selectIndustry(Number(option.dataset.index));
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdownHeader.setAttribute('aria-expanded', 'false');
      dropdownList.hidden = true;
    }
  });

  // Replace block content
  block.textContent = '';
  block.append(imgSection);
  block.append(contentSection);
}
