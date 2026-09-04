// This file is used to scrape data from the Podcast App site (https://podcast.app/) and return the results into the demo.html file to be displayed.
//  no saving into a database is done in this file, it is only used to scrape the data and return it to the demo.html file. --currently consulting with gemini for blockers, site formatting, and other issues that may appear with the different websites

// imports
import axios from 'axios'; //npm install axios
import * as cheerio from 'cheerio'; //npm install cheerio

// Helper to provide standard headers to bypass basic anti-scraping blocks
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9'
};

/**
 * 1. Wall Street Journal Audio/Podcasts
 * Targets the structural grid items containing the podcast lists.
 */
async function scrapeWSJ() {
  try {
    const { data } = await axios.get('https://www.wsj.com/audio/podcasts', { headers: HEADERS });
    const $ = cheerio.load(data);

    // WSJ organizes podcast episodes into specific article-like row containers
    return $('article, .wsj-podcast-item, [class*="podcast"]').map((_, el) => {
      const titleLink = $(el).find('h3 a, a[href*="/podcasts/"]');
      const title = titleLink.text().trim();
      const link = titleLink.attr('href') ? new URL(titleLink.attr('href'), 'https://www.wsj.com').href : '';
      const description = $(el).find('p, [class*="description"]').first().text().trim();

      if (!title) return null;
      return { source: 'WSJ', title, link, description };
    }).get().filter(Boolean);

  } catch (error) {
    console.error('WSJ Scraping failed:', error.message);
    return [];
  }
}

/**
 * 2. Podcast App Shows
 * Targets list layouts natively formatted for directories.
 */
async function scrapePodcastApp() {
  try {
    const { data } = await axios.get('https://podcast.app/shows', { headers: HEADERS });
    const $ = cheerio.load(data);

    // Grabs targeted list elements, anchoring to semantic elements or specific URLs
    return $('a[href*="/shows/"], .show-card, li').map((_, el) => {
      let title, link, description = "";

      if ($(el).is('a')) {
        title = $(el).text().trim();
        link = $(el).attr('href');
      } else {
        const anchor = $(el).find('a[href*="/shows/"]').first();
        title = anchor.text().trim() || $(el).find('h3, h4').text().trim();
        link = anchor.attr('href');
      }

      description = $(el).find('p, .summary, .description').text().trim();
      link = link ? new URL(link, 'https://podcast.app').href : '';

      if (!title || !link) return null;
      return { source: 'PodcastApp', title, link, description };
    }).get().filter(Boolean);

  } catch (error) {
    console.error('PodcastApp Scraping failed:', error.message);
    return [];
  }
}

/**
 * 3. TuneIn Podcasts
 * Grabs media objects and layout cards containing podcast grids.
 */
async function scrapeTuneIn() {
  try {
    const { data } = await axios.get('https://tunein.com/podcasts/', { headers: HEADERS });
    const $ = cheerio.load(data);

    // TuneIn structures lists around media layout titles and interactive rows
    return $('[class*="guideitem"], [class*="card"], a[href*="/podcasts/"]').map((_, el) => {
      let title, link, description = "";

      if ($(el).is('a')) {
        title = $(el).attr('title') || $(el).text().trim();
        link = $(el).attr('href');
      } else {
        const anchor = $(el).find('a[href*="/podcasts/"]').first();
        title = anchor.attr('title') || anchor.text().trim() || $(el).find('[class*="title"]').text().trim();
        link = anchor.attr('href');
      }

      description = $(el).find('[class*="subtitle"], [class*="description"], p').text().trim();
      link = link ? new URL(link, 'https://tunein.com').href : '';

      if (!title || !link) return null;
      return { source: 'TuneIn', title, link, description };
    }).get().filter(Boolean);

  } catch (error) {
    console.error('TuneIn Scraping failed:', error.message);
    return [];
  }
}

// Master Aggregator Function
export async function scrapeAllPodcasts() {
  const results = await Promise.all([
    scrapeWSJ(),
    scrapePodcastApp(),
    scrapeTuneIn()
  ]);

  // Combines the memory-stored arrays into a single stream to return
  return results.flat();
}

// print the contents of scrapeWSJ, scrapePodcastApp, and scrapeTuneIn to the console for testing - individually call each function and log the results

// UNSUCCESSFUL
/*
// (async () => {
  console.log("Scraping WSJ Podcasts...");
  const wsjResults = await scrapeWSJ();
  console.log("WSJ Results:", wsjResults);
// })
*/

// SUCCESSFUL
/*
    console.log("Scraping Podcast App...");
    const podcastAppResults = await scrapePodcastApp();
    console.log("Podcast App Results:", podcastAppResults);
*/


// SUCCESSFUL
/*
    console.log("Scraping TuneIn Podcasts...");
    const tuneInResults = await scrapeTuneIn();
    console.log("TuneIn Results:", tuneInResults);
*/
