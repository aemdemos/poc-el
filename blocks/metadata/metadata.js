/**
 * Metadata Block
 * Reads key-value pairs from the metadata table and adds them as <meta> tags
 * in the document head. Removes the visible block from the page.
 */
export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      const key = cols[0].textContent.trim().toLowerCase();
      const value = cols[1].textContent.trim();
      if (key && value) {
        const attr = key.includes(':') ? 'property' : 'name';
        const existing = document.head.querySelector(`meta[${attr}="${key}"]`);
        if (existing) {
          existing.content = value;
        } else {
          const meta = document.createElement('meta');
          meta.setAttribute(attr, key);
          meta.content = value;
          document.head.append(meta);
        }
      }
    }
  });
  block.remove();
}
