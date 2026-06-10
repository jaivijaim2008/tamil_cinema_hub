/**
 * DELETE INCOMPLETE MOVIES
 * Removes movies that are missing at least one required data field.
 * Keeps only movies with ALL: poster, synopsis, rating, OTT, cast, director, genre
 *
 * Usage: node scripts/delete-incomplete.js
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

async function main() {
  console.log('╔══════════════════════════════════════╗')
  console.log('║  DELETE INCOMPLETE MOVIES            ║')
  console.log('╚══════════════════════════════════════╝\n')

  const all = await sanity.fetch('*[_type == "movie"] { _id, title, year, posterUrl, poster, synopsis, rating, ottPlatform, cast, director, genre }')
  console.log(`Total movies: ${all.length}\n`)

  // Find complete movies — have ALL fields
  const complete = all.filter(m => {
    const hasPoster = m.posterUrl || m.poster
    const hasSynopsis = m.synopsis && m.synopsis.length > 5
    const hasRating = m.rating && m.rating > 0
    const hasOtt = m.ottPlatform
    const hasCast = m.cast && m.cast.length > 0
    const hasDirector = m.director
    const hasGenre = m.genre && m.genre.length > 0
    return hasPoster && hasSynopsis && hasRating && hasOtt && hasCast && hasDirector && hasGenre
  })

  const toDelete = all.filter(m => !complete.find(c => c._id === m._id))
  
  console.log(`✅ Complete movies (keep): ${complete.length}`)
  console.log(`🗑️ Incomplete movies (delete): ${toDelete.length}`)

  if (toDelete.length === 0) {
    console.log('\n✅ No incomplete movies to delete!')
    return
  }

  // Show gap breakdown
  const gaps = { poster: 0, synopsis: 0, rating: 0, ott: 0, cast: 0, dir: 0, genre: 0 }
  toDelete.forEach(m => {
    if (!m.posterUrl && !m.poster) gaps.poster++
    if (!m.synopsis || m.synopsis.length < 5) gaps.synopsis++
    if (!m.rating || m.rating === 0) gaps.rating++
    if (!m.ottPlatform) gaps.ott++
    if (!m.cast || m.cast.length === 0) gaps.cast++
    if (!m.director) gaps.dir++
    if (!m.genre || m.genre.length === 0) gaps.genre++
  })
  console.log('\nBreakdown of missing fields in deleted movies:')
  Object.entries(gaps).forEach(([f, c]) => console.log(`  ${f}: ${c}`))

  // Show year distribution
  const byYear = {}
  toDelete.forEach(m => { byYear[m.year] = (byYear[m.year] || 0) + 1 })
  console.log('\nBy year (top 10):')
  Object.entries(byYear)
    .sort((a, b) => b[0] - a[0])
    .slice(0, 10)
    .forEach(([y, c]) => console.log(`  ${y}: ${c} deleted`))

  // Delete in batches
  const BATCH = 100
  let deleted = 0
  for (let i = 0; i < toDelete.length; i += BATCH) {
    const batch = toDelete.slice(i, i + BATCH)
    const tx = sanity.transaction()
    batch.forEach(m => tx.delete(m._id))
    await tx.commit()
    deleted += batch.length
    process.stdout.write(`  🗑️ [${deleted}/${toDelete.length}] deleted\r`)
  }

  console.log(`\n\n✅ Deleted ${deleted} incomplete movies`)

  // Final count
  const remaining = await sanity.fetch('count(*[_type == "movie"])')
  console.log(`🏁 Remaining movies: ${remaining} (all complete!)`)
}

main().catch(err => { console.error('💥', err); process.exit(1) })
