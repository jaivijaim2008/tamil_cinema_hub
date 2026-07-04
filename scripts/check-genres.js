require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

(async () => {
  const total = await sanity.fetch('count(*[_type == "movie"])');
  console.log('Total movies:', total);

  const allMovies = await sanity.fetch('*[_type == "movie"]{_id, title, genre}');
  console.log('Fetched', allMovies.length, 'movies for genre check');

  const normalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const moviesNeedingFix = [];

  allMovies.forEach(m => {
    const genreArray = m.genre || [];
    const needsFix = genreArray.some(g => g !== normalize(g) && g.toLowerCase() === g);
    if (needsFix) {
      moviesNeedingFix.push(m);
    }
  });

  console.log('Movies with lowercase genres:', moviesNeedingFix.length);

  if (moviesNeedingFix.length > 0) {
    console.log('\nFirst 5 examples:');
    moviesNeedingFix.slice(0, 5).forEach(m => {
      console.log(' ', m.title, ':', (m.genre || []).join(', '));
    });

    let fixed = 0;
    const BATCH = 20;
    for (let i = 0; i < moviesNeedingFix.length; i += BATCH) {
      const batch = moviesNeedingFix.slice(i, i + BATCH);
      const tx = sanity.transaction();
      batch.forEach(m => {
        const normalized = (m.genre || []).map(g => normalize(g));
        tx.patch(m._id, { set: { genre: normalized } });
      });
      await tx.commit();
      fixed += batch.length;
      process.stdout.write(`\r  Fixed ${fixed}/${moviesNeedingFix.length}...`);
    }
    console.log('\n\nDone! Genre normalization complete.');

    // Deduplicate genres in each movie too
    const dedupeMovies = allMovies.filter(m => {
      const genreArr = m.genre || [];
      return genreArr.length !== new Set(genreArr).size;
    });

    if (dedupeMovies.length > 0) {
      console.log('\nMovies with duplicate genres (by value):', dedupeMovies.length);
      let dedupeFixed = 0;
      for (let i = 0; i < dedupeMovies.length; i += BATCH) {
        const batch = dedupeMovies.slice(i, i + BATCH);
        const tx = sanity.transaction();
        batch.forEach(m => {
          const unique = [...new Set(m.genre || [])];
          tx.patch(m._id, { set: { genre: unique } });
        });
        await tx.commit();
        dedupeFixed += batch.length;
        process.stdout.write(`\r  Deduped ${dedupeFixed}/${dedupeMovies.length}...`);
      }
      console.log('\nGenre deduplication complete.');
    }
  }

  // Final genre summary
  const allGenres = new Set();
  const rawCounts = {};
  const movies2 = await sanity.fetch('*[_type == "movie"]{genre}');
  movies2.forEach(m => {
    (m.genre || []).forEach(g => {
      rawCounts[g] = (rawCounts[g] || 0) + 1;
      allGenres.add(g.toLowerCase());
    });
  });

  console.log('\n--- Final Genre Summary ---');
  console.log('Unique genres (case-insensitive):', allGenres.size);

  const sorted = Object.entries(rawCounts).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([g, c]) => console.log(`  ${g}: ${c} movies`));

  const totalMovies = await sanity.fetch('count(*[_type == "movie"])');
  console.log('\nFinal total movies:', totalMovies);
})();
