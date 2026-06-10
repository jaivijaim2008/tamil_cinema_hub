/**
 * WIKIPEDIA DETAIL PATCHER v2 — Fast mode
 * Fills missing posters, synopsis, cast, director from Wikipedia individual pages.
 * Optimized for speed: 10 concurrent, 400ms batch delay.
 * Saves progress cache for resume.
 *
 * Usage: node scripts/wiki-patch-details.js [--year=2024] [--limit=100]
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const cheerio = require('cheerio')
const he = require('he')
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))
const fs = require('fs')
const path = require('path')

const WIKI_API = 'https://en.wikipedia.org/w/api.php'
const CACHE_FILE = path.join(__dirname, '..', 'wiki-patch-cache.json')
const CONCURRENCY = 10
const BATCH_DELAY = 400

const sleep = ms => new Promise(r => setTimeout(r, ms))
const cleanText = t => t ? he.decode(t.replace(/\[\d+\]/g, '').replace(/<[^>]*>/g, '')).trim() : ''

async function wikiFetch(pageTitle, retries = 2) {
  for (let a = 1; a <= retries; a++) {
    try {
      const url = `${WIKI_API}?action=parse&page=${encodeURIComponent(pageTitle)}&prop=text&format=json&redirects=1`
      const res = await fetch(url, { headers: { 'User-Agent': 'TamilCinemaHub/1.0' }, signal: AbortSignal.timeout(8000) })
      if (res.status === 429) { await sleep(5000 * a); continue }
      if (!res.ok) return null
      return await res.json()
    } catch { await sleep(1000 * a); continue }
  }
  return null
}

async function getWikiDetails(title, year) {
  const tries = [`${title} (${year} film)`, `${title} (film)`, title, `${title} (${year} Tamil film)`]
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
        if (!castSet.size) cleanText(d.text()).split(',').forEach(n => { if (n) castSet.add(n) })
      }
    })

    const firstP = $('p').first().text().replace(/\[\d+\]/g, '').trim()
    if (firstP.length > 40) synopsis = firstP.substring(0, 500)

    const img = info.find('img').first()
    if (img.length) {
      let src = img.attr('src') || ''
      if (src && !src.startsWith('http')) src = 'https:' + src
      if (src) posterUrl = src.replace(/\/\d+px-/, '/480px-')
    }
    return { director, cast: Array.from(castSet).filter(n => n.length > 1), synopsis, posterUrl }
  }
  return null
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

async function main() {
  const args = process.argv.slice(2)
  const limitYear = args.find(a => a.startsWith('--year='))?.split('=')[1]
  const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0')
  const startYear = args.find(a => a.startsWith('--from-year='))?.split('=')[1]

  let cache = {}
  if (fs.existsSync(CACHE_FILE)) cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
  console.log(`📂 Cache: ${Object.keys(cache).length} processed`)

  let movies = await sanity.fetch('*[_type == "movie"] | order(year desc) { _id, title, year, director, cast, synopsis, posterUrl, poster }')
  console.log(`📡 Total: ${movies.length}`)

  let needy = movies.filter(m => {
    if (limitYear && m.year !== parseInt(limitYear)) return false
    if (startYear && m.year < parseInt(startYear)) return false
    if (cache[m._id]?.done) return false
    return (!m.posterUrl && !m.poster) || !m.synopsis || m.synopsis.length < 10 || !m.director || !m.cast || m.cast.length === 0
  })

  if (limit) needy = needy.slice(0, limit)
  console.log(`🔧 Needing patch: ${needy.length}`)
  if (!needy.length) { console.log('✅ Done!'); return }

  let patched = 0, notFound = 0, errors = 0, skipped = 0, startTime = Date.now()

  for (let i = 0; i < needy.length; i += CONCURRENCY) {
    const batch = needy.slice(i, i + CONCURRENCY)

    await Promise.allSettled(batch.map(async (movie) => {
      if (cache[movie._id]?.done) { skipped++; return }
      try {
        const details = await getWikiDetails(movie.title, movie.year)
        if (!details) { cache[movie._id] = { done: true, found: false }; notFound++; return }

        const updates = {}
        if ((!movie.posterUrl && !movie.poster) && details.posterUrl) updates.posterUrl = details.posterUrl
        if ((!movie.synopsis || movie.synopsis.length < 10) && details.synopsis) updates.synopsis = details.synopsis
        if (!movie.director && details.director) updates.director = details.director
        if ((!movie.cast || movie.cast.length === 0) && details.cast.length > 0) updates.cast = details.cast

        if (Object.keys(updates).length > 0) {
          await sanity.patch(movie._id).set(updates).commit()
          patched++
        } else skipped++
        cache[movie._id] = { done: true, found: true }
      } catch { cache[movie._id] = { done: true, found: false }; errors++ }
    }))

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
    const done = Math.min(i + CONCURRENCY, needy.length)
    const rate = (done / parseInt(elapsed || 1)).toFixed(1)
    process.stdout.write(`  📊 [${done}/${needy.length}] P:${patched} N:${notFound} E:${errors} S:${skipped} | ${elapsed}s | ${rate}/s\r`)

    if (done % 100 === 0 || done >= needy.length) fs.writeFileSync(CACHE_FILE, JSON.stringify(cache))

    if (i + CONCURRENCY < needy.length) await sleep(BATCH_DELAY)
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache))
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)

  console.log(`\n\n📊 RESULTS (${elapsed}s)`)
  console.log(`  ✅ Patched: ${patched}`)
  console.log(`  ❌ Not found: ${notFound}`)
  console.log(`  ⚠️  Errors: ${errors}`)
  console.log(`  ⏭️  Skipped: ${skipped}`)
}

main().catch(err => { console.error('💥', err); process.exit(1) })
