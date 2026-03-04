export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-story-${cols.length}-cols`);

  // setup image and video columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-story-img-col');
        }
      }

      // handle video embeds (Brightcove or other iframe-embeddable URLs)
      const link = col.querySelector('a[href*="players.brightcove.net"]');
      const text = col.textContent.trim();
      if (link) {
        const wrapper = document.createElement('div');
        wrapper.className = 'columns-story-video-col';
        wrapper.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
          <iframe src="${link.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
            allowfullscreen="" allow="encrypted-media" title="Video" loading="lazy"></iframe>
        </div>`;
        col.textContent = '';
        col.append(wrapper);
      } else if (!pic && text.startsWith('https://') && text.includes('players.brightcove.net')) {
        // plain text URL or URL wrapped in <p> tag
        const wrapper = document.createElement('div');
        wrapper.className = 'columns-story-video-col';
        wrapper.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
          <iframe src="${text}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
            allowfullscreen="" allow="encrypted-media" title="Video" loading="lazy"></iframe>
        </div>`;
        col.textContent = '';
        col.append(wrapper);
      }
    });
  });
}
