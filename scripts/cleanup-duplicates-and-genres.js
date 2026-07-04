/**
 * Cleanup script for Tamil Cinema Hub
 * 1. Remove duplicate movies (keep the one with more data)
 * 2. Normalize all genres to Title Case
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function removeDuplicateMovies() {
  console.log('\n=== REMOVING DUPLICATE MOVIES ===\n');

  const allMovies = await sanity.fetch(
    '*[_type=="movie"]{_id, title, year, tmdbId, synopsis, posterUrl, cast}'
  );
  console.log(`Total movies: ${allMovies.length}`);

  // Group by tmdbId
  const byTmdbId = {};
  allMovies.forEach((m) => {
    if (m.tmdbId) {
      if (!byTmdbId[m.tmdbId]) byTmdbId[m.tmdbId] = [];
      byTmdbId[m.tmdbId].push(m);
    }
  });

  // Find duplicates
  const duplicateGroups = Object.entries(byTmdbId).filter(
    ([, movies]) => movies.length > 1
  );
  console.log(`Found ${duplicateGroups.length} duplicate tmdbId groups\n`);

  let deletedCount = 0;

  for (const [tmdbId, movies] of duplicateGroups) {
    console.log(`tmdbId ${tmdbId}:`);

    // Score each movie by completeness
    const scored = movies.map((m) => ({
      ...m,
      score: [
        m.synopsis ? 2 : 0,
        m.posterUrl ? 2 : 0,
        m.cast && m.cast.length > 0 ? 1 : 0,
      ].reduce((a, b) => a + b, 0),
    }));

    // Sort by score descending, then keep the first one
    scored.sort((a, b) => b.score - a.score);

    const keep = scored[0];
    const deleteList = scored.slice(1);

    console.log(`  KEEP: ${keep.title} (${keep.year}) score:${keep.score} id:${keep._id}`);
    for (const d of deleteList) {
      console.log(`  DELETE: ${d.title} (${d.year}) score:${d.score} id:${d._id}`);
      try {
        await sanity.delete(d._id);
        deletedCount++;
        console.log(`    ✓ Deleted`);
        await sleep(100);
      } catch (err) {
        console.error(`    ✗ Failed: ${err.message}`);
      }
    }
  }

  console.log(`\n✅ Removed ${deletedCount} duplicate movies\n`);
  return deletedCount;
}

async function normalizeGenres() {
  console.log('\n=== NORMALIZING GENRE CASING ===\n');

  const movies = await sanity.fetch('*[_type=="movie"]{_id, title, genre}');
  console.log(`Total movies: ${movies.length}`);

  // Build mapping: lowercase -> Title Case
  const genreMap = {};
  movies.forEach((m) => {
    (m.genre || []).forEach((g) => {
      const lower = g.toLowerCase();
      if (!genreMap[lower]) {
        genreMap[lower] = g; // Keep first seen casing (likely Title Case)
      }
      // Prefer Title Case version
      if (g[0] === g[0].toUpperCase() && g[0] !== g[0].toLowerCase()) {
        genreMap[lower] = g;
      }
    });
  });

  console.log('Genre mapping (lowercase -> normalized):');
  Object.entries(genreMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([lower, normalized]) => {
      if (lower !== normalized.toLowerCase()) {
        console.log(`  "${lower}" -> "${normalized}"`);
      }
    });

  let updatedCount = 0;

  for (const movie of movies) {
    const original = movie.genre || [];
    const normalized = original.map((g) => genreMap[g.toLowerCase()] || g);

    // Check if anything changed
    const changed = original.some((g, i) => g !== normalized[i]);

    if (changed) {
      try {
        await sanity.patch(movie._id).set({ genre: normalized }).commit();
        updatedCount++;
        if (updatedCount % 100 === 0) {
          console.log(`  Updated ${updatedCount} movies so far...`);
        }
        await sleep(50);
      } catch (err) {
        console.error(`  Failed to update ${movie.title}: ${err.message}`);
      }
    }
  }

  console.log(`\n✅ Normalized genres for ${updatedCount} movies\n`);
  return updatedCount;
}

async function main() {
  console.log('Starting cleanup...\n');

  const deleted = await removeDuplicateMovies();
  const normalized = await normalizeGenres();

  // Final stats
  const totalMovies = await sanity.fetch('count(*[_type=="movie"])');
  const uniqueGenres = await sanity.fetch(
    'array::unique(*[_type=="movie"].genre[])'
  );

  console.log('\n=== FINAL STATS ===');
  console.log(`Total movies: ${totalMovies}`);
  console.log(`Duplicates removed: ${deleted}`);
  console.log(`Movies with normalized genres: ${normalized}`);
  console.log(`Unique genres: ${uniqueGenres.length}`);
  console.log(
    `Genres: ${uniqueGenres.sort().join(', ')}`
  );
}

main().catch(console.error);
