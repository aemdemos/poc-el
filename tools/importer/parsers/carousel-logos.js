/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-logos block
 *
 * Source: https://www.lumen.com/en-us/home.html
 * Base Block: carousel
 *
 * Block Structure:
 * - Each row = one logo image with 2 columns: [image] | [empty/label]
 *
 * Source HTML Pattern:
 * <div class="partnerstory">
 *   <div class="partner-story-heading">We serve the top enterprises in the world</div>
 *   <div>
 *     <div class="carousel-group">
 *       <div><img src="./images/..." alt="Image"></div>
 *       <div><img src="./images/..." alt="Image"></div>
 *       ...
 *     </div>
 *     <div class="carousel-group">
 *       <!-- duplicated set of images for infinite scroll -->
 *     </div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-23
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract only the FIRST carousel-group to avoid duplicates
  // VALIDATED: Found <div class="carousel-group"> with logo images (line 2841)
  // The second carousel-group is a duplicate for infinite scroll animation (line 2901)
  const firstGroup = element.querySelector('.carousel-group');

  if (firstGroup) {
    const logoImages = firstGroup.querySelectorAll(':scope > div > img, :scope > div img');

    logoImages.forEach((img) => {
      // Row: [image] | [empty cell for carousel structure]
      cells.push([img]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel-Logos', cells });
  element.replaceWith(block);
}
