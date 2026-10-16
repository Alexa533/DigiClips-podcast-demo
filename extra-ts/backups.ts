// 9/25/26 PodcastApp stuff


// Converted the scraper.js to TypeScript...
// This file will be the new backend scraper for the podcast demo project. It will scrape multiple sources and when prompted, return a unified data structure.

// import axios from 'axios';
// import * as cheerio from 'cheerio';

// // Define the shape of our returned data structure
// export interface PodcastItem {
//   source: 'WSJ' | 'PodcastApp' | 'TuneIn';
//   title: string;
//   link: string;
//   description: string;
// }

// // Standard header footprint to bypass basic agent blocks
// const HEADERS = {
//   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//   'Accept-Language': 'en-US,en;q=0.9'
// };

// /**
//  * 1. Wall Street Journal Audio/Podcasts
//  */
// async function scrapeWSJ(): Promise<PodcastItem[]> {
//   try {
//     const { data } = await axios.get<string>('https://www.wsj.com/audio/search?query=school', { headers: HEADERS }); //https://wsj.com
//     const $ = cheerio.load(data);

//     return $('article, .wsj-podcast-item, [class*="podcast"]').map((_, el): PodcastItem | null => {
//       const titleLink = $(el).find('h3 a, a[href*="/podcasts/"]');
//       const title = titleLink.text().trim();
//       const rawHref = titleLink.attr('href');
//       const link = rawHref ? new URL(rawHref, 'https://wsj.com').href : '';
//       const description = $(el).find('p, [class*="description"]').first().text().trim();

//       if (!title || !link) return null;
//       return { source: 'WSJ', title, link, description };
//     }).get().filter((item): item is PodcastItem => item !== null);

//   } catch (error) {
//     console.error('WSJ Scraping failed:', error instanceof Error ? error.message : error);
//     return [];
//   }
// }

// /**
//  * 2. Podcast App Shows
//  */
// async function scrapePodcastApp(): Promise<PodcastItem[]> {
//   try {
//     const { data } = await axios.get<string>('https://podcast.app/search?q=france', { headers: HEADERS }); //https://podcast.app
//     const $ = cheerio.load(data);

//     return $('a[href*="/shows/"], .show-card, li').map((_, el): PodcastItem | null => {
//       let title = '';
//       let link = '';

//       if ($(el).is('a')) {
//         title = $(el).text().trim();
//         link = $(el).attr('href') || '';
//       } else {
//         const anchor = $(el).find('a[href*="/shows/"]').first();
//         //FOR TITLE: <h1 class="truncate px-4 text-center font-sora text-base font-semibold leading-6 text-black">Podcast Title Example</h1>
//         title = anchor.text().trim() || $(el).find('h1, h2').text().trim(); //h3, h4 previously
//         //FOR LINK: <a class="rounded-lg shadow-2xl hover:shadow-3xl" title="Join Us in France Travel Podcast by Annie Sargent" href="/title-example-podcast-p">...
//         link = anchor.attr('href') || '';
//       }

//       const description = $(el).find('p, .summary, .description').text().trim();
//       //FOR DESCRIPTION:
//       //when in scraped link:
//       // <div class="styled-description font-inter text-base font-normal leading-6 text-light-black">Podcast's description here...</div> //do not inclide <span>...</span> at the end of description
//       link = link ? new URL(link, 'https://podcast.app').href : '';

//       if (!title || !link) return null;
//       return { source: 'PodcastApp', title, link, description };
//     }).get().filter((item): item is PodcastItem => item !== null);

//   } catch (error) {
//     console.error('PodcastApp Scraping failed:', error instanceof Error ? error.message : error);
//     return [];
//   }
// }

// /**
//  * 3. TuneIn Podcasts
//  */
// async function scrapeTuneIn(): Promise<PodcastItem[]> {
//   try {
//     const { data } = await axios.get<string>('https://tunein.com/search/?query=water', { headers: HEADERS }); //https://tunein.com/podcasts/ //https://tunein.com
//     const $ = cheerio.load(data);

//     return $('[class*="guideitem"], [class*="card"], a[href*="/podcasts/"]').map((_, el): PodcastItem | null => {
//       let title = '';
//       let link = '';

//       if ($(el).is('a')) {
//         title = $(el).attr('title') || $(el).text().trim();
//         link = $(el).attr('href') || '';
//       } else {
//         const anchor = $(el).find('a[href*="/podcasts/"]').first();
//         title = anchor.attr('title') || anchor.text().trim() || $(el).find('[class*="title"]').text().trim();
//         link = anchor.attr('href') || '';
//       }

//       const description = $(el).find('[class*="subtitle"], [class*="description"], p').text().trim();
//       link = link ? new URL(link, 'https://tunein.com').href : '';

//       if (!title || !link) return null;
//       return { source: 'TuneIn', title, link, description };
//     }).get().filter((item): item is PodcastItem => item !== null);

//   } catch (error) {
//     console.error('TuneIn Scraping failed:', error instanceof Error ? error.message : error);
//     return [];
//   }
// }

// /**
//  * Master Aggregator Function
//  */
// export async function scrapeAllPodcasts(): Promise<PodcastItem[]> {
//   const results = await Promise.all([
//     // scrapeWSJ(), //FAILS
//     scrapePodcastApp(), //works! BUT pulling genres, not results
//     // scrapeTuneIn() //works! BUT 1. putting description w/title at times 2. duplicating results - play button and then actual title, same links
//   ]);

//   return results.flat();
// }

// scrapeAllPodcasts().then(console.log);
//running: npx tsx new-scraper.ts























////////////////////////////////////////////////////////////////////////////////////////////////////////////




















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
    const { data } = await axios.get<string>('https://www.wsj.com/audio/search?query=school', { headers: HEADERS }); //https://wsj.com
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
export async function scrapePodcastApp(): Promise<PodcastItem[]> {
  try {
    const { data } = await axios.get<string>('https://podcast.app/search?q=france', { headers: HEADERS });
    const $ = cheerio.load(data);

    const seenLinks = new Set<string>();
    const items: PodcastItem[] = [];

    $('a[href*="/shows/"]').each((_, element) => {
      const anchor = $(element);
      const rawHref = anchor.attr('href') || '';
      if (!rawHref || rawHref.startsWith('#')) return;

      const card = anchor.closest('article, li, div');
      const title = (
        card.find('h1, h2, h3, h4, [class*="title"]').first().text().trim() ||
        anchor.attr('title')?.trim() ||
        anchor.text().trim()
      );
      const link = rawHref ? new URL(rawHref, 'https://podcast.app').href : '';
      const description = card.find('p, [class*="description"], [class*="summary"], [class*="subtitle"]').first().text().trim();

      if (!title || !link || seenLinks.has(link)) return;

      const isLikelyResult = !rawHref.startsWith('/search') && !rawHref.includes('/terms') && !rawHref.includes('/privacy') && !rawHref.includes('/genres');
      if (!isLikelyResult) return;

      seenLinks.add(link);
      items.push({ source: 'PodcastApp', title, link, description });
    });

    return items;
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
    const { data } = await axios.get<string>('https://tunein.com/search/?query=water', { headers: HEADERS }); //https://tunein.com/podcasts/ //https://tunein.com
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
    scrapePodcastApp(), //works! BUT pulling genres, not results
    // scrapeTuneIn() //works! BUT 1. putting description w/title at times 2. duplicating results - play button and then actual title, same links
  ]);

  return results.flat();
}

scrapeAllPodcasts().then(console.log);
// COMMENTS TO KEEP
//running: npx tsx new-scraper.ts
