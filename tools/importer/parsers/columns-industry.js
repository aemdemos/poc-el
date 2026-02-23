/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-industry block
 *
 * Source: https://www.lumen.com/en-us/home.html
 * Base Block: columns
 *
 * Block Structure:
 * - Row 1: [image column] | [content column]
 *
 * Source HTML Pattern:
 * <div class="industrySelectorBlock">
 *   <div class="industry-selector-container">
 *     <div class="industry-selector-img-section">
 *       <div class="industry-selector-image"><picture><img></picture></div>
 *     </div>
 *     <div class="industry-selector-content-section">
 *       <div class="industry-selector-eybrow-text">Industries we serve</div>
 *       <div class="dropdown-container">...</div>
 *       <div class="industry-selector-item">
 *         <div class="industry-selector-text-section">
 *           <div class="industry-selector-industry-name">Case study</div>
 *           <div class="industry-selector-industry-location">Pac-12 Enterprises</div>
 *           <div class="industry-selector-title">Reinventing live sports</div>
 *           <div class="industry-selector-description">...</div>
 *           <div class="industry-selector-cta-containers"><a>Read more</a></div>
 *         </div>
 *       </div>
 *       ...more items
 *     </div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-23
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract image column
  // VALIDATED: Found <div class="industry-selector-image"><picture><img> (line 2549)
  const image = element.querySelector('.industry-selector-image img, .industry-selector-img-section img');

  // Build content column
  const contentDiv = document.createElement('div');

  // Extract eyebrow text
  // VALIDATED: Found <div class="industry-selector-eybrow-text">Industries we serve</div> (line 2559)
  const eyebrow = element.querySelector('.industry-selector-eybrow-text');
  if (eyebrow) contentDiv.append(eyebrow);

  // Extract dropdown options as a list
  // VALIDATED: Found <div class="dropdown-option"> elements (lines 2567-2578)
  const dropdownOptions = element.querySelectorAll('.dropdown-option');
  if (dropdownOptions.length > 0) {
    const ul = document.createElement('ul');
    dropdownOptions.forEach((option) => {
      const text = option.textContent.trim();
      if (text) {
        const li = document.createElement('li');
        li.textContent = text;
        ul.append(li);
      }
    });
    contentDiv.append(ul);
  }

  // Extract industry items (case studies)
  // VALIDATED: Found <div class="industry-selector-item"> with nested text sections (line 2581)
  const items = element.querySelectorAll('.industry-selector-item');
  items.forEach((item) => {
    const itemDiv = document.createElement('div');

    const name = item.querySelector('.industry-selector-industry-name');
    const location = item.querySelector('.industry-selector-industry-location');
    const title = item.querySelector('.industry-selector-title');
    const desc = item.querySelector('.industry-selector-description');
    const cta = item.querySelector('.industry-selector-cta-link1, .industry-selector-cta-containers a');

    if (name && name.textContent.trim()) itemDiv.append(name);
    if (location && location.textContent.trim()) itemDiv.append(location);
    if (title && title.textContent.trim()) itemDiv.append(title);
    if (desc && desc.textContent.trim()) itemDiv.append(desc);
    if (cta) itemDiv.append(cta);

    if (itemDiv.children.length > 0) {
      contentDiv.append(itemDiv);
    }
  });

  // Row: [image] | [content]
  if (image) {
    cells.push([image, contentDiv]);
  } else {
    cells.push([contentDiv]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Industry', cells });
  element.replaceWith(block);
}
