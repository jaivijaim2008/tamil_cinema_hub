require('dotenv').config({path:'.env.local'});
const {createClient} = require('@sanity/client');
const c = createClient({projectId:'od67iigb',dataset:'production',apiVersion:'2024-01-01',useCdn:false});

async function check() {
  const movies = await c.fetch('*[_type=="movie"]{_id,title,year,posterUrl,poster,tmdbId} | order(year desc)[0...30]');
  
  console.log('Sample of 30 movies (latest first):\n');
  movies.forEach((m, i) => {
    const hasPosterAsset = m.poster && typeof m.poster === 'object';
    const hasPosterUrl = m.posterUrl && m.posterUrl.length > 0;
    const posterStatus = hasPosterAsset ? '✅ Sanity asset' : hasPosterUrl ? `✅ URL (${m.posterUrl.slice(0, 60)}...)` : '❌ NO POSTER';
    console.log(`${i+1}. ${m.title} (${m.year}) — ${posterStatus}${m.tmdbId ? ` [tmdbId: ${m.tmdbId}]` : ''}`);
  });

  // Count all
  const stats = await c.fetch(`{
    "total": count(*[_type=="movie"]),
    "withPosterAsset": count(*[_type=="movie" && defined(poster)]),
    "withPosterUrl": count(*[_type=="movie" && defined(posterUrl) && posterUrl != ""]),
    "noPoster": count(*[_type=="movie" && (!defined(poster) && (!defined(posterUrl) || posterUrl == ""))])
  }`);
  
  console.log('\n--- Totals ---');
  console.log('Total movies:', stats.total);
  console.log('With Sanity poster asset:', stats.withPosterAsset);
  console.log('With posterUrl string:', stats.withPosterUrl);
  console.log('Without any poster:', stats.noPoster);
  
  // Check if posterUrl empty strings exist
  const emptyUrls = await c.fetch('count(*[_type=="movie" && defined(posterUrl) && posterUrl == ""])');
  console.log('With empty posterUrl string (defined but empty):', emptyUrls);
  
  // Check next.config for remotePatterns
  console.log('\n--- Checking next.config.ts image domains ---');
  console.log('TMDB domain "image.tmdb.org" should be in remotePatterns');
}

check().catch(e => console.log('ERR:', e));
