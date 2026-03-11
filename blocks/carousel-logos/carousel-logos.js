export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Build logo list from content
  const track = document.createElement('div');
  track.classList.add('carousel-logos-track');

  rows.forEach((row) => {
    const pic = row.querySelector('picture');
    const img = row.querySelector('img');
    if (!img) return;

    const logoItem = document.createElement('div');
    logoItem.classList.add('carousel-logos-item');
    logoItem.append(pic || img);
    track.append(logoItem);
  });

  // Duplicate logos for seamless infinite scroll
  const clone = track.cloneNode(true);
  clone.classList.add('carousel-logos-track-clone');
  clone.setAttribute('aria-hidden', 'true');

  // Build final structure
  block.textContent = '';
  const slider = document.createElement('div');
  slider.classList.add('carousel-logos-slider');
  slider.append(track);
  slider.append(clone);
  block.append(slider);
}
