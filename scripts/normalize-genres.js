/**
 * Fast genre normalization script
 * Normalizes all genre values to Title Case in batches
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Normalize genre string to Title Case
function toTitleCase(s) {
  return s
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

async function main() {
  console.log('Normalizing genres...\n');

  const movies = await sanity.fetch('*[_type=="movie"]{_id, genre}');
  console.log(`Loaded ${movies.length} movies`);

  // Build all patch transactions in one transaction
  const patches = [];

  for (const movie of movies) {
    const original = movie.genre || [];
    const normalized = original.map(toTitleCase);
    const changed = original.some((g, i) => g !== normalized[i]);

    if (changed) {
      patches.push({
        patch: { id: movie._id, set: { genre: normalized } },
      });
    }
  }

  console.log(`Need to update ${patches.length} movies\n`);

  if (patches.length === 0) {
    console.log('All genres already normalized!');
    return;
  }

  // Execute in batches of 50 using Sanity transactions
  const BATCH_SIZE = 50;
  let totalUpdated = 0;

  for (let i = 0; i < patches.length; i += BATCH_SIZE) {
    const batch = patches.slice(i, i + BATCH_SIZE);
    try {
      await sanity.transaction(batch).commit();
      totalUpdated += batch.length;
      console.log(`  Updated ${totalUpdated}/${patches.length} movies...`);
      await sleep(100);
    } catch (err) {
      console.error(`  Batch error at ${i}: ${err.message}`);
      // Fall back to individual patches for this batch
      for (const op of batch) {
        try {
          await sanity.patch(op.patch.id, { set: op.patch.set }).commit();
          totalUpdated++;
          await sleep(50);
        } catch (e) {
          console.error(`    Patch ${op.patch.id} failed: ${e.message}`);
        }
      }
    }
  }

  console.log(`\n✅ Normalized genres for ${totalUpdated} movies`);

  // Verify
  const genres = await sanity.fetch('array::unique(*[_type=="movie"].genre[])');
  console.log(`\nUnique genres (${genres.length}):`);
  genres.sort().forEach((g) => console.log(`  ${g}`));
}

main().catch(console.error);
