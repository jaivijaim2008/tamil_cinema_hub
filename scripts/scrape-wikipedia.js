/**
 * WIKIPEDIA TAMIL FILM SCRAPER v5 — Final
 * Fetches Tamil movies 2000-2026 from Wikipedia (free API).
 * Usage: node scripts/scrape-wikipedia.js [--patch] [--auto] [--years=2024,2025]
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const cheerio = require('cheerio')
const he = require('he')
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))

const WIKI_API = 'https://en.wikipedia.org/w/api.php'
const DELAY = 600 // Be respectful to Wikipedia
const CURRENT_YEAR = new Date().getFullYear()

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const sleep = ms => new Promise(r => setTimeout(r, ms))
const makeSlug = (t, y) => t.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').trim() + '-' + y
const cleanText = t => t ? he.decode(t.replace(/\[\d+\]/g, '').replace(/<[^>]*>/g, '')).trim() : ''
const normalizeTitle = t => t.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
const extractNames = t => t ? t.split(/,|\band\b|&|\//).map(s => s.trim()).filter(s => s.length > 1 && !['various','tba','tdb','n/a','unknown'].includes(s.toLowerCase())) : []

async function wikiParse(title, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `${WIKI_API}?action=parse&page=${encodeURIComponent(title)}&prop=text&format=json&redirects=1`
      const res = await fetch(url, { headers: { 'User-Agent': 'TamilCinemaHub/1.0 (movie database)' } })
      if (res.status === 429) { // Rate limited
        console.log(`  ⏳ Rate limited, waiting 5s...`)
        await sleep(5000)
        continue
      }
      if (!res.ok) return null
      await sleep(DELAY)
      const data = await res.json()
      if (data?.error?.code === 'missingtitle') return null
      return data
    } catch { await sleep(1000); continue }
  }
  return null
}

function detectColumns($, $headerRow) {
  const headers = []
  $headerRow.find('th').each((i, th) => headers.push(cleanText($(th).text()).toLowerCase()))
  const m = { title: -1, director: -1, cast: -1, studio: -1, opening: -1 }
  headers.forEach((h, i) => {
    if (h.includes('title') || h === 'film' || h === 'name') m.title = i
    else if (h.includes('director')) m.director = i
    else if (h.includes('cast') || h.includes('starring')) m.cast = i
    else if (h.includes('studio') || h.includes('production') || h.includes('company')) m.studio = i
    else if (h.includes('opening') || h.includes('release') || h.includes('date') || h === 'date') m.opening = i
  })
  return m
}

async function getMovieTitles(year) {
  const data = await wikiParse(`List of Tamil films of ${year}`)
  if (!data?.parse?.text) return []

  const $ = cheerio.load(data.parse.text['*'])
  const movies = []
  const monthRe = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i

  $('table.wikitable').each((ti, table) => {
    const $table = $(table)
    const rows = $table.find('tr')
    if (rows.length < 2) return

    const $hr = rows.first()
    const cols = detectColumns($, $hr)

    // Skip box office / awards tables
    const ht = $hr.text().toLowerCase()
    if (ht.includes('gross') || ht.includes('rank') || ht.includes('box office') || ht.includes('award') || ht.includes('organization')) return
    if (cols.title === -1) return

    let currentDate = '', dateRowspan = 0

    rows.each((ri, row) => {
      if (ri === 0) return

      // Use only td cells for data rows (th cells are section headers)
      const cells = $(row).find('td')
      const allCells = $(row).find('td, th')
      const firstTag = allCells.first().get(0)?.tagName

      // Month header row
      if (firstTag === 'th' && allCells.length >= 1) {
        const m = cleanText(allCells.first().text())
        if (monthRe.test(m)) { currentDate = m; dateRowspan = 0 }
        return
      }

      if (cells.length < 2) return

      // KEY FIX: Check if first cell has rowspan (date column is merged)
      const firstCell = cells.first()
      const hasDateRowspan = !!firstCell.attr('rowspan')
      const noDateColumn = cols.opening === -1 // Some tables have no date column

      if (hasDateRowspan) {
        currentDate = cleanText(firstCell.text())
        dateRowspan = parseInt(firstCell.attr('rowspan')) - 1
      } else if (dateRowspan > 0) {
        dateRowspan--
      } else if (cols.opening >= 0) {
        currentDate = cleanText(firstCell.text())
      }

      // KEY FIX: When date rowspan is active, the date cell is NOT in this row,
      // so all column indices are shifted by -1 (one less td cell)
      const dateIsMerged = dateRowspan > 0 && cols.opening >= 0
      const shift = dateIsMerged ? -1 : 0

      // Calculate actual cell index for each column
      const actualIdx = (colIdx) => {
        if (colIdx === -1) return -1
        const adjusted = colIdx + (dateIsMerged ? 1 : 0) // +1 because date cell is missing
        return adjusted < cells.length ? adjusted : -1
      }

      // For tables with no date column, no shift needed
      const titleIdx = noDateColumn ? cols.title : actualIdx(cols.title)
      if (titleIdx === -1 || titleIdx >= cells.length) return

      const titleCell = cells.eq(titleIdx)
      const link = titleCell.find('a').first()
      const title = cleanText(link.length ? link.text() : titleCell.text())

      if (!title || title.length < 2 || monthRe.test(title)) return

      let director = '', castArray = []
      const dirIdx = noDateColumn ? cols.director : actualIdx(cols.director)
      const castIdx = noDateColumn ? cols.cast : actualIdx(cols.cast)

      if (dirIdx >= 0 && dirIdx < cells.length) director = cleanText(cells.eq(dirIdx).text())
      if (castIdx >= 0 && castIdx < cells.length) castArray = extractNames(cleanText(cells.eq(castIdx).text()))

      movies.push({
        title, year, director, cast: castArray,
        wikiUrl: link.attr('href') ? 'https://en.wikipedia.org' + link.attr('href') : '',
        releaseDate: currentDate,
      })
    })
  })

  return movies
}

async function getMovieDetails(title, year) {
  const tries = [`${title} (${year} film)`, `${title} (film)`, title, `${title} (${year} Tamil film)`]
  for (const t of tries) {
    const data = await wikiParse(t)
    if (!data?.parse?.text) continue
    const $ = cheerio.load(data.parse.text['*'])

    let director = '', synopsis = ''
    const castSet = new Set()
    const infobox = $('.infobox')
    if (!infobox.length) continue

    infobox.find('tr').each((i, row) => {
      const h = $(row).find('th').first().text().toLowerCase().trim()
      const d = $(row).find('td').first()
      if (h === 'directed by' || h === 'director') director = cleanText(d.text())
      else if (h === 'starring' || h === 'cast') {
        d.find('a').each((_, a) => { const n = cleanText($(a).text()); if (n) castSet.add(n) })
        if (!castSet.size) cleanText(d.text()).split(',').forEach(n => { const v = n.trim(); if (v) castSet.add(v) })
      }
    })

    const p = $('p').first().text().trim().replace(/\[\d+\]/g, '').trim()
    if (p.length > 40) synopsis = p.substring(0, 500) + (p.length > 500 ? '…' : '')

    const img = infobox.find('img').first()
    let posterUrl = ''
    if (img.length) {
      let src = img.attr('src') || ''
      if (src && !src.startsWith('http')) src = 'https:' + src
      if (src) posterUrl = src.replace(/\/\d+px-/, '/480px-')
    }
    return { director, cast: Array.from(castSet).filter(n => n.length > 1), synopsis, posterUrl }
  }
  return { director: '', cast: [], synopsis: '', posterUrl: '' }
}

const existingCache = {}
async function findExisting(title, year) {
  const key = `${normalizeTitle(title)}-${year}`
  if (key in existingCache) return existingCache[key]
  try {
    let m = await sanity.fetch(`*[_type == "movie" && title == $title && year == $year][0]{ _id, title, year, director, cast, genre, rating, synopsis, ottPlatform, poster, posterUrl }`, { title, year })
    if (!m) m = await sanity.fetch(`*[_type == "movie" && slug.current == $slug][0]{ _id, title, year, director, cast, genre, rating, synopsis, ottPlatform, poster, posterUrl }`, { slug: makeSlug(title, year) })
    existingCache[key] = m || null; return m || null
  } catch { return null }
}

async function createMovie({ title, year }) {
  const details = await getMovieDetails(title, year)
  try {
    await sanity.create({ _type: 'movie', title, slug: { _type: 'slug', current: makeSlug(title, year) }, year, director: details.director, cast: details.cast, synopsis: details.synopsis, posterUrl: details.posterUrl, rating: 0, ottPlatform: '' })
    return { action: 'created', title }
  } catch (err) { return { action: 'error', title, error: err.message } }
}

async function patchMovie(movie, title, year) {
  const needs = {
    director: !movie.director || movie.director === 'Unknown',
    cast: !movie.cast || movie.cast.length === 0,
    synopsis: !movie.synopsis || movie.synopsis.length < 10,
    poster: !movie.poster && (!movie.posterUrl || movie.posterUrl === ''),
  }
  if (!needs.director && !needs.cast && !needs.synopsis && !needs.poster) return { action: 'ok', title }

  const details = await getMovieDetails(title, year)
  const updates = {}
  if (needs.director && details.director) updates.director = details.director
  if (needs.cast && details.cast.length > 0) updates.cast = details.cast
  if (needs.synopsis && details.synopsis) updates.synopsis = details.synopsis
  if (needs.poster && details.posterUrl) updates.posterUrl = details.posterUrl
  if (!Object.keys(updates).length) return { action: 'ok', title }

  try { await sanity.patch(movie._id).set(updates).commit(); return { action: 'patched', title, fields: Object.keys(updates) } }
  catch (err) { return { action: 'error', title, error: err.message } }
}

function printSummary(results) {
  const counts = {}
  for (const r of results) counts[r.action] = (counts[r.action] || 0) + 1
  console.log('\n═══════════════════════════════════════\n📊 SUMMARY')
  for (const [a, c] of Object.entries(counts)) console.log(`  ${a === 'created' ? '✅' : a === 'patched' ? '🔧' : a === 'ok' ? '✓' : a === 'exists' ? '⏭️' : '❌'} ${a}: ${c}`)
  console.log(`  Total: ${results.length}\n`)
}

async function main() {
  const args = process.argv.slice(2)
  let years = [], doPatch = false, autoMode = false, limit = null
  for (const arg of args) {
    if (arg.startsWith('--years=')) years = arg.replace('--years=', '').split(',').map(Number).filter(n => !isNaN(n))
    else if (arg === '--patch') doPatch = true
    else if (arg.startsWith('--limit=')) limit = parseInt(arg.replace('--limit=', ''))
    else if (arg.startsWith('--auto')) { autoMode = true; doPatch = !arg.includes('no-patch') }
    else if (arg === '--help') {
      console.log('\nUsage: node scripts/scrape-wikipedia.js [options]\n\n  --years=2024,2025   Specific years\n  --patch             Patch missing director/cast/synopsis/posters\n  --limit=100         Limit per year (test mode)\n  --auto              Auto-fetch (current year only, with patch)\n  --help              Show this help\n')
      process.exit(0)
    }
  }
  let quickMode = args.includes('--quick')
  if (autoMode) years = [CURRENT_YEAR]
  if (quickMode) doPatch = false
  if (!years.length) { for (let y = 2000; y <= CURRENT_YEAR; y++) years.push(y) }

  console.log('╔═════════════════════════════╗\n║  WIKIPEDIA SCRAPER v5     ║\n╚═════════════════════════════╝')
  console.log(`Years: ${years[0]}–${years[years.length - 1]} (${years.length})`)

  const allResults = []
  for (const year of years) {
    console.log(`\n📋 ${year}...`)
    const movies = await getMovieTitles(year)
    console.log(`  → ${movies.length} movies found`)    
    if (movies.length === 0) continue
    if (limit && movies.length > limit) movies.length = limit

    for (let i = 0; i < movies.length; i++) {
      const { title } = movies[i]
      const existing = await findExisting(title, year)
      if (existing) {
        if (doPatch && !quickMode) {
          const r = await patchMovie(existing, title, year)
          allResults.push(r)
          if (r.action === 'patched') console.log(`  🔧 [${i + 1}] ${title} → ${r.fields.join(', ')}`)
        } else allResults.push({ action: 'exists', title })
      } else if (quickMode) {
        // Quick mode: just create with title/year, no detail fetch
        try {
          const slug = makeSlug(title, year)
          await sanity.create({ _type: 'movie', title, slug: { _type: 'slug', current: slug }, year, director: '', cast: [], synopsis: '', posterUrl: '', rating: 0, ottPlatform: '' })
          allResults.push({ action: 'created', title })
          console.log(`  ✅ [${i + 1}] ${title}`)
        } catch (err) {
          allResults.push({ action: 'error', title, error: err.message })
          console.log(`  ❌ [${i + 1}] ${title}: ${err.message}`)
        }
      } else {
        const r = await createMovie({ title, year })
        allResults.push(r)
        console.log(`  ${r.action === 'created' ? '✅' : '❌'} [${i + 1}] ${title}`)
      }
    }
  }

  printSummary(allResults)
  const total = await sanity.fetch('count(*[_type == "movie"])')
  console.log(`🏁 Total movies: ${total}`)
  const s = await sanity.fetch(`{ "noDir": count(*[_type == "movie" && (!defined(director) || director=="" || director=="Unknown")]), "noRating": count(*[_type == "movie" && (!defined(rating) || rating==0)]), "noSynopsis": count(*[_type == "movie" && (!defined(synopsis) || synopsis=="")]), "noPoster": count(*[_type == "movie" && (!defined(poster) && (!defined(posterUrl)||posterUrl==""))]), "noOtt": count(*[_type == "movie" && (!defined(ottPlatform) || ottPlatform=="")]), "noCast": count(*[_type == "movie" && (!defined(cast) || cast==[])]) }`)
  console.log(`📊 Gaps: Director:${s.noDir} Cast:${s.noCast} Rating:${s.noRating} Synopsis:${s.noSynopsis} Poster:${s.noPoster} OTT:${s.noOtt}`)
}

main().catch(err => { console.error('\n💥 Fatal:', err); process.exit(1) })
