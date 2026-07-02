/**
 * FETCH LATEST TAMIL MOVIES (2024-2026)
 * Only fetches movies not already in Sanity.
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const TMDB_KEY = process.env.TMDB_API_KEY;
const BASE = 'https://api.themoviedb.org/3';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function makeSlug(title, year) {
  return title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').trim() + '-' + year;
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.log('  ⏳ Rate limited, waiting 2s...');
        await sleep(2000);
        continue;
      }
      if (!res.ok) throw new Error(`TMDB ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`  Retry ${i}: ${err.message}`);
      await sleep(1000);
    }
  }
}

async function main() {
  const years = [2024, 2025, 2026];
  let totalImported = 0;

  // Get existing tmdbIds from Sanity
  const existing = await sanity.fetch('*[_type == "movie" && defined(tmdbId)]{tmdbId}');
  const existingIds = new Set(existing.map(m => m.tmdbId));
  console.log(`Existing movies with tmdbId: ${existingIds.size}\n`);

  for (const year of years) {
    console.log(`\n📅 Year ${year}...`);

    // Fetch up to 5 pages of Tamil movies per year (sorted by popularity)
    const totalPages = year === 2026 ? 2 : 5; // 2026 is partial

    for (let page = 1; page <= totalPages; page++) {
      process.stdout.write(`  Page ${page}/${totalPages}... `);

      const data = await fetchWithRetry(
        `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_original_language=ta&primary_release_year=${year}&sort_by=popularity.desc&page=${page}`
      );

      const movies = data.results || [];
      console.log(`${movies.length} movies found`);

      for (const movie of movies) {
        if (existingIds.has(movie.id)) {
          continue; // Already imported
        }

        try {
          await sleep(350); // Rate limit
          const details = await fetchWithRetry(
            `${BASE}/movie/${movie.id}?api_key=${TMDB_KEY}&append_to_response=credits`
          );

          const director = details.credits?.crew?.find(c => c.job === 'Director')?.name || '';
          const cast = details.credits?.cast?.slice(0, 8).map(c => c.name) || [];
          const genres = details.genres?.map(g => g.name.toLowerCase()) || [];
          const posterUrl = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null;
          const backdropUrl = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null;

          const doc = {
            _type: 'movie',
            title: details.title,
            titleTanglish: details.title,
            slug: { _type: 'slug', current: makeSlug(details.title, year) },
            year,
            director,
            cast,
            genre: genres,
            synopsis: details.overview || '',
            tmdbId: movie.id,
            posterUrl,
            backdropUrl,
            ottPlatform: '',
            rating: parseFloat((details.vote_average / 2).toFixed(1)),
          };

          await sanity.create(doc);
          existingIds.add(movie.id);
          totalImported++;
          console.log(`    ✅ ${details.title} (${year})`);
        } catch (err) {
          console.log(`    ❌ ${movie.title}: ${err.message}`);
        }
      }
    }
  }

  console.log(`\n🎉 Done! Imported ${totalImported} new movies.`);
}

main().catch(err => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});
