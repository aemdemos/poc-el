export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Check if first two rows both contain images (desktop + mobile)
  const firstRowPic = rows[0]?.querySelector('picture');
  const secondRowPic = rows[1]?.querySelector('picture');

  if (firstRowPic && secondRowPic) {
    // Mark first row as desktop image, second as mobile image
    rows[0].classList.add('hero-enterprise-img-desktop');
    rows[1].classList.add('hero-enterprise-img-mobile');
  } else if (!firstRowPic) {
    block.classList.add('no-image');
  }

  // Convert paragraphs with markdown heading syntax to actual headings
  // Handles <br>-separated content: "# heading <br> subtitle" → <h1> + <p>
  block.querySelectorAll('p').forEach((p) => {
    const text = p.textContent.trim();
    const match = text.match(/^(#{1,6})\s+(.*)/);
    if (!match) return;

    const level = match[1].length;
    const br = p.querySelector('br');

    if (br) {
      const parts = p.innerHTML.split(/<br\s*\/?>/i);
      const headingText = parts[0].replace(/^#{1,6}\s+/, '').trim();
      const paraText = parts.slice(1).join('').trim();

      const heading = document.createElement(`h${level}`);
      heading.textContent = headingText;

      const frag = document.createDocumentFragment();
      frag.appendChild(heading);

      if (paraText) {
        const para = document.createElement('p');
        para.textContent = paraText;
        frag.appendChild(para);
      }

      p.replaceWith(frag);
    } else {
      const heading = document.createElement(`h${level}`);
      [, , heading.textContent] = match;
      p.replaceWith(heading);
    }
  });
}
