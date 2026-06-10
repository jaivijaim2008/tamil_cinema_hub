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

const sleep = ms => new Promise(r => setTimeout(r, ms))
const cleanText = t => t ? he.decode(t.replace(/\[\d+\]/g, '').replace(/<[^>]*>/g, '')).trim() : ''
const makeSlug = (t, y) => t.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').trim() + '-' + y
const normalizeTitle = t => t.toLowerCase().replace(/[^a-z0-9]/g, '').trim()

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// ─── PHASE 1: Import new titles from Wikipedia ───
async function phase1Import(years) {
  console.log('\n═══════════════════════════════════')
  console.log('PHASE 1: Import new titles from Wikipedia')
  console.log('═══════════════════════════════════\n')

  // Build year list
  const yearList = (years && years.length > 0) ? years : []
  if (yearList.length === 0) {
    for (let y = 2000; y <= CURRENT_YEAR; y++) yearList.push(y)
  }
  
  // Get all existing movie titles from Sanity
  const existing = await sanity.fetch('*[_type == "movie"] { title, year }')
  const existingSet = new Set(existing.map(m => normalizeTitle(m.title) + '-' + m.year))
  console.log(`Existing movies: ${existing.length}`)

  let totalNew = 0
  for (const year of yearList) {
    const movies = await loadTitlesFromWiki(year)
    if (!movies.length) continue

    const newMovies = movies.filter(m => !existingSet.has(normalizeTitle(m.title) + '-' + m.year))
    if (!newMovies.length) { console.log(`  ${year}: 0 new`); continue }

    // Batch create
    const B = 10
    for (let i = 0; i < newMovies.length; i += B) {
      const batch = newMovies.slice(i, i + B)
      const tx = sanity.transaction()
      for (const m of batch) {
        tx.create({
          _type: 'movie',
          title: m.title,
          slug: { _type: 'slug', current: makeSlug(m.title, m.year) },
          year: m.year,
          director: m.director || '',
          cast: Array.isArray(m.cast) ? m.cast : [],
          genre: [],
          synopsis: '',
          posterUrl: '',
          rating: 0,
          ottPlatform: '',
        })
      }
      try { await tx.commit(); totalNew += batch.length }
      catch {
        for (const m of batch) {
          try { await sanity.create({ _type: 'movie', title: m.title, slug: { _type: 'slug', current: makeSlug(m.title, m.year) }, year: m.year, director: m.director || '', cast: Array.isArray(m.cast) ? m.cast : [], synopsis: '', posterUrl: '', rating: 0, ottPlatform: '' }); totalNew++ } catch {}
        }
      }
    }
    console.log(`  ${year}: +${newMovies.length} new`)
    await sleep(500) // Be nice
  }
  console.log(`\n✅ Phase 1 complete: ${totalNew} new movies imported`)
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
    return (!m.posterUrl && !m.poster) || !m.synopsis || !m.rating || m.rating === 0 || !m.ottPlatform || !m.cast || m.cast.length === 0 || !m.director
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

        const best = search.results[0]
        const details = await tmdbFetch(
          `https://api.themoviedb.org/3/movie/${best.id}?api_key=${TMDB_KEY}&append_to_response=credits,watch/providers&language=en-US`
        )
        if (!details) { cache[key] = { done: true, found: false }; notFound++; return }

        const prov = details['watch/providers']?.results?.IN || details['watch/providers']?.results?.US
        const ottPlatforms = prov?.flatrate?.map(p => p.provider_name).join(', ') || ''
        const cast = details.credits?.cast?.slice(0, 10).map(c => c.name) || []
        const director = details.credits?.crew?.find(c => c.job === 'Director')?.name || ''

        const updates = {}
        if ((!movie.posterUrl && !movie.poster) && details.poster_path) updates.posterUrl = `${TMDB_IMG}${details.poster_path}`
        if (!movie.synopsis && details.overview) updates.synopsis = details.overview?.substring(0, 500) || ''
        if ((!movie.rating || movie.rating === 0) && details.vote_average) updates.rating = details.vote_average
        if (!movie.ottPlatform && ottPlatforms) updates.ottPlatform = ottPlatforms
        if ((!movie.cast || movie.cast.length === 0) && cast.length) updates.cast = cast
        if (!movie.director && director) updates.director = director

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
  const gaps = await sanity.fetch(`{
    "poster": count(*[_type == "movie" && (!defined(poster) && (!defined(posterUrl)||posterUrl==""))]),
    "synopsis": count(*[_type == "movie" && (!defined(synopsis)||synopsis=="")]),
    "rating": count(*[_type == "movie" && (!defined(rating)||rating==0)]),
    "ott": count(*[_type == "movie" && (!defined(ottPlatform)||ottPlatform=="")])
  }`)

  console.log(`\n══════════════════════════════════════`)
  console.log(`🏁 FINAL: ${total} movies total`)
  console.log(`📊 Gaps: Poster:${gaps.poster} Synopsis:${gaps.synopsis} Rating:${gaps.rating} OTT:${gaps.ott}`)
  console.log(`══════════════════════════════════════`)
}

main().catch(err => { console.error('💥', err); process.exit(1) })
