/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-stats block
 *
 * Source: https://www.lumen.com/en-us/home.html
 * Base Block: cards
 *
 * Block Structure:
 * - Each row = one card with 2 columns: [image] | [content]
 *
 * Source HTML Pattern:
 * <div class="teasercontainer teaser">
 *   <div class="teaser-stat-tiles cmp-cards-container cmp-teaser">
 *     <div class="cmp-teaser__content">
 *       <h2 class="cmp-teaser__title">Real customer results</h2>
 *       <div class="cmp-teaser__description">...</div>
 *     </div>
 *     <div class="cards wrapper">
 *       <div class="card">
 *         <div class="cmp-teaser">
 *           <div class="cmp-teaser__content">
 *             <p class="cmp-teaser__pretitle">10x</p>
 *             <h2 class="cmp-teaser__title">Increased network capacity</h2>
 *             <div class="cmp-teaser__description"><p>...</p></div>
 *             <div class="cmp-teaser__action-container"><a>Read case study</a></div>
 *           </div>
 *           <div class="cmp-teaser__image"><img></div>
 *         </div>
 *       </div>
 *       ...more cards
 *     </div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-23
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract individual cards
  // VALIDATED: Found <div class="card"> elements inside <div class="cards wrapper"> (line 2316)
  const cards = element.querySelectorAll('.cards.wrapper > .card');

  cards.forEach((card) => {
    // Extract image from card
    // VALIDATED: Found <div class="cmp-teaser__image"><div class="cmp-image"><img> (line 2330)
    const img = card.querySelector('.cmp-teaser__image img, .cmp-image__image');

    // Build content cell
    const contentDiv = document.createElement('div');

    // Extract stat number (pretitle)
    // VALIDATED: Found <p class="cmp-teaser__pretitle">10x</p> (line 2319)
    const pretitle = card.querySelector('.cmp-teaser__pretitle');
    if (pretitle) contentDiv.append(pretitle);

    // Extract title
    // VALIDATED: Found <h2 class="cmp-teaser__title"> (line 2320)
    const title = card.querySelector('.cmp-teaser__title');
    if (title) contentDiv.append(title);

    // Extract description
    // VALIDATED: Found <div class="cmp-teaser__description"><p>...</p></div> (line 2323)
    const desc = card.querySelector('.cmp-teaser__description');
    if (desc) contentDiv.append(desc);

    // Extract CTA link
    // VALIDATED: Found <a class="cmp-teaser__action-link"> (line 2327)
    const cta = card.querySelector('.cmp-teaser__action-link');
    if (cta) contentDiv.append(cta);

    // Row: [image] | [content]
    if (img) {
      cells.push([img, contentDiv]);
    } else {
      cells.push([contentDiv]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Stats', cells });
  element.replaceWith(block);
}
