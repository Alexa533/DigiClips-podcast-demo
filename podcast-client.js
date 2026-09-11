const searchForm = document.querySelector('.basic-search form');
const resultsContainer = document.querySelector('#results-container');
const resultsTemplate = resultsContainer?.querySelector('.results-section');

function populateResult(resultSection, podcast) {
  const titleLink = resultSection.querySelector('.podcast-title a');
  const sourceInfo = resultSection.querySelector('.podcast-info span:first-child');
  const description = resultSection.querySelector('.podcast-description');

  titleLink.textContent = podcast.title || 'Untitled podcast';
  titleLink.href = podcast.link || '#';
  titleLink.target = podcast.link ? '_blank' : '';
  titleLink.rel = podcast.link ? 'noopener noreferrer' : '';
  sourceInfo.textContent = `🎙️ ${podcast.source || 'Unknown source'}`;
  description.textContent = podcast.description || 'No description available.';
}

async function loadPodcasts(query = '') {
  if (!resultsTemplate || !resultsContainer) return;
  resultsContainer.replaceChildren();

  const loadingSection = resultsTemplate.cloneNode(true);
  loadingSection.querySelector('.podcast-description').textContent = 'Loading podcast results...';
  resultsContainer.append(loadingSection);

  try {
    const queryString = query ? `?q=${encodeURIComponent(query)}` : '';
    const response = await fetch(`/api/podcasts${queryString}`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Request failed');
    resultsContainer.replaceChildren();

    if (!data.podcasts.length) {
      const emptySection = resultsTemplate.cloneNode(true);
      emptySection.querySelector('.podcast-title a').textContent = 'No podcasts found';
      emptySection.querySelector('.podcast-title a').removeAttribute('href');
      emptySection.querySelector('.podcast-info span:first-child').textContent = '🎙️ No results';
      emptySection.querySelector('.podcast-description').textContent = 'Try another search term.';
      resultsContainer.append(emptySection);
      return;
    }

    data.podcasts.forEach((podcast) => {
      const resultSection = resultsTemplate.cloneNode(true);
      populateResult(resultSection, podcast);
      resultsContainer.append(resultSection);
    });
  } catch (error) {
    console.error(error);
    resultsContainer.replaceChildren();
    const errorSection = resultsTemplate.cloneNode(true);
    errorSection.querySelector('.podcast-description').textContent =
      'Unable to load podcast results. Make sure the Node server is running.';
    resultsContainer.append(errorSection);
  }
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  loadPodcasts(new FormData(searchForm).get('search_query') || '');
});
loadPodcasts();
