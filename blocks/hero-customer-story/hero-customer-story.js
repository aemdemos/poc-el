export default function decorate(block) {
  const rows = [...block.children];
  const pictureRows = rows.filter((row) => row.querySelector('picture'));

  if (pictureRows.length === 0) {
    block.classList.add('no-image');
  } else if (pictureRows.length >= 2) {
    // First picture row = hero background, second = logo for mobile
    pictureRows[0].classList.add('hero-bg');
    pictureRows[1].classList.add('hero-logo');
  } else {
    // Single picture row = hero background only
    pictureRows[0].classList.add('hero-bg');
  }
}
