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
  const fragment = await loadFragment(navPath);

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
      navSection.addEventListener('click', () => {
        const expanded = navSection.getAttribute('aria-expanded') === 'true';
        if (isDesktop.matches) {
          toggleAllNavSections(navSections);
        }
        navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button').classList.remove('button');
    });

    // Mega-menu: category groupings by URL pattern with fallback items
    // Fallback items ensure all nav links render even if the pipeline drops some
    const megaMenuConfig = {
      Solutions: [
        {
          label: 'By Business Outcome',
          match: (h) => h.includes('/solutions/use-case/') && !['artificial-intelligence', 'cloud-connectivity', 'network-on-demand'].some((s) => h.includes(s)),
          expected: [
            { text: 'Reliable & Secure Connectivity', href: '/en-us/solutions/use-case/reliable-secure-connectivity' },
            { text: 'Secure Customer Experience & Connectivity', href: '/en-us/solutions/use-case/secure-reliable-connectivity-for-business-continuity' },
            { text: 'Flexible Networking for Secure Access', href: '/en-us/solutions/use-case/flexible-networking-for-secure-access' },
          ],
        },
        {
          label: 'By Industry',
          match: (h) => h.includes('/industries/'),
          expected: [
            { text: 'Energy', href: '/en-us/industries/energy-utilities' },
            { text: 'Financial Services', href: '/en-us/industries/financial-services' },
            { text: 'Gaming Network', href: '/en-us/industries/gaming-network' },
            { text: 'Healthcare', href: '/en-us/industries/healthcare' },
            { text: 'Manufacturing', href: '/en-us/industries/manufacturing' },
            { text: 'Media & Entertainment', href: '/en-us/industries/media-entertainment' },
            { text: 'Pharmaceuticals', href: '/en-us/industries/pharmaceuticals' },
            { text: 'Retail', href: '/en-us/industries/retail' },
            { text: 'Technology', href: '/en-us/industries/technology' },
          ],
        },
        {
          label: 'By Business Type',
          match: (h) => h.includes('/solutions/business-size/') || h.includes('/public-sector'),
          expected: [
            { text: 'Enterprise Business', href: '/en-us/solutions/business-size/large-enterprise' },
            { text: 'Midsize Business', href: '/en-us/solutions/business-size/midsize' },
            { text: 'Public Sector', href: '/en-us/public-sector' },
            { text: 'Wholesale', href: '/en-us/solutions/business-size/wholesale' },
          ],
        },
        {
          label: 'By Technical Use Case',
          match: (h) => ['artificial-intelligence', 'cloud-connectivity', 'network-on-demand'].some((s) => h.includes(s)),
          expected: [
            { text: 'AI', href: '/en-us/solutions/use-case/artificial-intelligence' },
            { text: 'Cloud Connectivity', href: '/en-us/solutions/use-case/cloud-connectivity' },
            { text: 'Network-as-a-Service', href: '/en-us/solutions/use-case/network-on-demand' },
          ],
        },
      ],
      Services: [
        {
          label: 'Infrastructure',
          match: (h) => ['wavelengths', 'colocation', 'dark-fiber', 'enterprise-broadband'].some((s) => h.includes(s)),
          expected: [
            { text: 'Wavelengths', href: '/en-us/services/wavelengths' },
            { text: 'Colocation', href: '/en-us/services/colocation' },
            { text: 'Dark Fiber', href: '/en-us/services/dark-fiber' },
            { text: 'Enterprise Broadband', href: '/en-us/services/enterprise-broadband' },
          ],
        },
        {
          label: 'Connectivity',
          match: (h) => ['ethernet', 'ip-vpn', 'multi-cloud-gateway', 'sd-wan'].some((s) => h.includes(s)),
          expected: [
            { text: 'Ethernet', href: '/en-us/services/ethernet' },
            { text: 'IP VPN', href: '/en-us/services/ip-vpn' },
            { text: 'Multi-Cloud Gateway', href: '/en-us/services/multi-cloud-gateway' },
            { text: 'SD-WAN', href: '/en-us/services/sd-wan' },
          ],
        },
        {
          label: 'Security',
          match: (h) => ['ddos', 'sase'].some((s) => h.includes(s)),
          expected: [
            { text: 'DDoS', href: '/en-us/services/ddos' },
            { text: 'SASE', href: '/en-us/services/sase' },
          ],
        },
        {
          label: 'Communication',
          match: (h) => ['cloud-voice', 'ucc', 'contact-center'].some((s) => h.includes(s)),
          expected: [
            { text: 'Cloud Voice', href: '/en-us/services/lumen-cloud-voice' },
            { text: 'UC&C', href: '/en-us/services/ucc' },
            { text: 'Contact Center', href: '/en-us/services/contact-center' },
          ],
        },
      ],
      Partners: [
        {
          label: 'Connected Ecosystem',
          match: (h) => h.includes('/partner/'),
          expected: [
            { text: 'Strategic Technology Partners', href: '/en-us/partner/strategic-technology-partners' },
            { text: 'Lumen Validated Designs', href: '/en-us/partner/validated-designs' },
          ],
        },
        {
          label: 'By Technology Partner',
          match: (h) => h.includes('/alliances/'),
          expected: [
            { text: 'Amazon Web Services', href: '/en-us/alliances/aws' },
            { text: 'Cisco', href: '/en-us/alliances/cisco' },
            { text: 'Google Cloud', href: '/en-us/alliances/google-cloud' },
            { text: 'Microsoft', href: '/en-us/alliances/microsoft' },
          ],
        },
      ],
      Resources: [
        {
          label: 'Why Lumen',
          match: (h) => ['why-lumen', 'black-lotus', 'network-maps'].some((s) => h.includes(s)),
          expected: [
            { text: 'Why Lumen', href: '/en-us/why-lumen' },
            { text: 'Black Lotus Labs', href: '/en-us/security/black-lotus-labs' },
            { text: 'Network Maps', href: '/en-us/resources/network-maps' },
          ],
        },
        {
          label: 'About Us',
          match: (h) => ['customer-success', '/about'].some((s) => h.includes(s)),
          expected: [
            { text: 'Customer Stories', href: '/en-us/resources/customer-success-stories' },
            { text: 'About Us', href: '/en-us/about' },
          ],
        },
        {
          label: 'Newsroom',
          match: (h) => ['blog.lumen', 'ir.lumen', 'developer.lumen'].some((s) => h.includes(s)),
          expected: [
            { text: 'Blog & News', href: 'https://blog.lumen.com' },
            { text: 'News Releases', href: 'https://ir.lumen.com/news/default.aspx' },
            { text: 'Developers', href: 'https://developer.lumen.com/devcenter/home' },
          ],
        },
      ],
    };

    // Build mega-menu for nav-drops that have category config
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li.nav-drop').forEach((navDrop) => {
      const label = getDirectTextContent(navDrop);
      const config = megaMenuConfig[label];
      if (!config) return;

      const subUl = navDrop.querySelector(':scope > ul');
      if (!subUl) return;

      navDrop.classList.add('nav-mega');

      // Group items into categories, using DOM items where available and
      // injecting fallback items for any the pipeline may have dropped
      const domItems = [...subUl.querySelectorAll(':scope > li')];
      const groups = config.map((cat) => {
        const matched = domItems.filter((li) => {
          const a = li.querySelector('a');
          return a && cat.match(a.getAttribute('href') || '');
        });
        // Build complete item list from expected, using DOM nodes when available
        const completeItems = (cat.expected || []).map((exp) => {
          const found = matched.find((li) => {
            const a = li.querySelector('a');
            return a && a.getAttribute('href') === exp.href;
          });
          if (found) return found.cloneNode(true);
          // Create fallback li for items dropped by the pipeline
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = exp.href;
          a.textContent = exp.text;
          li.append(a);
          return li;
        });
        return { label: cat.label, items: completeItems };
      });

      // Desktop: build two-panel mega-menu
      const megaMenu = document.createElement('div');
      megaMenu.className = 'mega-menu';

      const catPanel = document.createElement('div');
      catPanel.className = 'mega-menu-categories';

      const contentPanel = document.createElement('div');
      contentPanel.className = 'mega-menu-content';

      groups.forEach((grp, i) => {
        // Category label
        const catEl = document.createElement('div');
        catEl.className = `mega-menu-cat${i === 0 ? ' active' : ''}`;
        catEl.textContent = grp.label;
        catEl.dataset.index = i;
        catPanel.append(catEl);

        // Content group
        const group = document.createElement('div');
        group.className = `mega-menu-group${i === 0 ? ' active' : ''}`;
        group.dataset.index = i;
        const ul = document.createElement('ul');
        grp.items.forEach((li) => ul.append(li));
        group.append(ul);
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

      // Desktop: open mega-menu on hover
      navDrop.addEventListener('mouseenter', () => {
        if (isDesktop.matches) {
          toggleAllNavSections(navSections);
          navDrop.setAttribute('aria-expanded', 'true');
        }
      });
      navDrop.addEventListener('mouseleave', () => {
        if (isDesktop.matches) {
          navDrop.setAttribute('aria-expanded', 'false');
        }
      });
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
