export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  // Convert paragraphs with markdown heading syntax to actual headings
  block.querySelectorAll('p').forEach((p) => {
    const text = p.textContent.trim();
    const match = text.match(/^(#{1,6})\s+(.*)/);
    if (match) {
      const level = match[1].length;
      const heading = document.createElement(`h${level}`);
      [, , heading.textContent] = match;
      p.replaceWith(heading);
    }
  });
}
