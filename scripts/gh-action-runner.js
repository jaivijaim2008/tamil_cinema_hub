/**
 * GITHUB ACTIONS RUNNER
 * Runs the full import + patch pipeline on GitHub's servers.
 * - Wikipedia for new movie titles
 * - TMDB for ratings, posters, synopsis, OTT, cast, director
 * - Wikipedia fallback for movies TMDB doesn't have
 *
 * This script is designed to run in GitHub Actions (where both APIs work).
 *
 * Usage: node scripts/gh-action-runner.js [--years=2025,2026]
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
const CURRENT_YEAR = new Date().getFullYear()
const CACHE_FILE = path.join(__dirname, '..', 'tmdb-cache.json')

const KNOWN_GENRES = new Set([
  'drama','romance','comedy','thriller','action','horror','fantasy','musical','crime',
  'mystery','sci-fi','biopic','western','animation','documentary','adventure','suspense',
  'family','sports','war','history','political','supernatural','psychological','period',
  'epic','masala','cult','noir','satire','tragedy','mythological','devotional','social'
])

const sleep = ms => new Promise(r => setTimeout(r, ms))
const cleanText = t => t ? he.decode(t.replace(/\[\d+\]/g, '').replace(/<[^>]*>/g, '')).trim() : ''
const makeSlug = (t, y) => t.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').trim() + '-' + y
const normalizeTitle = t => t.toLowerCase().replace(/[^a-z0-9]/g, '').trim()

// Filter out titles that are clearly not real movies
function isBadTitle(title) {
  const t = title.toLowerCase().trim()
  // Numeric-only titles
  if (/^\d+$/.test(t)) return true
  // Exact genre names
  if (KNOWN_GENRES.has(t)) return true
  // Single word, short, no spaces — likely a person name or random word
  if (t.split(/\s+/).length === 1 && t.length >= 2 && t.length <= 20 && !t.includes('-') && !t.includes('.')) return true
  return false
}

// Normalized title similarity for TMDB matching
function titleSimilarity(a, b) {
  const na = normalizeTitle(a), nb = normalizeTitle(b)
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.9
  // Count matching words
  const wa = na.split(/\s+/).filter(Boolean)
  const wb = nb.split(/\s+/).filter(Boolean)
  const matches = wa.filter(w => wb.includes(w)).length
  const longer = Math.max(wa.length, wb.length)
  return longer > 0 ? matches / longer : 0
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// ─── PHASE 1: Import new complete movies only ───
// Only creates a movie if TMDB returns ALL required fields:
// poster, synopsis, rating, OTT, cast, director, genre
// Movies missing any field are SKIPPED entirely (no stubs)
async function phase1Import(years) {
  console.log('\n═══════════════════════════════════')
  console.log('PHASE 1: Import new COMPLETE movies only')
  console.log('(Only creates movies with ALL data from TMDB)')
  console.log('═══════════════════════════════════\n')

  // Build year list — default to only current year for auto-fetch
  const yearList = (years && years.length > 0) ? years : []
  if (yearList.length === 0) {
    // Auto-fetch: only check recent years for new releases
    for (let y = Math.max(2024, CURRENT_YEAR - 1); y <= CURRENT_YEAR; y++) yearList.push(y)
  }
  
  // Get all existing movie titles from Sanity
  const existing = await sanity.fetch('*[_type == "movie"] { title, year }')
  const existingSet = new Set(existing.map(m => normalizeTitle(m.title) + '-' + m.year))
  console.log(`Existing movies in Sanity: ${existing.length}`)

  let totalCreated = 0, totalSkipped = 0, totalErrors = 0

  for (const year of yearList) {
    console.log(`\n📋 ${year}: Fetching Wikipedia list...`)
    const movies = await loadTitlesFromWiki(year)
    if (!movies.length) { console.log(`  ${year}: No movies found`); continue }

    // Filter to new movies only (not in Sanity, not bad titles)
    const candidates = movies.filter(m => !existingSet.has(normalizeTitle(m.title) + '-' + m.year) && !isBadTitle(m.title))
    if (!candidates.length) { console.log(`  ${year}: 0 new movies`); continue }
    
    console.log(`  ${candidates.length} new candidates found, checking TMDB...`)

    // Process each candidate through TMDB
    for (const movie of candidates) {
      try {
        // Search TMDB
        const q = encodeURIComponent(movie.title.replace(/[^a-zA-Z0-9 ]/g, '').trim())
        const search = await tmdbFetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${q}&year=${year}&primary_release_year=${year}&language=en-US&region=IN`
        )
        if (!search?.results?.length) { totalSkipped++; continue }

        const best = search.results[0]

        // Verify year match
        const matchYear = best.release_date ? parseInt(best.release_date.substring(0, 4)) : null
        const yearDiff = matchYear ? Math.abs(matchYear - year) : 99
        if (yearDiff > 1) { totalSkipped++; continue }

        // Verify title similarity
        if (titleSimilarity(movie.title, best.title) < 0.4) { totalSkipped++; continue }

        // Get full details
        const details = await tmdbFetch(
          `https://api.themoviedb.org/3/movie/${best.id}?api_key=${TMDB_KEY}&append_to_response=credits,watch/providers&language=en-US`
        )
        if (!details) { totalSkipped++; continue }

        // Extract all fields
        const posterPath = details.poster_path
        const overview = details.overview
        const tmdbRating = details.vote_average
        const prov = details['watch/providers']?.results?.IN || details['watch/providers']?.results?.US
        const ottPlatforms = prov?.flatrate?.map(p => p.provider_name).join(', ') || ''
        const cast = details.credits?.cast?.slice(0, 10).map(c => c.name) || []
        const director = details.credits?.crew?.find(c => c.job === 'Director')?.name || ''
        const genres = (details.genres || []).map(g => g.name)

        // Check ALL required fields are present and valid
        const posterUrl = posterPath ? `${TMDB_IMG}${posterPath}` : ''
        const synopsis = overview ? overview.substring(0, 500) : ''
        const rating = tmdbRating ? Math.round((tmdbRating / 2) * 10) / 10 : 0

        const hasPoster = !!posterUrl
        const hasSynopsis = synopsis.length > 10
        const hasRating = rating > 0
        const hasOtt = !!ottPlatforms
        const hasCast = cast.length > 0
        const hasDirector = !!director
        const hasGenre = genres.length > 0

        if (hasPoster && hasSynopsis && hasRating && hasOtt && hasCast && hasDirector && hasGenre) {
          // ALL data available — create the movie
          await sanity.create({
            _type: 'movie',
            title: movie.title,
            slug: { _type: 'slug', current: makeSlug(movie.title, year) },
            year: year,
            director: director,
            cast: cast,
            genre: genres,
            synopsis: synopsis,
            posterUrl: posterUrl,
            rating: rating,
            ottPlatform: ottPlatforms,
            tmdbId: best.id,
          })
          totalCreated++
          process.stdout.write(`  ✅ Created: ${movie.title} (${year}) ★${rating} | ${genres.slice(0,2).join(', ')} | ${ottPlatforms}\r\n`)
        } else {
          // Missing some data — skip entirely
          const missing = []
          if (!hasPoster) missing.push('poster')
          if (!hasSynopsis) missing.push('synopsis')
          if (!hasRating) missing.push('rating')
          if (!hasOtt) missing.push('OTT')
          if (!hasCast) missing.push('cast')
          if (!hasDirector) missing.push('director')
          if (!hasGenre) missing.push('genre')
          totalSkipped++
        }
      } catch {
        totalErrors++
      }

      await sleep(200) // TMDB rate limiting
    }
  }

  console.log(`\n══════════════════════════════════════`)
  console.log(`✅ Phase 1 complete`)
  console.log(`   📗 Created (complete): ${totalCreated}`)
  console.log(`   📕 Skipped (incomplete): ${totalSkipped}`)
  console.log(`   ❌ Errors: ${totalErrors}`)
  console.log(`══════════════════════════════════════`)
}

async function loadTitlesFromWiki(year) {
  const data = await wikiFetch(`List of Tamil films of ${year}`)
  if (!data?.parse?.text) return []

  const $ = cheerio.load(data.parse.text['*'])
  const movies = []
  const monthRe = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i

  $('table.wikitable').each((_, table) => {
    const rows = $(table).find('tr')
    if (rows.length < 2) return
    const $hr = rows.first()
    const cols = detectColumns($, $hr)
    if (cols.title === -1) return
    const ht = $hr.text().toLowerCase()
    if (ht.includes('gross') || ht.includes('rank') || ht.includes('box office') || ht.includes('award')) return

    let currentDate = '', dateRowspan = 0
    rows.each((ri, row) => {
      if (ri === 0) return
      const cells = $(row).find('td')
      const allCells = $(row).find('td, th')
      if (allCells.first().get(0)?.tagName === 'th') {
        const m = cleanText(allCells.first().text())
        if (monthRe.test(m)) { currentDate = m; dateRowspan = 0 }
        return
      }
      if (cells.length < 2) return
      const fc = cells.first()
      const dr = !!fc.attr('rowspan')
      const noDate = cols.opening === -1
      if (dr) { currentDate = cleanText(fc.text()); dateRowspan = parseInt(fc.attr('rowspan')) - 1 }
      else if (dateRowspan > 0) dateRowspan--
      else if (cols.opening >= 0) currentDate = cleanText(fc.text())
      const dm = dateRowspan > 0 && cols.opening >= 0
      const ai = ci => ci === -1 ? -1 : (ci + (dm ? 1 : 0)) < cells.length ? ci + (dm ? 1 : 0) : -1
      const tIdx = noDate ? cols.title : ai(cols.title)
      if (tIdx === -1 || tIdx >= cells.length) return
      const tc = cells.eq(tIdx)
      const link = tc.find('a').first()
      const title = cleanText(link.length ? link.text() : tc.text())
      if (!title || title.length < 2 || monthRe.test(title)) return
      let director = '', castA = []
      const dIdx = noDate ? cols.director : ai(cols.director)
      const cIdx = noDate ? cols.cast : ai(cols.cast)
      if (dIdx >= 0 && dIdx < cells.length) director = cleanText(cells.eq(dIdx).text())
      if (cIdx >= 0 && cIdx < cells.length) {
        const raw = cleanText(cells.eq(cIdx).text())
        castA = raw.split(/,|\band\b|&|\//).map(s => s.trim()).filter(s => s.length > 1)
      }
      movies.push({ title, year, director, cast: castA })
    })
  })

  const seen = new Set()
  return movies.filter(m => { const k = normalizeTitle(m.title) + '-' + m.year; if (seen.has(k)) return false; seen.add(k); return true })
}

// ─── PHASE 2: Patch with TMDB data ───
async function phase2PatchTMDB() {
  console.log('\n═══════════════════════════════════')
  console.log('PHASE 2: Patch missing data from TMDB')
  console.log('═══════════════════════════════════\n')

  // Load cache
  let cache = {}
  if (fs.existsSync(CACHE_FILE)) cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))

  // Get all movies
  const movies = await sanity.fetch('*[_type == "movie"] { _id, title, year, director, cast, synopsis, posterUrl, poster, rating, ottPlatform }')
  console.log(`Total: ${movies.length}`)

  // Filter to ones needing data
  const needy = movies.filter(m => {
    return (!m.posterUrl && !m.poster) || !m.synopsis || !m.rating || m.rating === 0 || !m.ottPlatform || !m.cast || m.cast.length === 0 || !m.director || !m.genre || m.genre.length === 0
  })
  console.log(`Need TMDB data: ${needy.length}`)

  if (!needy.length) { console.log('✅ All movies have data!'); return }

  const CONCURRENCY = 30 // GitHub Actions has fast network
  let patched = 0, notFound = 0, errors = 0

  for (let i = 0; i < needy.length; i += CONCURRENCY) {
    const batch = needy.slice(i, i + CONCURRENCY)
    await Promise.allSettled(batch.map(async (movie) => {
      const key = `${movie.title}||${movie.year}`
      if (cache[key]?.done) return

      try {
        // Search TMDB
        const q = encodeURIComponent(movie.title.replace(/[^a-zA-Z0-9 ]/g, '').trim())
        const search = await tmdbFetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${q}&year=${movie.year}&primary_release_year=${movie.year}&language=en-US&region=IN`
        )
        if (!search?.results?.length) { cache[key] = { done: true, found: false }; notFound++; return }

        // Verify the match — check year and title similarity
        const best = search.results[0]
        
        // Year must match (or be within 1 year for edge cases)
        const matchYear = best.release_date ? parseInt(best.release_date.substring(0, 4)) : null
        const yearDiff = matchYear ? Math.abs(matchYear - movie.year) : 99
        if (yearDiff > 1) { cache[key] = { done: true, found: false }; notFound++; return }
        
        // Title should be reasonably similar
        const sim = titleSimilarity(movie.title, best.title)
        if (sim < 0.4) { cache[key] = { done: true, found: false }; notFound++; return }
        
        const details = await tmdbFetch(
          `https://api.themoviedb.org/3/movie/${best.id}?api_key=${TMDB_KEY}&append_to_response=credits,watch/providers&language=en-US`
        )
        if (!details) { cache[key] = { done: true, found: false }; notFound++; return }

        const prov = details['watch/providers']?.results?.IN || details['watch/providers']?.results?.US
        const ottPlatforms = prov?.flatrate?.map(p => p.provider_name).join(', ') || ''
        const cast = details.credits?.cast?.slice(0, 10).map(c => c.name) || []
        const director = details.credits?.crew?.find(c => c.job === 'Director')?.name || ''
        const genres = (details.genres || []).map(g => g.name)

        const updates = { tmdbId: best.id }
        if ((!movie.posterUrl && !movie.poster) && details.poster_path) updates.posterUrl = `${TMDB_IMG}${details.poster_path}`
        if (!movie.synopsis && details.overview) updates.synopsis = details.overview?.substring(0, 500) || ''
        // Convert TMDB's 0-10 scale to 0-5
        if ((!movie.rating || movie.rating === 0) && details.vote_average) updates.rating = Math.round((details.vote_average / 2) * 10) / 10
        if (!movie.ottPlatform && ottPlatforms) updates.ottPlatform = ottPlatforms
        if ((!movie.cast || movie.cast.length === 0) && cast.length) updates.cast = cast
        if (!movie.director && director) updates.director = director
        if ((!movie.genre || movie.genre.length === 0) && genres.length) updates.genre = genres

        if (Object.keys(updates).length > 0) {
          await sanity.patch(movie._id).set(updates).commit()
          patched++
        }
        cache[key] = { done: true, found: true }
      } catch { cache[key] = { done: true, found: false }; errors++ }
    }))

    const done = Math.min(i + CONCURRENCY, needy.length)
    process.stdout.write(`  📊 [${done}/${needy.length}] P:${patched} N:${notFound} E:${errors}\r`)

    if (done % 200 === 0 || done >= needy.length) fs.writeFileSync(CACHE_FILE, JSON.stringify(cache))

    // Delay between batches to avoid TMDB rate limiting
    if (i + CONCURRENCY < needy.length) await sleep(1000)
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache))
  console.log(`\n✅ Phase 2 complete: ${patched} patched, ${notFound} not found, ${errors} errors`)
}

// ─── PHASE 3: Wikipedia fallback ───
async function phase3WikiFallback() {
  console.log('\n═══════════════════════════════════')
  console.log('PHASE 3: Wikipedia fallback for remaining gaps')
  console.log('═══════════════════════════════════\n')

  const movies = await sanity.fetch('*[_type == "movie"] { _id, title, year, director, cast, synopsis, posterUrl, poster }')
  const needy = movies.filter(m => (!m.posterUrl && !m.poster) || !m.synopsis || m.synopsis.length < 10 || !m.director || !m.cast || m.cast.length === 0)
  console.log(`Need Wikipedia patch: ${needy.length}`)
  if (!needy.length) { console.log('✅ All done!'); return }

  let patched = 0, notFound = 0, errors = 0
  const CONCURRENCY = 5

  for (let i = 0; i < needy.length; i += CONCURRENCY) {
    const batch = needy.slice(i, i + CONCURRENCY)
    await Promise.allSettled(batch.map(async (movie) => {
      try {
        const tries = [`${movie.title} (${movie.year} film)`, `${movie.title} (film)`, movie.title]
        for (const t of tries) {
          const data = await wikiFetch(t)
          if (!data?.parse?.text) continue
          const $ = cheerio.load(data.parse.text['*'])
          const info = $('.infobox')
          if (!info.length) continue

          let director = '', posterUrl = '', synopsis = ''
          const castSet = new Set()
          info.find('tr').each((_, row) => {
            const h = $(row).find('th').first().text().toLowerCase().trim()
            const d = $(row).find('td').first()
            if (h === 'directed by') director = cleanText(d.text())
            else if (h === 'starring' || h === 'cast') {
              d.find('a').each((_, a) => { const n = cleanText($(a).text()); if (n) castSet.add(n) })
            }
          })
          const fp = $('p').first().text().replace(/\[\d+\]/g, '').trim()
          if (fp.length > 40) synopsis = fp.substring(0, 500)
          const img = info.find('img').first()
          if (img.length) {
            let src = img.attr('src') || ''
            if (src && !src.startsWith('http')) src = 'https:' + src
            if (src) posterUrl = src.replace(/\/\d+px-/, '/480px-')
          }

          const updates = {}
          if ((!movie.posterUrl && !movie.poster) && posterUrl) updates.posterUrl = posterUrl
          if ((!movie.synopsis || movie.synopsis.length < 10) && synopsis) updates.synopsis = synopsis
          if (!movie.director && director) updates.director = director
          if ((!movie.cast || movie.cast.length === 0) && castSet.size) updates.cast = Array.from(castSet).filter(n => n.length > 1)

          if (Object.keys(updates).length > 0) {
            await sanity.patch(movie._id).set(updates).commit()
            patched++
          }
          return // Found a match, no need to try more titles
        }
        notFound++
      } catch { errors++ }
    }))

    const done = Math.min(i + CONCURRENCY, needy.length)
    process.stdout.write(`  📊 [${done}/${needy.length}] P:${patched} N:${notFound} E:${errors}\r`)
    if (i + CONCURRENCY < needy.length) await sleep(500)
  }

  console.log(`\n✅ Phase 3 complete: ${patched} patched, ${notFound} not found, ${errors} errors`)
}

// ─── HELPERS ───
async function wikiFetch(title, retries = 2) {
  for (let a = 1; a <= retries; a++) {
    try {
      const url = `${WIKI_API}?action=parse&page=${encodeURIComponent(title)}&prop=text&format=json&redirects=1`
      const res = await fetch(url, { headers: { 'User-Agent': 'TamilCinemaHub/1.0 (GH Actions)' }, signal: AbortSignal.timeout(10000) })
      if (res.status === 429) { await sleep(5000 * a); continue }
      if (!res.ok) return null
      return await res.json()
    } catch { await sleep(2000 * a); continue }
  }
  return null
}

async function tmdbFetch(url, retries = 1) {
  for (let a = 1; a <= retries; a++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (res.status === 429) { await sleep(2000 * a); continue }
      if (!res.ok) return null
      return await res.json()
    } catch { await sleep(1000 * a); continue }
  }
  return null
}

function detectColumns($, $hr) {
  const headers = []
  $hr.find('th').each((i, th) => headers.push(cleanText($(th).text()).toLowerCase()))
  const m = { title: -1, director: -1, cast: -1, opening: -1 }
  headers.forEach((h, i) => {
    if (h.includes('title') || h === 'film' || h === 'name') m.title = i
    else if (h.includes('director')) m.director = i
    else if (h.includes('cast') || h.includes('starring')) m.cast = i
    else if (h.includes('opening') || h.includes('release') || h.includes('date') || h === 'date') m.opening = i
  })
  return m
}

// ─── MAIN ───
async function main() {
  const args = process.argv.slice(2)
  const onlyPhase = args.find(a => a.startsWith('--only='))?.split('=')[1]
  const specificYears = args.find(a => a.startsWith('--years='))?.split('=')[1]

  console.log(`\n╔══════════════════════════════════════╗`)
  console.log(`║  GITHUB ACTIONS RUNNER              ║`)
  console.log(`║  Full import + patch pipeline        ║`)
  console.log(`╚══════════════════════════════════════╝`)

  const phases = onlyPhase ? [parseInt(onlyPhase)] : [1, 2, 3]

  if (phases.includes(1)) await phase1Import(specificYears)
  if (phases.includes(2)) await phase2PatchTMDB()
  if (phases.includes(3)) await phase3WikiFallback()

  const total = await sanity.fetch('count(*[_type == "movie"])')
  console.log(`\n══════════════════════════════════════`)
  console.log(`🏁 FINAL: ${total} movies total (all complete)`)
  console.log(`══════════════════════════════════════`)
}

main().catch(err => { console.error('💥', err); process.exit(1) })
