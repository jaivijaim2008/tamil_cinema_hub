#!/usr/bin/env node
/**
 * patch-missing-posters.js
 * 
 * Finds all movies in Sanity with an empty posterUrl (and no Sanity poster asset),
 * fetches the poster path from TMDB using their tmdbId, and patches each movie
 * with the full TMDB poster URL.
 * 
 * Usage: node scripts/patch-missing-posters.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  if (!TMDB_KEY) {
    console.error('❌ TMDB_API_KEY not set in .env.local')
    process.exit(1)
  }
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error('❌ SANITY_WRITE_TOKEN not set in .env.local')
    process.exit(1)
  }

  // Find movies with empty posterUrl AND no Sanity poster asset
  const movies = await sanity.fetch(
    '*[_type == "movie" && (!defined(posterUrl) || posterUrl == "") && !defined(poster)]{_id, title, year, tmdbId}'
  )

  console.log(`Found ${movies.length} movies missing posters\n`)

  let patched = 0
  let failed = 0
  let noPoster = 0

  for (let i = 0; i < movies.length; i++) {
    const m = movies[i]
    const progress = `[${i + 1}/${movies.length}]`

    if (!m.tmdbId) {
      console.log(`${progress} ⏭️  ${m.title} (${m.year}) — no tmdbId, skipping`)
      failed++
      continue
    }

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${m.tmdbId}?api_key=${TMDB_KEY}&language=en-US`
      )

      if (!res.ok) {
        console.log(`${progress} ❌ ${m.title} (${m.year}) — TMDB ${res.status}`)
        failed++
        await sleep(300)
        continue
      }

      const data = await res.json()

      if (data.poster_path) {
        const posterUrl = `${TMDB_IMG}${data.poster_path}`
        await sanity.patch(m._id).set({ posterUrl }).commit()
        console.log(`${progress} ✅ ${m.title} (${m.year}) — patched`)
        patched++
      } else {
        console.log(`${progress} ⚠️  ${m.title} (${m.year}) — no poster on TMDB`)
        noPoster++
      }

      // Also patch backdrop if missing
      if (data.backdrop_path) {
        const backdropUrl = `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
        // Only patch if backdropUrl is also empty
        await sanity.fetch(`*[_id == "${m._id}" && (!defined(backdropUrl) || backdropUrl == "")][0]._id`).then(async (id) => {
          if (id) {
            await sanity.patch(m._id).set({ backdropUrl }).commit()
          }
        }).catch(() => {})
      }

      // Rate limit: 200ms between TMDB calls
      await sleep(200)
    } catch (err) {
      console.log(`${progress} ❌ ${m.title} (${m.year}) — error: ${err.message}`)
      failed++
      await sleep(500)
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Done!`)
  console.log(`  ✅ Patched:  ${patched}`)
  console.log(`  ⚠️  No poster on TMDB: ${noPoster}`)
  console.log(`  ❌ Failed:   ${failed}`)
  console.log(`  📊 Total:    ${movies.length}`)
}

main().catch((e) => {
  console.error('Fatal error:', e.message)
  process.exit(1)
})
