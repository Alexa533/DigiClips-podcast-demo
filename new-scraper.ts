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
export async function scrapeAllPodcasts(): Promise<PodcastItem[]> {
  const results = await Promise.all([
    // scrapeWSJ(), //FAILS
    scrapePodcastApp(), //works!
    // scrapeTuneIn() //works!
  ]);

  return results.flat();
}

scrapeAllPodcasts().then(console.log);
//running: npx tsx new.scraper.ts
