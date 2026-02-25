/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-numbered block
 *
 * Source: https://www.lumen.com/en-us/home.html
 * Base Block: tabs
 *
 * Block Structure:
 * - Each row = one tab with 2 columns: [tab label] | [tab content]
 *
 * Source HTML Pattern:
 * <div class="stackedContent">
 *   <section class="lumen-tabs is-desktop">
 *     <div class="lumen-tabs__inner">
 *       <div class="lumen-tabs__viewport">
 *         <div class="lumen-tabs__track">
 *           <article class="lumen-tabs__panel">
 *             <div class="lumen-tabs__panelGrid">
 *               <div class="lumen-tabs__media"><div class="lumen-tabs__imageWrap"><img></div></div>
 *               <div class="lumen-tabs__nav">...tab buttons...</div>
 *               <div class="lumen-tabs__content">
 *                 <h2 class="lumen-tabs__title">...</h2>
 *                 <div class="lumen-tabs__desc"><p>...</p></div>
 *                 <a class="lumen-tabs__cta">Read more</a>
 *               </div>
 *             </div>
 *           </article>
 *           ...more articles
 *         </div>
 *       </div>
 *     </div>
 *   </section>
 * </div>
 *
 * Generated: 2026-02-23
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract tab panels (articles)
  // VALIDATED: Found <article class="lumen-tabs__panel"> (lines 2413, 2452, 2491)
  const panels = element.querySelectorAll('.lumen-tabs__panel, article[class*="lumen-tabs__panel"]');

  panels.forEach((panel, index) => {
    // Tab label: numbered (01, 02, 03)
    const tabLabel = document.createElement('p');
    tabLabel.textContent = String(index + 1).padStart(2, '0');

    // Build content cell
    const contentDiv = document.createElement('div');

    // Extract image
    // VALIDATED: Found <div class="lumen-tabs__imageWrap"><img> (line 2417)
    const img = panel.querySelector('.lumen-tabs__imageWrap img, .lumen-tabs__media img');
    if (img) contentDiv.append(img);

    // Extract title
    // VALIDATED: Found <h2 class="lumen-tabs__title"> (line 2441)
    const title = panel.querySelector('.lumen-tabs__title');
    if (title) contentDiv.append(title);

    // Extract description
    // VALIDATED: Found <div class="lumen-tabs__desc"><p>...</p></div> (line 2443)
    const desc = panel.querySelector('.lumen-tabs__desc');
    if (desc) contentDiv.append(desc);

    // Extract CTA
    // VALIDATED: Found <a class="lumen-tabs__cta"> (line 2446)
    const cta = panel.querySelector('.lumen-tabs__cta, a[class*="lumen-tabs__cta"]');
    if (cta) contentDiv.append(cta);

    // Row: [tab label] | [tab content]
    cells.push([tabLabel, contentDiv]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Tabs-Numbered', cells });
  element.replaceWith(block);
}
