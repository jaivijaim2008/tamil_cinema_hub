/**
 * BULK MOVIE IMPORTER
 * Step 1: Extract all Tamil film titles from Wikipedia list pages → JSON
 * Step 2: Bulk import missing movies into Sanity
 *
 * Usage: node scripts/bulk-import-movies.js
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const cheerio = require('cheerio')
const he = require('he')
const fs = require('fs')
const path = require('path')
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))

const WIKI_API = 'https://en.wikipedia.org/w/api.php'
const DELAY_MS = 500
const CURRENT_YEAR = new Date().getFullYear()

const sleep = ms => new Promise(r => setTimeout(r, ms))
const cleanText = t => t ? he.decode(t.replace(/\[\d+\]/g, '').replace(/<[^>]*>/g, '')).trim() : ''
const makeSlug = (t, y) => t.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').trim() + '-' + y
const normalizeTitle = t => t.toLowerCase().replace(/[^a-z0-9]/g, '').trim()

const KNOWN_GENRES = new Set([
  'drama','romance','comedy','thriller','action','horror','fantasy','musical','crime',
  'mystery','sci-fi','biopic','western','animation','documentary','adventure','suspense',
  'family','sports','war','history','political','supernatural','psychological','period',
  'epic','masala','cult','noir','satire','tragedy','mythological','devotional','social'
])

function isBadTitle(title) {
  const t = title.toLowerCase().trim()
  if (/^\d+$/.test(t)) return true
  if (KNOWN_GENRES.has(t)) return true
  if (t.split(/\s+/).length === 1 && t.length >= 2 && t.length <= 20 && !t.includes('-') && !t.includes('.')) return true
  return false
}

async function wikiFetch(pageTitle, retries = 2) {
  for (let a = 1; a <= retries; a++) {
    try {
      const url = `${WIKI_API}?action=parse&page=${encodeURIComponent(pageTitle)}&prop=text&format=json&redirects=1`
      const res = await fetch(url, { headers: { 'User-Agent': 'TamilCinemaHub/1.0' } })
      if (res.status === 429) { console.log('  ⏳ Rate limited, waiting...'); await sleep(8000); continue }
      if (!res.ok) return null
      const data = await res.json()
      if (data?.error?.code === 'missingtitle') return null
      return data
    } catch { await sleep(2000); continue }
  }
  return null
}

function detectColumns($, $hr) {
  const headers = []
  $hr.find('th').each((i, th) => headers.push(cleanText($(th).text()).toLowerCase()))
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

async function extractTitles(year) {
  const data = await wikiFetch(`List of Tamil films of ${year}`)
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
    const ht = $hr.text().toLowerCase()

    if (ht.includes('gross') || ht.includes('rank') || ht.includes('box office') || ht.includes('award') || ht.includes('organization')) return
    if (cols.title === -1) return

    let currentDate = '', dateRowspan = 0

    rows.each((ri, row) => {
      if (ri === 0) return
      const cells = $(row).find('td')
      const allCells = $(row).find('td, th')
      const firstTag = allCells.first().get(0)?.tagName

      if (firstTag === 'th' && allCells.length >= 1) {
        const m = cleanText(allCells.first().text())
        if (monthRe.test(m)) { currentDate = m; dateRowspan = 0 }
        return
      }
      if (cells.length < 2) return

      const firstCell = cells.first()
      const hasDateRowspan = !!firstCell.attr('rowspan')
      const noDateColumn = cols.opening === -1

      if (hasDateRowspan) { currentDate = cleanText(firstCell.text()); dateRowspan = parseInt(firstCell.attr('rowspan')) - 1 }
      else if (dateRowspan > 0) dateRowspan--
      else if (cols.opening >= 0) currentDate = cleanText(firstCell.text())

      const dateIsMerged = dateRowspan > 0 && cols.opening >= 0
      const actualIdx = (colIdx) => {
        if (colIdx === -1) return -1
        const adjusted = colIdx + (dateIsMerged ? 1 : 0)
        return adjusted < cells.length ? adjusted : -1
      }

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
      if (castIdx >= 0 && castIdx < cells.length) {
        const raw = cleanText(cells.eq(castIdx).text())
        castArray = raw.split(/,|\band\b|&|\//).map(s => s.trim()).filter(s => s.length > 1 && !['various','tba','tdb','n/a','unknown'].includes(s.toLowerCase()))
      }

      movies.push({ title, year, director, cast: castArray })
    })
  })

  // Deduplicate by normalized title
  const seen = new Set()
  return movies.filter(m => {
    const k = normalizeTitle(m.title) + '-' + m.year
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

async function main() {
  const args = process.argv.slice(2)
  let years = []
  if (args.includes('--from-json')) {
    // Re-import from existing JSON (for years that were rate-limited)
    const jsonPath = path.join(__dirname, '..', 'wikipedia-movies.json')
    if (!fs.existsSync(jsonPath)) { console.error('No wikipedia-movies.json found. Run without --from-json first.'); process.exit(1) }
    const allFromWiki = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    console.log(`📂 Loaded ${allFromWiki.length} movies from wikipedia-movies.json`)
    // Import the missing ones into Sanity
    const sanity = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      token: process.env.SANITY_WRITE_TOKEN,
      useCdn: false,
    })
    const existing = await sanity.fetch('*[_type == "movie"]{title,year}')
    const existingSet = new Set(existing.map(m => normalizeTitle(m.title) + '-' + m.year))
    const toCreate = allFromWiki.filter(m => !existingSet.has(normalizeTitle(m.title) + '-' + m.year))
    console.log(`   Existing: ${existing.length} movies, New to create: ${toCreate.length}`)

    if (toCreate.length === 0) { console.log('✅ All movies already in Sanity!'); return }

    const BATCH = 10
    let created = 0, errors = 0
    for (let i = 0; i < toCreate.length; i += BATCH) {
      const batch = toCreate.slice(i, i + BATCH)
      const tx = sanity.transaction()
      for (const m of batch) {
        tx.create({ _type: 'movie', title: m.title, slug: { _type: 'slug', current: makeSlug(m.title, m.year) }, year: m.year, director: m.director || '', cast: m.cast || [], genre: [], synopsis: '', posterUrl: '', rating: 0, ottPlatform: '' })
      }
      try { await tx.commit(); created += batch.length; process.stdout.write(`  ✅ [${i+batch.length}/${toCreate.length}]\r`) }
      catch {
        for (const m of batch) { try { await sanity.create({ _type: 'movie', title: m.title, slug: { _type: 'slug', current: makeSlug(m.title, m.year) }, year: m.year, director: m.director || '', cast: m.cast || [], synopsis: '', posterUrl: '', rating: 0, ottPlatform: '' }); created++ } catch { errors++ } }
      }
    }
    console.log(`\n📊 Created: ${created}, Errors: ${errors}`)
    const total = await sanity.fetch('count(*[_type == "movie"])')
    console.log(`🏁 Total movies: ${total}`)
    return
  }
  for (let y = 2000; y <= CURRENT_YEAR; y++) years.push(y)
  console.log(`\n╔══════════════════════════════════════╗`)
  console.log(`║  BULK MOVIE IMPORTER                ║`)
  console.log(`║  Extracting from Wikipedia: ${years[0]}–${years[years.length-1]} ║`)
  console.log(`╚══════════════════════════════════════╝\n`)

  // STEP 1: Extract all titles from Wikipedia
  const allFromWiki = []
  for (const year of years) {
    process.stdout.write(`📋 ${year}... `)
    const movies = await extractTitles(year)
    allFromWiki.push(...movies)
    process.stdout.write(`${movies.length} movies\n`)
    await sleep(300) // Be respectful
  }

  console.log(`\n✅ Extracted ${allFromWiki.length} total titles from Wikipedia`)
  const yearCounts = {}
  allFromWiki.forEach(m => { yearCounts[m.year] = (yearCounts[m.year] || 0) + 1 })
  console.log(`   By year: ${Object.keys(yearCounts).sort().map(y => `${y}:${yearCounts[y]}`).join(' ')}`)

  // Save to JSON
  const jsonPath = path.join(__dirname, '..', 'wikipedia-movies.json')
  fs.writeFileSync(jsonPath, JSON.stringify(allFromWiki, null, 2))
  console.log(`   Saved to: wikipedia-movies.json`)

  // STEP 2: Query existing movies from Sanity
  console.log(`\n📡 Connecting to Sanity...`)
  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  })

  const existing = await sanity.fetch('*[_type == "movie"] { title, year, director, cast, synopsis, posterUrl, poster, rating, ottPlatform }')
  console.log(`   Existing: ${existing.length} movies`)

  // Build lookup set
  const existingSet = new Set(existing.map(m => normalizeTitle(m.title) + '-' + m.year))

  // Find new movies to create
  const toCreate = allFromWiki.filter(m => !existingSet.has(normalizeTitle(m.title) + '-' + m.year))
  console.log(`   New to create: ${toCreate.length} movies\n`)

  if (toCreate.length === 0) {
    console.log(`✅ All Wikipedia movies are already in Sanity!`)
    return
  }

  // Create in batches of 10 (Sanity transactions)
  const BATCH_SIZE = 10
  let created = 0, errors = 0

  for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
    const batch = toCreate.slice(i, i + BATCH_SIZE)
    const tx = sanity.transaction()

    for (const m of batch) {
      tx.create({
        _type: 'movie',
        title: m.title,
        slug: { _type: 'slug', current: makeSlug(m.title, m.year) },
        year: m.year,
        director: m.director || '',
        cast: Array.isArray(m.cast) ? m.cast : [],
        synopsis: '',
        posterUrl: '',
        rating: 0,
        ottPlatform: '',
      })
    }

    try {
      await tx.commit()
      created += batch.length
      process.stdout.write(`  ✅ [${i + batch.length}/${toCreate.length}] Created ${batch.length} movies\r`)
    } catch (err) {
      // Fall back to individual creates
      for (const m of batch) {
        try {
          await sanity.create({
            _type: 'movie',
            title: m.title,
            slug: { _type: 'slug', current: makeSlug(m.title, m.year) },
            year: m.year,
            director: m.director || '',
            cast: Array.isArray(m.cast) ? m.cast : [],
            synopsis: '',
            posterUrl: '',
            rating: 0,
            ottPlatform: '',
          })
          created++
        } catch { errors++ }
      }
      process.stdout.write(`  ✅ [${i + batch.length}/${toCreate.length}] (${errors} errors)\r`)
    }
  }

  console.log(`\n\n📊 RESULTS`)
  console.log(`   ✅ Created: ${created}`)
  console.log(`   ❌ Errors: ${errors}`)

  const total = await sanity.fetch('count(*[_type == "movie"])')
  console.log(`   🏁 Total movies in Sanity: ${total}`)
}

main().catch(err => { console.error('💥 Fatal:', err); process.exit(1) })
