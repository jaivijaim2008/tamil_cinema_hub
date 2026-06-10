/**
 * MASTER DATA PATCHER v1
 * Fills ALL missing data for ALL 5,338 movies:
 *   - Posters, synopsis, ratings → TMDB API (free, 50 req/s)
 *   - OTT platforms → TMDB watch/providers
 *   - Cast → TMDB credits
 * Falls back to Wikipedia infobox scraping when TMDB doesn't find a match.
 *
 * Usage: node scripts/patch-all-data.js [--batch-size=50]
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const cheerio = require('cheerio')
const he = require('he')
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))
const fs = require('fs')
const path = require('path')

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'
const WIKI_API = 'https://en.wikipedia.org/w/api.php'
const CONCURRENCY = 10 // Parallel TMDB requests
const CACHE_FILE = path.join(__dirname, '..', 'tmdb-cache.json')

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ---------- TMDB API ----------
const tmdbFetch = async (url, retries = 2) => {
  for (let a = 1; a <= retries; a++) {
    try {
      const res = await fetch(url)
      if (res.status === 429) { const w = 2000 * a; console.log(`  ⏳ TMDB rate limit, waiting ${w}ms`); await sleep(w); continue }
      if (!res.ok) return null
      return await res.json()
    } catch { await sleep(1000 * a); continue }
  }
  return null
}

const searchTMDB = async (title, year) => {
  const q = encodeURIComponent(title.replace(/[^a-zA-Z0-9 ]/g, '').trim())
  const data = await tmdbFetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${q}&year=${year}&primary_release_year=${year}&language=en-US&region=IN`
  )
  if (!data?.results?.length) return null
  // Find best match: exact title match preferred
  const tl = title.toLowerCase().trim()
  const exact = data.results.find(r => r.title?.toLowerCase().trim() === tl || r.original_title?.toLowerCase().trim() === tl)
  return exact || data.results[0]
}

const getMovieDetails = async (tmdbId) => {
  return tmdbFetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_KEY}&append_to_response=credits,watch/providers&language=en-US`)
}

// ---------- Wikipedia fallback ----------
const wikiParse = async (title, year) => {
  const tries = [`${title} (${year} film)`, `${title} (film)`, title]
  for (const t of tries) {
    const url = `${WIKI_API}?action=parse&page=${encodeURIComponent(t)}&prop=text&format=json&redirects=1`
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'TamilCinemaHub/1.0' } })
      if (!res.ok) continue
      const data = await res.json()
      if (!data?.parse?.text) continue
      const $ = cheerio.load(data.parse.text['*'])
      const info = $('.infobox')
      if (!info.length) continue

      let director = '', posterUrl = '', synopsis = ''
      const castSet = new Set()

      info.find('tr').each((_, row) => {
        const h = $(row).find('th').first().text().toLowerCase().trim()
        const d = $(row).find('td').first()
        if (h === 'directed by') director = d.text().replace(/\[\d+\]/g, '').trim()
        else if (h === 'starring' || h === 'cast') {
          d.find('a').each((_, a) => { const n = $(a).text().trim(); if (n) castSet.add(n) })
        }
      })

      const p = $('p').first().text().replace(/\[\d+\]/g, '').trim()
      if (p.length > 40) synopsis = p.substring(0, 500) + (p.length > 500 ? '…' : '')

      const img = info.find('img').first()
      if (img.length) {
        let src = img.attr('src') || ''
        if (src && !src.startsWith('http')) src = 'https:' + src
        if (src) posterUrl = src.replace(/\/\d+px-/, '/480px-')
      }
      return { director, cast: Array.from(castSet), synopsis, posterUrl }
    } catch { continue }
  }
  return null
}

// ---------- Sanity ----------
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// ---------- Main ----------
async function main() {
  const args = process.argv.slice(2)
  const batchSize = parseInt(args.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '50')
  const limitYear = args.find(a => a.startsWith('--year='))?.split('=')[1]
  const skipDetect = args.includes('--skip-detect')
  const justCache = args.includes('--just-cache')

  console.log(`\n╔════════════════════════════════════╗`)
  console.log(`║  MASTER DATA PATCHER v1           ║`)
  console.log(`║  Fills missing movie data          ║`)
  console.log(`╚════════════════════════════════════╝\n`)

  // Load TMDB cache
  let tmdbCache = {}
  if (fs.existsSync(CACHE_FILE)) {
    tmdbCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
    console.log(`📂 TMDB cache loaded: ${Object.keys(tmdbCache).length} entries`)
  }

  // Get all movies from Sanity
  let query = '*[_type == "movie"] | order(year desc) { _id, title, year, slug, director, cast, synopsis, posterUrl, poster, rating, ottPlatform }'
  const allMovies = await sanity.fetch(query)
  console.log(`📡 All movies: ${allMovies.length}`)

  // Filter to just ones needing data
  const needy = allMovies.filter(m => {
    if (limitYear && m.year !== parseInt(limitYear)) return false
    return (!m.posterUrl && !m.poster) || !m.synopsis || !m.rating || m.rating === 0 || !m.ottPlatform || !m.cast || m.cast.length === 0 || !m.director
  })

  if (needy.length === 0) { console.log('✅ No movies need patching!'); return }

  console.log(`🔧 Movies needing patches: ${needy.length}`)
  console.log(`   Batch size: ${batchSize}, Concurrency: ${CONCURRENCY}\n`)

  if (justCache) {
    // Phase 1: Only build TMDB cache (search + details)
    console.log('📸 Phase 1: Building TMDB cache...\n')
    await buildCache(needy, tmdbCache)
    return
  }

  // Phase 1: Build cache if needed
  await buildCache(needy, tmdbCache)

  // Phase 2: Patch Sanity
  console.log(`\n🔧 Phase 2: Patching Sanity...`)
  let patched = 0, skipped = 0, errors = 0, wikiFallback = 0

  for (let i = 0; i < needy.length; i += batchSize) {
    const batch = needy.slice(i, i + batchSize)
    const updates = []

    for (const movie of batch) {
      const cacheKey = `${movie.title}||${movie.year}`
      const cached = tmdbCache[cacheKey]

      if (!cached || (!cached.tmdbData && !cached.wikiData)) {
        skipped++
        continue
      }

      const setFields = {}

      // Prefer TMDB data, fallback to Wikipedia
      const src = cached.tmdbData || cached.wikiData

      if ((!movie.posterUrl && !movie.poster) && src.posterUrl) setFields.posterUrl = src.posterUrl
      if (!movie.synopsis && src.synopsis) setFields.synopsis = src.synopsis
      if ((!movie.rating || movie.rating === 0) && src.rating) setFields.rating = src.rating
      if (!movie.ottPlatform && src.ottPlatform) setFields.ottPlatform = src.ottPlatform
      if ((!movie.cast || movie.cast.length === 0) && src.cast?.length) setFields.cast = src.cast
      if (!movie.director && src.director) setFields.director = src.director

      if (Object.keys(setFields).length > 0) {
        updates.push({ id: movie._id, fields: setFields, title: movie.title })
      } else {
        skipped++
      }
    }

    // Commit batch
    if (updates.length > 0) {
      const tx = sanity.transaction()
      for (const u of updates) {
        tx.patch(u.id).set(u.fields)
      }
      try {
        await tx.commit()
        patched += updates.length
      } catch {
        // Fallback to individual patches
        for (const u of updates) {
          try { await sanity.patch(u.id).set(u.fields).commit(); patched++ }
          catch { errors++ }
        }
      }
    }

    process.stdout.write(`  📦 [${Math.min(i + batchSize, needy.length)}/${needy.length}] Patched: ${patched} | Skipped: ${skipped} | Errors: ${errors} | Wiki: ${wikiFallback}\r`)
  }

  console.log(`\n\n📊 RESULTS`)
  console.log(`   ✅ Patched: ${patched}`)
  console.log(`   ⏭️  Skipped (no source): ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`   🌐 Wikipedia fallbacks: ${wikiFallback}`)

  const gaps = await sanity.fetch(`{ "noPoster": count(*[_type == "movie" && (!defined(poster) && (!defined(posterUrl)||posterUrl==""))]), "noSynopsis": count(*[_type == "movie" && (!defined(synopsis)||synopsis=="")]), "noRating": count(*[_type == "movie" && (!defined(rating)||rating==0)]), "noOtt": count(*[_type == "movie" && (!defined(ottPlatform)||ottPlatform=="")]), "noCast": count(*[_type == "movie" && (!defined(cast)||cast==[])]) }`)
  console.log(`\n📊 REMAINING GAPS: Poster:${gaps.noPoster} Synopsis:${gaps.noSynopsis} Rating:${gaps.noRating} OTT:${gaps.noOtt} Cast:${gaps.noCast}`)
}

async function buildCache(needy, tmdbCache) {
  let cached = Object.keys(tmdbCache).length
  let notFound = 0

  // Phase 1a: Search TMDB for each movie
  const toSearch = needy.filter(m => {
    const key = `${m.title}||${m.year}`
    return !tmdbCache[key] || !tmdbCache[key].searched
  })

  if (toSearch.length === 0) {
    console.log(`📸 TMDB cache already built (${cached} entries)`)
    return
  }

  console.log(`📸 Phase 1: Searching ${toSearch.length} movies on TMDB...`)

  // Process in batches with concurrency control
  for (let i = 0; i < toSearch.length; i += CONCURRENCY) {
    const batch = toSearch.slice(i, i + CONCURRENCY)
    await Promise.allSettled(batch.map(async (movie) => {
      const key = `${movie.title}||${movie.year}`
      try {
        const result = await searchTMDB(movie.title, movie.year)
        if (result) {
          const details = await getMovieDetails(result.id)
          if (details) {
            const providers = details['watch/providers']?.results?.IN || details['watch/providers']?.results?.US
            const ottPlatforms = providers?.flatrate?.map(p => p.provider_name).join(', ') || ''
            const cast = details.credits?.cast?.slice(0, 10).map(c => c.name) || []

            tmdbCache[key] = {
              searched: true,
              tmdbData: {
                posterUrl: details.poster_path ? `${TMDB_IMG}${details.poster_path}` : '',
                synopsis: details.overview || '',
                rating: details.vote_average || 0,
                ottPlatform: ottPlatforms,
                cast,
                director: details.credits?.crew?.find(c => c.job === 'Director')?.name || '',
              }
            }
          }
        } else {
          // Try Wikipedia fallback
          const wiki = await wikiParse(movie.title, movie.year)
          if (wiki) {
            tmdbCache[key] = {
              searched: true,
              wikiData: {
                posterUrl: wiki.posterUrl || '',
                synopsis: wiki.synopsis || '',
                rating: 0,
                ottPlatform: '',
                cast: wiki.cast || [],
                director: wiki.director || '',
              }
            }
          } else {
            tmdbCache[key] = { searched: true, tmdbData: null, wikiData: null }
            notFound++
          }
        }
      } catch {
        tmdbCache[key] = { searched: true, tmdbData: null }
        notFound++
      }
    }))

    if ((i + CONCURRENCY) % 50 === 0 || i + CONCURRENCY >= toSearch.length) {
      process.stdout.write(`  🔍 [${Math.min(i + CONCURRENCY, toSearch.length)}/${toSearch.length}] Cached: ${Object.keys(tmdbCache).length - cached} | Not found: ${notFound}\r`)
    }

    // Save cache periodically
    if ((i + CONCURRENCY) % 200 === 0) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(tmdbCache, null, 2))
    }
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(tmdbCache, null, 2))
  console.log(`\n  ✅ TMDB cache saved: ${Object.keys(tmdbCache).length} entries (${notFound} not found)`)
}

main().catch(err => { console.error('💥', err); process.exit(1) })
