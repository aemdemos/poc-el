const LOGO_CDN_BASE = 'https://www.lumen.com/content/dam/lumen/new-homepage/logos/';
const LOGO_MAP = {
  'Google Cloud': 'Logo-GoogleCloud-1C.svg',
  Alorica: 'Logo-Alorica-1C.svg',
  AWS: 'Logo-AWS-1C.svg',
  Ball: 'Logo-Ball-1C.svg',
  'UC Berkeley': 'Logo-UCBerkeley-1C.svg',
  IGT: 'Logo-IGT-1C.svg',
  Intelsat: 'Logo-Intelsat-1C.svg',
  'Konica Minolta': 'Logo-KonicaMinolta-1C.svg',
  LVMH: 'Logo-LMVH-1C.svg',
  Markel: 'Logo-Markel-1C.svg',
  'Mary Kay': 'Logo-MaryKay-1C.svg',
  Microsoft: 'Logo-Microsoft-1C.svg',
  MTN: 'Logo-MTN-1C.svg',
  Pemco: 'Logo-Pemco-1C.svg',
  'Ralph Lauren': 'Logo-RalphLauren-1C.svg',
  Seahawks: 'Logo-Seahawks-1C.svg',
  Worldpay: 'Logo-WorldPay-1C.svg',
  Zoom: 'Logo-Zoom-1C.svg',
  Accertify: 'Logo-Accertify-1C.svg',
};

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Build logo list
  const track = document.createElement('div');
  track.classList.add('carousel-logos-track');

  rows.forEach((row) => {
    const img = row.querySelector('img');
    if (!img) return;

    const logoItem = document.createElement('div');
    logoItem.classList.add('carousel-logos-item');

    // Replace with CDN SVG if mapped
    const logoFile = LOGO_MAP[img.alt];
    if (logoFile) {
      const newImg = document.createElement('img');
      newImg.src = `${LOGO_CDN_BASE}${logoFile}`;
      newImg.alt = img.alt;
      newImg.loading = 'lazy';
      logoItem.append(newImg);
    } else {
      logoItem.append(img);
    }

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
