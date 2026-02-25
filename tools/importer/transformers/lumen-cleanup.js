/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Lumen website cleanup
 * Purpose: Remove non-content elements, navigation, footer, modals, and site-wide widgets
 * Applies to: www.lumen.com (all templates)
 * Tested: /en-us/home.html
 * Generated: 2026-02-23
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow (cleaned.html)
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove navigation experience fragment
    // EXTRACTED: Found <div class="cmp-experiencefragment cmp-experiencefragment--enterprise-navigation">
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--enterprise-navigation',
    ]);

    // Remove page loader
    // EXTRACTED: Found <div class="loaderbox hide">
    WebImporter.DOMUtils.remove(element, ['.loaderbox']);

    // Remove warning/error notification divs
    // EXTRACTED: Found <div class="chi notification-background warningDiv hide">
    WebImporter.DOMUtils.remove(element, ['.warningDiv']);

    // Remove IE popup
    // EXTRACTED: Found <div class="ie-popup">
    WebImporter.DOMUtils.remove(element, ['.ie-popup']);

    // Remove sign-in modals and session popups
    // EXTRACTED: Found <div class="singlesignin-v2"> with nested modal backdrops
    WebImporter.DOMUtils.remove(element, ['.singlesignin-v2']);

    // Remove header element
    // EXTRACTED: Found <header class="header header-v2">
    WebImporter.DOMUtils.remove(element, ['header.header.header-v2']);

    // Remove sticky navigation wrapper
    // EXTRACTED: Found <div class="cmp-sticky-container">
    WebImporter.DOMUtils.remove(element, ['.cmp-sticky-container']);

    // Remove env run mode setting
    // EXTRACTED: Found <div id="env-run-mode-setting">
    WebImporter.DOMUtils.remove(element, ['#env-run-mode-setting']);

    // Remove mobile carousel dots (non-content UI elements)
    // EXTRACTED: Found <div class="carousel-dots"> in multiple teasercontainer blocks
    WebImporter.DOMUtils.remove(element, ['.carousel-dots']);

    // Remove tab dots (non-content navigation UI)
    // EXTRACTED: Found <div class="lumen-tabs__dots"> with dot buttons
    WebImporter.DOMUtils.remove(element, ['.lumen-tabs__dots']);

    // Re-enable scrolling if hidden
    if (element.style && element.style.overflow === 'hidden') {
      element.setAttribute('style', 'overflow: scroll;');
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove footer experience fragment
    // EXTRACTED: Found <footer class="experiencefragment"> with cmp-experiencefragment--enterprise-portfolio-footer
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--enterprise-portfolio-footer',
      'footer.experiencefragment',
    ]);

    // Remove spacer elements (non-content layout elements)
    // EXTRACTED: Found <div class="spacer cmp-spacer--d-80"> and <div class="cmp-spacer">
    WebImporter.DOMUtils.remove(element, ['.cmp-spacer', '.spacer']);

    // Remove CQ placeholders (AEM authoring artifacts)
    // EXTRACTED: Found <div class="cq-placeholder">
    WebImporter.DOMUtils.remove(element, ['.cq-placeholder']);

    // Remove remaining unwanted HTML elements
    WebImporter.DOMUtils.remove(element, [
      'source',
      'iframe',
      'link',
      'noscript',
    ]);

    // Clean up tracking attributes
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-data-layer-enabled');
    });
  }
}
