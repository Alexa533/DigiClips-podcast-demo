// Converted the scraper.js to TypeScript...
// This file will be the new backend scraper for the podcast demo project. It will scrape multiple sources and when prompted, return a unified data structure.
import axios from 'axios';
import * as cheerio from 'cheerio';

// Define the shape of our returned data structure
export interface PodcastItem {
  source: 'WSJ' | 'PodcastApp' | 'TuneIn';
  title: string;
  link: string;
  description: string;
}

// Standard header footprint to bypass basic agent blocks
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9'
};

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export function getSearchQuery(): string {
  if (!isBrowser) return '';

  const input = document.getElementById('search_query') as HTMLInputElement | null;
  return input?.value.trim() ?? '';
}

function matchesQuery(item: PodcastItem, query: string): boolean {
  if (!query) return true;

  const haystack = `${item.title} ${item.description} ${item.source}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function updatePodcastCard(item: PodcastItem | null): void {
  if (!isBrowser) return;

  const titleLink = document.querySelector('.podcast-title a') as HTMLAnchorElement | null;
  const sourceInfo = document.querySelector('.podcast-info span:first-child') as HTMLElement | null;
  const descriptionEl = document.querySelector('.podcast-description') as HTMLElement | null;

  if (!titleLink || !sourceInfo || !descriptionEl) return;

  if (!item) {
    titleLink.textContent = 'No podcasts found';
    titleLink.href = '#';
    sourceInfo.textContent = '🎙️ No results';
    descriptionEl.textContent = 'Try another search term.';
    return;
  }

  titleLink.textContent = item.title || 'Untitled podcast';
  titleLink.href = item.link || '#';
  titleLink.target = item.link ? '_blank' : '';
  titleLink.rel = item.link ? 'noopener noreferrer' : '';

  sourceInfo.textContent = `🎙️ ${item.source}`;
  descriptionEl.textContent = item.description || 'No description available.';
}

/**
 * 1. Wall Street Journal Audio/Podcasts
 */
async function scrapeWSJ(): Promise<PodcastItem[]> {
  try {
    const { data } = await axios.get<string>('https://wsj.com', { headers: HEADERS });
    const $ = cheerio.load(data);

    return $('article, .wsj-podcast-item, [class*="podcast"]').map((_, el): PodcastItem | null => {
      const titleLink = $(el).find('h3 a, a[href*="/podcasts/"]');
      const title = titleLink.text().trim();
      const rawHref = titleLink.attr('href');
      const link = rawHref ? new URL(rawHref, 'https://wsj.com').href : '';
      const description = $(el).find('p, [class*="description"]').first().text().trim();

      if (!title || !link) return null;
      return { source: 'WSJ', title, link, description };
    }).get().filter((item): item is PodcastItem => item !== null);
  } catch (error) {
    console.error('WSJ Scraping failed:', error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * 2. Podcast App Shows
 */
async function scrapePodcastApp(): Promise<PodcastItem[]> {
  try {
    const { data } = await axios.get<string>('https://podcast.app', { headers: HEADERS });
    const $ = cheerio.load(data);

    return $('a[href*="/shows/"], .show-card, li').map((_, el): PodcastItem | null => {
      let title = '';
      let link = '';

      if ($(el).is('a')) {
        title = $(el).text().trim();
        link = $(el).attr('href') || '';
      } else {
        const anchor = $(el).find('a[href*="/shows/"]').first();
        title = anchor.text().trim() || $(el).find('h3, h4').text().trim();
        link = anchor.attr('href') || '';
      }

      const description = $(el).find('p, .summary, .description').text().trim();
      link = link ? new URL(link, 'https://podcast.app').href : '';

      if (!title || !link) return null;
      return { source: 'PodcastApp', title, link, description };
    }).get().filter((item): item is PodcastItem => item !== null);
  } catch (error) {
    console.error('PodcastApp Scraping failed:', error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * 3. TuneIn Podcasts
 */
async function scrapeTuneIn(): Promise<PodcastItem[]> {
  try {
    const { data } = await axios.get<string>('https://tunein.com', { headers: HEADERS });
    const $ = cheerio.load(data);

    return $('[class*="guideitem"], [class*="card"], a[href*="/podcasts/"]').map((_, el): PodcastItem | null => {
      let title = '';
      let link = '';

      if ($(el).is('a')) {
        title = $(el).attr('title') || $(el).text().trim();
        link = $(el).attr('href') || '';
      } else {
        const anchor = $(el).find('a[href*="/podcasts/"]').first();
        title = anchor.attr('title') || anchor.text().trim() || $(el).find('[class*="title"]').text().trim();
        link = anchor.attr('href') || '';
      }

      const description = $(el).find('[class*="subtitle"], [class*="description"], p').text().trim();
      link = link ? new URL(link, 'https://tunein.com').href : '';

      if (!title || !link) return null;
      return { source: 'TuneIn', title, link, description };
    }).get().filter((item): item is PodcastItem => item !== null);
  } catch (error) {
    console.error('TuneIn Scraping failed:', error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Master Aggregator Function
 */
export async function scrapeAllPodcasts(searchTerm = ''): Promise<PodcastItem[]> {
  const results = await Promise.all([
    scrapeWSJ(),
    scrapePodcastApp(),
    scrapeTuneIn()
  ]);

  const allResults = results.flat();
  const query = searchTerm.trim();

  if (!query) return allResults;

  return allResults.filter((item) => matchesQuery(item, query));
}

export async function loadPodcastResults(): Promise<PodcastItem[]> {
  const query = getSearchQuery();
  const items = await scrapeAllPodcasts(query);

  if (isBrowser) {
    updatePodcastCard(items[0] ?? null);
  }

  return items;
}

function bindPodcastSearch(): void {
  if (!isBrowser) return;

  const form = document.querySelector('.basic-search form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await loadPodcastResults();
  });
}

if (isBrowser) {
  document.addEventListener('DOMContentLoaded', () => {
    bindPodcastSearch();
    void loadPodcastResults();
  });
}

// KEEP THESE COMMENTS BELOW
// run: npx tsx new-scraper.ts
// <script type="module" src="dist/script_name_here.js"></script> - to run specific script
