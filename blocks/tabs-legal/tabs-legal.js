export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.className = 'tabs-legal-nav';
  nav.setAttribute('aria-label', 'Legal navigation');

  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const link = row.querySelector('a');
    if (link) {
      const li = document.createElement('li');
      li.append(link);

      // mark the current page as active
      const currentPath = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
      const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\.html$/, '').replace(/\/$/, '');
      if (currentPath.startsWith(linkPath) && linkPath !== '') {
        li.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }

      ul.append(li);
    }
  });

  nav.append(ul);
  block.textContent = '';
  block.append(nav);
}
