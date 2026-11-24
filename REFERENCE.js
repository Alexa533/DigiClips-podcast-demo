async function searchPodcastResults(searchQuery, numOfRecords, filters = {}) {
  const query = externalQuery(searchQuery);
  if (!query) return [];
  const limit = clampResultLimit(numOfRecords);
  const response = await axios.get("https://itunes.apple.com/search", {
    params: {
      term: query,
      media: "podcast",
      entity: "podcast",
      country: "US",
      limit: Math.min(limit, MAX_PODCAST_FEEDS),
    },
    timeout: REQUEST_TIMEOUT_MS,
    headers: { "User-Agent": "DigiClips/1.20 media search" },
  });

  const shows = Array.isArray(response.data?.results)
    ? response.data.results.filter((show) => show.feedUrl).slice(0, MAX_PODCAST_FEEDS)
    : [];
  const feeds = await Promise.allSettled(shows.map(async (show) => {
    const feedResponse = await axios.get(show.feedUrl, {
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "text",
      headers: { "User-Agent": "DigiClips/1.20 media search" },
    });
    const feed = await rssParser.parseString(feedResponse.data);
    return { show, feed };
  }));

  const results = [];
  for (const settled of feeds) {
    if (settled.status !== "fulfilled") continue;
    const { show, feed } = settled.value;
    for (const item of (feed.items || []).slice(0, limit)) {
      const result = normalizeResult("podcast", {
        id: stableId("podcast", item.guid || item.link || item.enclosure?.url || item.title),
        title: item.title,
        source: show.collectionName || feed.title,
        author: item.creator || show.artistName,
        date: item.isoDate || item.pubDate || show.releaseDate,
        excerpt: item.contentSnippet || item.summary || item.content,
        url: item.link || show.collectionViewUrl,
        mediaUrl: item.enclosure?.url,
        imageUrl: show.artworkUrl600 || show.artworkUrl100 || feed.image?.url,
        platform: "Podcast",
      });
      if (matchesSearchTerms(result, searchQuery) && isWithinDateRange(result.date, filters)) {
        results.push(result);
      }
    }
  }

  return results
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, limit);
}

/*

export type OnlineMediaKind = 'podcast' | 'socialMedia' | 'blog';
export interface OnlineMediaResult {
  id: string;
  kind: OnlineMediaKind;
  mediaType: 'Podcast' | 'Social Media' | 'Blog';
  title: string;

*/