/**
 * CLEANUP & RESET
 * Fixes corrupted data from the previous GH Action run:
 * - Reset director fields that have genre names (Drama, Romance, etc.)
 * - Remove entries that are clearly not movies (numeric-only titles, empty short titles)
 * - Reset suspicious single-word entries to stubs for re-patching
 *
 * Usage: node scripts/cleanup-and-reset.js
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

const KNOWN_GENRES = new Set([
  'drama', 'romance', 'comedy', 'thriller', 'action', 'horror', 'fantasy',
  'musical', 'crime', 'mystery', 'sci-fi', 'biopic', 'western', 'animation',
  'documentary', 'adventure', 'suspense', 'family', 'sports', 'war', 'history',
  'political', 'supernatural', 'psychological', 'dark', 'black', 'period',
  'epic', 'masala', 'cult', 'noir', 'satire', 'tragedy', 'mythological',
  'devotional', 'social', 'experimental', 'parallel', 'silent', 'short',
])

async function main() {
  console.log('╔══════════════════════════════════════╗')
  console.log('║  DATA CLEANUP & RESET                ║')
  console.log('╚══════════════════════════════════════╝\n')

  const all = await sanity.fetch('*[_type == "movie"] { _id, title, year, director, cast, genre, rating, posterUrl, synopsis, ottPlatform, tmdbId }')
  console.log(`Total movies: ${all.length}\n`)

  // ── Step 1: Reset director fields that are genre names ──
  const badDirectors = all.filter(m => m.director && KNOWN_GENRES.has(m.director.toLowerCase().trim()))
  console.log(`Step 1: ${badDirectors.length} movies have genre-as-director — resetting director to empty`)

  const BATCH = 100
  for (let i = 0; i < badDirectors.length; i += BATCH) {
    const batch = badDirectors.slice(i, i + BATCH)
    const tx = sanity.transaction()
    batch.forEach(m => tx.patch(m._id, p => p.set({ director: '' })))
    await tx.commit()
  }
  console.log(`  ✅ Reset ${badDirectors.length} director fields\n`)

  // ── Step 2: Remove numeric-only titles (clearly not real movies) ──
  const numericTitles = all.filter(m => /^\d+$/.test(m.title.trim()))
  console.log(`Step 2: ${numericTitles.length} numeric-only titles — deleting`)

  for (let i = 0; i < numericTitles.length; i += BATCH) {
    const batch = numericTitles.slice(i, i + BATCH)
    const tx = sanity.transaction()
    batch.forEach(m => tx.delete(m._id))
    await tx.commit()
  }
  console.log(`  ✅ Deleted ${numericTitles.length} entries\n`)

  // ── Step 3: Remove entries where title is exactly a known genre name ──
  const genreTitleMovies = all.filter(m => KNOWN_GENRES.has(m.title.toLowerCase().trim()))
  // Don't delete if they have a TMDB ID (means it was a real match)
  const toDeleteGenreTitles = genreTitleMovies.filter(m => !m.tmdbId)
  console.log(`Step 3: ${toDeleteGenreTitles.length} genre-name titles without TMDB ID — deleting`)

  for (let i = 0; i < toDeleteGenreTitles.length; i += BATCH) {
    const batch = toDeleteGenreTitles.slice(i, i + BATCH)
    const tx = sanity.transaction()
    batch.forEach(m => tx.delete(m._id))
    await tx.commit()
  }
  console.log(`  ✅ Deleted ${toDeleteGenreTitles.length} entries\n`)

  // ── Step 4: Also reset poster/synopsis/rating on entries without TMDB ID
  //    (so the next GH Action run can properly patch them) ──
  const withoutTmdb = all.filter(m => !m.tmdbId && !numericTitles.find(n => n._id === m._id) && !toDeleteGenreTitles.find(d => d._id === m._id))
  console.log(`Step 4: ${withoutTmdb.length} entries without TMDB ID — resetting corrupted data`)

  const toReset = withoutTmdb.filter(m => {
    // Only reset if they have clearly wrong data
    const hasBadData = (
      (m.director && KNOWN_GENRES.has(m.director.toLowerCase().trim())) ||
      (m.cast && m.cast.length > 0 && typeof m.cast[0] !== 'string') ||
      (m.rating > 5) // TMDB rating was stored without scaling
    )
    return hasBadData
  })
  console.log(`  ${toReset.length} need field resets`)

  for (let i = 0; i < toReset.length; i += BATCH) {
    const batch = toReset.slice(i, i + BATCH)
    const tx = sanity.transaction()
    batch.forEach(m => {
      const updates = {}
      if (m.rating > 5) updates.rating = 0
      if (m.director && KNOWN_GENRES.has(m.director.toLowerCase().trim())) updates.director = ''
      tx.patch(m._id, p => p.set(updates))
    })
    await tx.commit()
  }
  console.log(`  ✅ Reset ${toReset.length} entries\n`)

  // ── Final Summary ──
  const remaining = await sanity.fetch('count(*[_type == "movie"])')
  console.log('══════════════════════════════════════')
  console.log(`🏁 Final count: ${remaining} movies`)
  console.log('   Deleted:', numericTitles.length + toDeleteGenreTitles.length)
  console.log('   Reset:', badDirectors.length + toReset.length)
  console.log('══════════════════════════════════════')
}

main().catch(err => { console.error('💥', err); process.exit(1) })
