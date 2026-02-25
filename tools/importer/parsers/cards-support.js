/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-support block
 *
 * Source: https://www.lumen.com/en-us/home.html
 * Base Block: cards
 *
 * Block Structure:
 * - Each row = one card with 2 columns: [image/icon] | [content]
 *
 * Source HTML Pattern:
 * <div class="teasercontainer teaser">
 *   <div class="teaser-with-cards cmp-cards-container cmp-teaser">
 *     <div class="cmp-teaser__content">
 *       <h2 class="cmp-teaser__title">Lumen is where support meets solutions</h2>
 *       <div class="cmp-teaser__description"><p>...</p></div>
 *     </div>
 *     <div class="cmp-teaser__image"><img></div>
 *     <div class="cards wrapper">
 *       <div class="card">
 *         <div class="cmp-teaser">
 *           <div class="cmp-teaser__content">
 *             <h2 class="cmp-teaser__title">Explore APIs</h2>
 *             <div class="cmp-teaser__description"><p>...</p></div>
 *             <div class="cmp-teaser__action-container"><a>Read more</a></div>
 *           </div>
 *           <div class="cmp-teaser__image"><img alt="Icon 1"></div>
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
  // VALIDATED: Found <div class="card"> inside <div class="cards wrapper"> (line 3068)
  const cards = element.querySelectorAll('.cards.wrapper > .card');

  cards.forEach((card) => {
    // Extract icon image
    // VALIDATED: Found <div class="cmp-teaser__image"><div class="cmp-image"><img alt="Icon 1"> (line 3082)
    const img = card.querySelector('.cmp-teaser__image img, .cmp-image__image');

    // Build content cell
    const contentDiv = document.createElement('div');

    // Extract title
    // VALIDATED: Found <h2 class="cmp-teaser__title">Explore APIs</h2> (line 3072)
    const title = card.querySelector('.cmp-teaser__title');
    if (title) contentDiv.append(title);

    // Extract description
    // VALIDATED: Found <div class="cmp-teaser__description"><p>...</p></div> (line 3074)
    const desc = card.querySelector('.cmp-teaser__description');
    if (desc) contentDiv.append(desc);

    // Extract CTA
    // VALIDATED: Found <a class="cmp-teaser__action-link">Read more</a> (line 3078)
    const cta = card.querySelector('.cmp-teaser__action-link');
    if (cta) contentDiv.append(cta);

    // Row: [image/icon] | [content]
    if (img) {
      cells.push([img, contentDiv]);
    } else {
      cells.push([contentDiv]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Support', cells });
  element.replaceWith(block);
}
