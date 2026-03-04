export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-story-${cols.length}-cols`);

  // setup image and video columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const link = col.querySelector('a[href*="players.brightcove.net"]');

      if (link) {
        // Video column: poster image + Brightcove link + caption
        const videoSrc = link.href;
        const caption = link.textContent.trim();
        const poster = col.querySelector('picture');

        const wrapper = document.createElement('div');
        wrapper.className = 'columns-story-video-col';

        // Build poster with play button overlay
        const posterContainer = document.createElement('div');
        posterContainer.className = 'columns-story-video-poster';
        if (poster) {
          posterContainer.append(poster);
        }
        // Play button overlay
        const playBtn = document.createElement('button');
        playBtn.className = 'columns-story-video-play';
        playBtn.setAttribute('aria-label', 'Play video');
        posterContainer.append(playBtn);

        wrapper.append(posterContainer);

        // Caption below the video
        if (caption && !caption.startsWith('http')) {
          const captionEl = document.createElement('p');
          captionEl.className = 'columns-story-video-caption';
          captionEl.textContent = caption;
          wrapper.append(captionEl);
        }

        // Click handler: replace poster with iframe
        posterContainer.addEventListener('click', () => {
          posterContainer.innerHTML = `<div class="columns-story-video-iframe">
            <iframe src="${videoSrc}?autoplay=1" allowfullscreen=""
              allow="autoplay; encrypted-media" title="Video"></iframe>
          </div>`;
        });

        col.textContent = '';
        col.append(wrapper);
      } else if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-story-img-col');
        }
      }
    });
  });
}
