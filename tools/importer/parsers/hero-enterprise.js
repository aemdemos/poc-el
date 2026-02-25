/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-enterprise block
 *
 * Source: https://www.lumen.com/en-us/home.html
 * Base Block: hero
 *
 * Block Structure (from markdown example):
 * - Row 1: Background image
 * - Row 2: Content (heading, description)
 *
 * Source HTML Pattern:
 * <div class="herobanner teaser">
 *   <div class="cmp-teaser">
 *     <div class="cmp-teaser__content">
 *       <h1 class="cmp-teaser__title">...</h1>
 *       <div class="cmp-teaser__description"><p>...</p></div>
 *     </div>
 *     <div class="cmp-teaser__image"><picture>...<img>...</picture></div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-23
 */
export default function parse(element, { document }) {
  // Extract heading
  // VALIDATED: Found <h1 class="cmp-teaser__title"> in source HTML (line 2288)
  const heading = element.querySelector('.cmp-teaser__title') ||
                  element.querySelector('h1, h2');

  // Extract description
  // VALIDATED: Found <div class="cmp-teaser__description"><p>...</p></div> (line 2291)
  const description = element.querySelector('.cmp-teaser__description') ||
                      element.querySelector('p');

  // Extract background image
  // VALIDATED: Found <div class="cmp-teaser__image"><picture>...<img></picture></div> (line 2297)
  const bgImage = element.querySelector('.cmp-teaser__image img') ||
                  element.querySelector('picture img');

  // Build cells array matching hero block structure
  const cells = [];

  // Row 1: Background image (if present)
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: Content (heading + description combined in single cell)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);

  // Extract CTAs if present
  // VALIDATED: Found <div class="cmp-teaser__action-container"> (line 2294, empty on this page)
  const ctas = Array.from(element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'));
  contentCell.push(...ctas);

  cells.push(contentCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero-Enterprise', cells });
  element.replaceWith(block);
}
