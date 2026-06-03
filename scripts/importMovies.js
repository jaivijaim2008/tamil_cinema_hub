require('dotenv').config({ path: '.env.local' });
const requiredEnv = ['NEXT_PUBLIC_SANITY_PROJECT_ID', 'NEXT_PUBLIC_SANITY_DATASET', 'SANITY_WRITE_TOKEN', 'TMDB_API_KEY'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
const { createClient } = require('@sanity/client');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args)); // ensure fetch works
const fs = require('fs');

// Helper to strip surrounding quotes from env values (dotenv includes them if present)
const getEnv = (key) => {
  const val = process.env[key];
  if (!val) return undefined;
  // Remove surrounding double quotes if present
  return val.replace(/^"|"$/g, '');
};

const sanity = createClient({
  projectId: getEnv('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: getEnv('NEXT_PUBLIC_SANITY_DATASET') || 'production',
  apiVersion: '2024-01-01',
  token: getEnv('SANITY_WRITE_TOKEN'),
  useCdn: false,
});

const TMDB_KEY = process.env.TMDB_API_KEY;
const BASE = 'https://api.themoviedb.org/3';

function makeSlug(title, year) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .trim() + '-' + year;
}

async function fetchWithRetry(url, retries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`TMDB error ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Fetch attempt ${attempt} failed for ${url}: ${err.message}. Retrying in ${delayMs}ms...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

async function fetchPage(year, page) {
  const url = `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_original_language=ta&primary_release_year=${year}&sort_by=popularity.desc&page=${page}`;
  return await fetchWithRetry(url);
}

async function fetchDetails(tmdbId) {
  const url = `${BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}&append_to_response=credits`;
  return await fetchWithRetry(url);
}

async function movieExistsInSanity(tmdbId) {
  const result = await sanity.fetch(`*[_type == "movie" && tmdbId == $tmdbId][0]._id`, { tmdbId });
  return !!result;
}

async function main() {
  let total = 0;
  for (let year = 2000; year <= 2026; year++) {
    console.log(`\nFetching year ${year}...`);
    const firstPage = await fetchPage(year, 1);
    const totalPages = Math.min(firstPage.total_pages, 3); // limit to 3 pages per year for speed
    for (let page = 1; page <= totalPages; page++) {
      const data = page === 1 ? firstPage : await fetchPage(year, page);
      const movies = data.results || [];
      for (const movie of movies) {
        try {
          const exists = await movieExistsInSanity(movie.id);
          if (exists) {
            console.log(`  Skipped (already exists): ${movie.title}`);
            continue;
          }
          // polite delay to avoid rate limits
          await new Promise(r => setTimeout(r, 300));
          const details = await fetchDetails(movie.id);
          const director = details.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown';
          const cast = details.credits?.cast?.slice(0, 5).map(c => c.name) || [];
          const genres = details.genres?.map(g => g.name.toLowerCase()) || [];
          const synopsis = details.overview || '';
          // TMDB poster & backdrop URLs saved as plain strings
          const posterUrl = details.poster_path
            ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
            : null;
          const backdropUrl = details.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
            : null;
          const doc = {
            _type: 'movie',
            title: details.title,
            titleTanglish: details.title,
            slug: {
              _type: 'slug',
              current: makeSlug(details.title, year),
            },
            year: year,
            director,
            cast,
            genre: genres,
            synopsis,
            tmdbId: movie.id,
            posterUrl,    // direct TMDB image URL — no Sanity upload needed
            backdropUrl,  // wide banner image for detail page hero
            ottPlatform: '',
            rating: parseFloat((details.vote_average / 2).toFixed(1)),
          };
          await sanity.create(doc);
          total++;
          console.log(`  Added: ${details.title} (${year}) — total: ${total}`);
        } catch (err) {
          console.log(`  Error for ${movie.title}: ${err.message}`);
        }
      }
    }
    console.log(`Year ${year} complete`);
    await new Promise(r => setTimeout(r, 500)); // brief pause between years
  }
  console.log(`\nDone! Total movies imported: ${total}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});