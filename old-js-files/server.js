import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrapePodcastApp } from './scraper.js';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT) || 3000;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(body));
}

async function serveFile(requestPath, response) {
  const relativePath = requestPath === '/' ? 'demo.html' : requestPath.slice(1);
  const filePath = normalize(join(rootDirectory, relativePath));

  if (!filePath.startsWith(rootDirectory)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream'
    });
    response.end(file);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 500);
    response.end(error.code === 'ENOENT' ? 'Not found' : 'Unable to read file');
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (requestUrl.pathname === '/api/podcasts') {
    try {
      const query = requestUrl.searchParams.get('q')?.trim().toLowerCase();
      const podcasts = await scrapePodcastApp();
      const filteredPodcasts = query
        ? podcasts.filter((podcast) =>
            `${podcast.title} ${podcast.description} ${podcast.source}`.toLowerCase().includes(query))
        : podcasts;

      sendJson(response, 200, { podcasts: filteredPodcasts });
    } catch (error) {
      console.error('Podcast API failed:', error);
      sendJson(response, 500, { error: 'Unable to retrieve podcasts.' });
    }
    return;
  }

  await serveFile(requestUrl.pathname, response);
});

server.listen(port, () => {
  console.log(`DigiClips demo running at http://localhost:${port}`);
});
