/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-industry block
 *
 * Source: https://www.lumen.com/en-us/home.html
 * Base Block: cards
 *
 * Block Structure:
 * - Each row = one card with 2 columns: [image] | [content]
 *
 * Source HTML Pattern:
 * <div class="teasercontainer teaser">
 *   <div class="teaser-staggered-cards cmp-cards-container cmp-teaser">
 *     <div class="cmp-teaser__content"></div>
 *     <div class="cmp-teaser__image"><a><img></a></div>
 *     <div class="cards wrapper">
 *       <div class="card">
 *         <div class="cmp-teaser">
 *           <div class="cmp-teaser__content">
 *             <h2 class="cmp-teaser__title">Retail</h2>
 *             <div class="cmp-teaser__description"><p>...</p></div>
 *             <div class="cmp-teaser__action-container"><a>Learn more</a></div>
 *           </div>
 *           <div class="cmp-teaser__image"><img></div>
 *         </div>
 *       </div>
 *       ...more cards (first card is intro with no image/CTA)
 *     </div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-23
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract individual cards
  // VALIDATED: Found <div class="card"> inside <div class="cards wrapper"> (line 2974)
  const cards = element.querySelectorAll('.cards.wrapper > .card');

  cards.forEach((card) => {
    // Extract image
    // VALIDATED: Found <div class="cmp-teaser__image"><div class="cmp-image"><img> (line 2999)
    const img = card.querySelector('.cmp-teaser__image img, .cmp-image__image');

    // Build content cell
    const contentDiv = document.createElement('div');

    // Extract title
    // VALIDATED: Found <h2 class="cmp-teaser__title">Retail</h2> (line 2990)
    const title = card.querySelector('.cmp-teaser__title');
    if (title) contentDiv.append(title);

    // Extract description
    // VALIDATED: Found <div class="cmp-teaser__description"><p>...</p></div> (line 2992)
    const desc = card.querySelector('.cmp-teaser__description');
    if (desc) contentDiv.append(desc);

    // Extract CTA (some cards like intro may not have CTAs)
    // VALIDATED: Found <a class="cmp-teaser__action-link">Learn more</a> (line 2996)
    const cta = card.querySelector('.cmp-teaser__action-link');
    if (cta) contentDiv.append(cta);

    // Row: [image] | [content]
    if (img) {
      cells.push([img, contentDiv]);
    } else {
      cells.push([contentDiv]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Industry', cells });
  element.replaceWith(block);
}
