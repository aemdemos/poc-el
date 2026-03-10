import { getMetadata } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1200px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      closeMobileDrillDown(nav);
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches && e.relatedTarget) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function closeMobileDrillDown(navEl) {
  navEl.querySelectorAll('.mobile-slide-panel.active').forEach((panel) => {
    panel.classList.remove('active');
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, 'false');
  closeMobileDrillDown(nav);
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > :where(a,p)');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a[href]').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const placeholders = await fetchPlaceholders();
  const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/en-us/nav';
  let fragment = await loadFragment(navPath);

  // Dev override: always prefer local nav-dev.html over CDN nav (CDN may be stale)
  try {
    const devResp = await fetch('/blocks/header/nav-dev.html');
    if (devResp.ok) {
      const devFragment = document.createElement('main');
      devFragment.innerHTML = await devResp.text();
      // Wrap each top-level div as a section (mimic fragment loading)
      [...devFragment.querySelectorAll(':scope > div')].forEach((div) => {
        const section = document.createElement('div');
        section.classList.add('section');
        const wrapper = document.createElement('div');
        wrapper.classList.add('default-content-wrapper');
        while (div.firstChild) wrapper.append(div.firstChild);
        section.append(wrapper);
        div.replaceWith(section);
      });
      fragment = devFragment;
    }
  } catch (e) { /* use CDN fragment as-is */ }

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', (e) => {
        if (e.target.closest('.mobile-drilldown')) return;
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        } else {
          if (e.target.closest('a') && !navSection.classList.contains('nav-drop')) return;
          e.preventDefault();
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          closeMobileDrillDown(nav);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
      // Desktop: open on hover
      navSection.addEventListener('mouseenter', () => {
        if (isDesktop.matches) {
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', 'true');
        }
      });
      navSection.addEventListener('mouseleave', () => {
        if (isDesktop.matches) {
          navSection.setAttribute('aria-expanded', 'false');
        }
      });
    });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button').classList.remove('button');
    });

    // Build mobile drill-down panels for mega nav items
    function buildMobileDrillDown(navDrop, catGroups, parentLabel) {
      const drilldown = document.createElement('div');
      drilldown.className = 'mobile-drilldown';

      catGroups.forEach((cat, idx) => {
        // Category row with chevron
        const catItem = document.createElement('div');
        catItem.className = 'mobile-cat-item';
        catItem.dataset.index = idx;
        const catLabel = document.createElement('span');
        catLabel.textContent = cat.label;
        const catChevron = document.createElement('span');
        catChevron.className = 'mobile-cat-chevron';
        catChevron.textContent = '\u203A';
        catItem.append(catLabel, catChevron);
        drilldown.append(catItem);

        // Slide panel for this category
        const panel = document.createElement('div');
        panel.className = 'mobile-slide-panel';
        panel.dataset.index = idx;

        const backBtn = document.createElement('button');
        backBtn.className = 'mobile-back-btn';
        backBtn.textContent = `\u2039 Back to ${parentLabel}`;
        panel.append(backBtn);

        const heading = document.createElement('div');
        heading.className = 'mobile-panel-heading';
        heading.textContent = cat.label;
        panel.append(heading);

        const linksContainer = document.createElement('div');
        linksContainer.className = 'mobile-panel-links';

        cat.items.forEach((item) => {
          const a = document.createElement('a');
          a.href = item.href;
          a.textContent = item.text;
          linksContainer.append(a);
        });

        // Expandable sub-items (e.g., Public Sector)
        cat.expandables.forEach((exp) => {
          const expandable = document.createElement('div');
          expandable.className = 'mobile-expandable';

          const expHeader = document.createElement('div');
          expHeader.className = 'mobile-expandable-header';
          const expLabel = document.createElement('span');
          expLabel.textContent = exp.label;
          const expChevron = document.createElement('span');
          expChevron.textContent = '\u25BE';
          expHeader.append(expLabel, expChevron);
          expandable.append(expHeader);

          const children = document.createElement('div');
          children.className = 'mobile-expandable-children';
          exp.children.forEach((child) => {
            const a = document.createElement('a');
            a.href = child.href;
            a.textContent = child.text;
            children.append(a);
          });
          expandable.append(children);
          linksContainer.append(expandable);
        });

        panel.append(linksContainer);
        drilldown.append(panel);
      });

      // Event delegation
      drilldown.addEventListener('click', (e) => {
        const catItem = e.target.closest('.mobile-cat-item');
        if (catItem) {
          const idx2 = catItem.dataset.index;
          const panel2 = drilldown.querySelector(`.mobile-slide-panel[data-index="${idx2}"]`);
          if (panel2) panel2.classList.add('active');
          e.stopPropagation();
          return;
        }

        const backBtn2 = e.target.closest('.mobile-back-btn');
        if (backBtn2) {
          backBtn2.closest('.mobile-slide-panel').classList.remove('active');
          e.stopPropagation();
          return;
        }

        const expandHeader = e.target.closest('.mobile-expandable-header');
        if (expandHeader) {
          expandHeader.closest('.mobile-expandable').classList.toggle('expanded');
          e.stopPropagation();
        }
      });

      navDrop.append(drilldown);
    }

    // Build mega-menu from flat list with bold category markers authored in nav.md
    // Pattern: **Bold Text** = category separator, _Italic Text_ = expandable parent
    // Regular link items are grouped under the preceding category
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li.nav-drop').forEach((navDrop) => {
      const subUl = navDrop.querySelector(':scope > ul');
      if (!subUl) return;

      // Detect bold markers (<strong>) as category separators in the flat list
      const allItems = [...subUl.querySelectorAll(':scope > li')];
      const hasMarkers = allItems.some((li) => !li.querySelector('a') && li.querySelector('strong'));
      if (!hasMarkers) return;

      navDrop.classList.add('nav-mega');

      // Add inline chevron
      const dropIcon = document.createElement('span');
      dropIcon.className = 'nav-drop-icon';
      const textEl = navDrop.querySelector(':scope > p');
      if (textEl) {
        textEl.appendChild(dropIcon);
      } else {
        navDrop.insertBefore(dropIcon, navDrop.querySelector('ul'));
      }

      // Parse flat list into category groups using bold markers
      const catGroups = [];
      let currentGroup = null;
      let expandableCtx = null;

      allItems.forEach((li) => {
        const strong = li.querySelector('strong');
        const em = li.querySelector('em');
        const link = li.querySelector('a');

        // Bold text without link = category separator
        if (strong && !link && !em) {
          expandableCtx = null;
          currentGroup = { label: strong.textContent.trim(), items: [], expandables: [] };
          catGroups.push(currentGroup);
          return;
        }

        // Italic text without link = expandable parent (e.g., Public Sector)
        if (em && !link && !strong) {
          if (currentGroup) {
            expandableCtx = { label: em.textContent.trim(), children: [] };
            currentGroup.expandables.push(expandableCtx);
          }
          return;
        }

        // Link item — belongs to expandable context or current category
        if (link && currentGroup) {
          const item = { href: link.getAttribute('href') || link.href, text: link.textContent };
          if (expandableCtx) {
            expandableCtx.children.push(item);
          } else {
            currentGroup.items.push(item);
          }
        }
      });

      if (catGroups.length === 0) return;

      // Build two-panel mega-menu
      const megaMenu = document.createElement('div');
      megaMenu.className = 'mega-menu';

      const catPanel = document.createElement('div');
      catPanel.className = 'mega-menu-categories';

      const contentPanel = document.createElement('div');
      contentPanel.className = 'mega-menu-content';

      catGroups.forEach((cat, i) => {
        // Category label with chevron
        const catEl = document.createElement('div');
        catEl.className = `mega-menu-cat${i === 0 ? ' active' : ''}`;
        const catText = document.createElement('span');
        catText.textContent = cat.label;
        const chevron = document.createElement('span');
        chevron.className = 'mega-menu-chevron';
        catEl.append(catText, chevron);
        catEl.dataset.index = i;
        catPanel.append(catEl);

        // Content group
        const group = document.createElement('div');
        group.className = `mega-menu-group${i === 0 ? ' active' : ''}`;
        group.dataset.index = i;

        const heading = document.createElement('div');
        heading.className = 'mega-menu-heading';
        heading.textContent = cat.label;
        group.append(heading);

        const hasExpandable = cat.expandables.length > 0;
        const columnsWrapper = hasExpandable ? document.createElement('div') : null;
        if (columnsWrapper) columnsWrapper.className = 'mega-menu-columns';

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'mega-menu-items';

        // Regular link items
        cat.items.forEach((item) => {
          const itemEl = document.createElement('a');
          itemEl.href = item.href;
          itemEl.className = 'mega-menu-item';
          const title = document.createElement('span');
          title.className = 'mega-menu-item-title';
          title.textContent = item.text;
          itemEl.append(title);
          itemsContainer.append(itemEl);
        });

        // Expandable items (e.g., Public Sector with sub-children)
        let subpanel = null;
        cat.expandables.forEach((exp, j) => {
          const expandableEl = document.createElement('div');
          expandableEl.className = 'mega-menu-item-expandable';
          expandableEl.tabIndex = 0;
          expandableEl.setAttribute('role', 'button');
          expandableEl.setAttribute('aria-expanded', 'false');
          const title = document.createElement('span');
          title.className = 'mega-menu-item-title';
          title.textContent = exp.label;
          const chevronEl = document.createElement('span');
          chevronEl.className = 'mega-menu-item-chevron';
          chevronEl.setAttribute('aria-hidden', 'true');
          expandableEl.append(title, chevronEl);

          if (!subpanel) {
            subpanel = document.createElement('div');
            subpanel.className = 'mega-menu-subpanel';
          }
          subpanel.innerHTML = '';
          const subItems = document.createElement('div');
          subItems.className = 'mega-menu-items';
          exp.children.forEach((child) => {
            const childLink = document.createElement('a');
            childLink.href = child.href;
            childLink.className = 'mega-menu-item';
            const childTitle = document.createElement('span');
            childTitle.className = 'mega-menu-item-title';
            childTitle.textContent = child.text;
            childLink.append(childTitle);
            subItems.append(childLink);
          });
          subpanel.append(subItems);
          subpanel.id = `subpanel-${i}-${j}`;

          const showSubpanel = () => {
            itemsContainer.querySelectorAll('.mega-menu-item-expandable').forEach((e) => {
              e.classList.remove('active');
              e.setAttribute('aria-expanded', 'false');
            });
            if (subpanel) subpanel.classList.remove('active');
            expandableEl.classList.add('active');
            expandableEl.setAttribute('aria-expanded', 'true');
            if (subpanel) subpanel.classList.add('active');
          };
          expandableEl.addEventListener('mouseenter', showSubpanel);
          expandableEl.addEventListener('focus', showSubpanel);
          subpanel?.addEventListener('mouseenter', showSubpanel);
          itemsContainer.append(expandableEl);
        });

        if (hasExpandable && columnsWrapper && subpanel) {
          columnsWrapper.append(itemsContainer, subpanel);
          columnsWrapper.addEventListener('mouseleave', () => {
            itemsContainer.querySelectorAll('.mega-menu-item-expandable').forEach((e) => {
              e.classList.remove('active');
              e.setAttribute('aria-expanded', 'false');
            });
            if (subpanel) subpanel.classList.remove('active');
          });
          group.append(columnsWrapper);
        } else {
          group.append(itemsContainer);
        }
        contentPanel.append(group);
      });

      megaMenu.append(catPanel, contentPanel);
      navDrop.append(megaMenu);

      // Prevent clicks inside mega-menu from closing dropdown
      megaMenu.addEventListener('click', (e) => e.stopPropagation());

      // Category hover switching
      catPanel.addEventListener('mouseover', (e) => {
        const catEl = e.target.closest('.mega-menu-cat');
        if (!catEl) return;
        catPanel.querySelectorAll('.mega-menu-cat').forEach((c) => c.classList.remove('active'));
        contentPanel.querySelectorAll('.mega-menu-group').forEach((g) => g.classList.remove('active'));
        catEl.classList.add('active');
        const g = contentPanel.querySelector(`.mega-menu-group[data-index="${catEl.dataset.index}"]`);
        if (g) g.classList.add('active');
      });

      // Build mobile drill-down for this nav item
      const parentLabel = navDrop.querySelector(':scope > p')?.textContent?.trim() || '';
      buildMobileDrillDown(navDrop, catGroups, parentLabel);
    });

    // Close mega-menus when clicking outside on desktop
    document.addEventListener('click', (e) => {
      if (isDesktop.matches && !e.target.closest('.nav-sections')) {
        toggleAllNavSections(navSections);
      }
    });
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const search = navTools.querySelector('a[href*="search"]');
    if (search) search.closest('li')?.remove();
    const signIn = navTools.querySelector('a[href*="login"]');
    if (signIn) signIn.closest('li')?.classList.add('nav-tools-signin');

    // Clone non-signin tools (Support, Contact Us) for desktop row 2
    const navToolsBottom = document.createElement('div');
    navToolsBottom.className = 'nav-tools-bottom';
    const bottomUl = document.createElement('ul');
    navTools.querySelectorAll('ul > li:not(.nav-tools-signin)').forEach((li) => {
      bottomUl.append(li.cloneNode(true));
    });
    navToolsBottom.append(bottomUl);
    nav.append(navToolsBottom);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);

  // search icon for mobile
  const searchIcon = document.createElement('div');
  searchIcon.classList.add('nav-search');
  searchIcon.innerHTML = `<button type="button" aria-label="Search">
      <span class="nav-search-icon"></span>
    </button>`;
  nav.append(searchIcon);

  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }

  // hide header on scroll-down, show on scroll-up
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      navWrapper.classList.add('nav-hidden');
    } else {
      navWrapper.classList.remove('nav-hidden');
    }
    lastScrollY = currentScrollY;
  });
}
