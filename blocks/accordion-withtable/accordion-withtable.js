import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';

    // Add globe icon before label text
    const icon = document.createElement('img');
    icon.src = '/icons/regulatory-globe.svg';
    icon.alt = '';
    icon.className = 'accordion-item-icon';
    icon.setAttribute('loading', 'lazy');
    summary.append(icon);

    summary.append(...label.childNodes);

    // Add chevron span
    const chevron = document.createElement('span');
    chevron.className = 'accordion-item-chevron';
    summary.append(chevron);

    const body = row.children[1];
    body.className = 'accordion-item-body';

    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
