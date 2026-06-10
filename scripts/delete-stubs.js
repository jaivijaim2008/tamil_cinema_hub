/**
 * DELETE STUBS
 * Removes movie entries that have only title+year and no other data.
 * These are Wikipedia imports that couldn't be matched on TMDB.
 *
 * Usage: node scripts/delete-stubs.js
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
  console.log('║  DELETE STUBS                        ║')
  console.log('╚══════════════════════════════════════╝\n')

  const all = await sanity.fetch('*[_type == "movie"] { _id, title, year, posterUrl, poster, synopsis, rating, ottPlatform, cast, director, genre, tmdbId }')
  console.log(`Total movies: ${all.length}`)

  // Find complete stubs — title+year only, nothing else
  const stubs = all.filter(m => {
    const hasPoster = m.posterUrl || m.poster
    const hasSynopsis = m.synopsis && m.synopsis.length > 5
    const hasRating = m.rating && m.rating > 0
    const hasOtt = m.ottPlatform
    const hasCast = m.cast && m.cast.length > 0
    const hasDirector = m.director
    const hasGenre = m.genre && m.genre.length > 0
    const hasTmdb = m.tmdbId
    return !hasPoster && !hasSynopsis && !hasRating && !hasOtt && !hasCast && !hasDirector && !hasGenre && !hasTmdb
  })

  console.log(`\nStubs to delete: ${stubs.length}`)

  if (stubs.length === 0) {
    console.log('✅ No stubs to delete!')
    return
  }

  // Show breakdown
  const byYear = {}
  stubs.forEach(m => { byYear[m.year] = (byYear[m.year] || 0) + 1 })
  console.log('\nBreakdown by year:')
  Object.entries(byYear)
    .sort((a, b) => b[0] - a[0])
    .forEach(([y, c]) => console.log(`  ${y}: ${c}`))

  // Delete in batches
  const BATCH = 100
  let deleted = 0
  for (let i = 0; i < stubs.length; i += BATCH) {
    const batch = stubs.slice(i, i + BATCH)
    const tx = sanity.transaction()
    batch.forEach(m => tx.delete(m._id))
    await tx.commit()
    deleted += batch.length
    process.stdout.write(`  🗑️ [${deleted}/${stubs.length}] deleted\r`)
  }

  console.log(`\n\n✅ Deleted ${deleted} stub entries`)

  // Final count
  const remaining = await sanity.fetch('count(*[_type == "movie"])')
  console.log(`🏁 Remaining movies: ${remaining}`)
}

main().catch(err => { console.error('💥', err); process.exit(1) })
