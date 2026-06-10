/**
 * Extract missing Wikipedia years (2001-2017, 2021-2023) with long delays.
 * Appends to wikipedia-movies.json.
 */
require('dotenv').config({ path: '.env.local' })
const cheerio = require('cheerio')
const he = require('he')
const fs = require('fs')
const path = require('path')
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))

const WIKI_API = 'https://en.wikipedia.org/w/api.php'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const cleanText = t => t ? he.decode(t.replace(/\[\d+\]/g, '').replace(/<[^>]*>/g, '')).trim() : ''

async function wikiFetch(page, retries = 3) {
  for (let a = 1; a <= retries; a++) {
    try {
      const url = `${WIKI_API}?action=parse&page=${encodeURIComponent(page)}&prop=text&format=json&redirects=1`
      const res = await fetch(url, { headers: { 'User-Agent': 'TamilCinemaHub/1.0 (movie database; contact@tamilcinemahub.com)' } })
      if (res.status === 429) { console.log('  ⏳ Rate limited, waiting 10s...'); await sleep(10000 * a); continue }
      if (!res.ok) return null
      await sleep(2000) // Long delay between requests
      const data = await res.json()
      if (data?.error?.code === 'missingtitle') return null
      return data
    } catch { await sleep(5000); continue }
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

async function extract(year) {
  const data = await wikiFetch(`List of Tamil films of ${year}`)
  if (!data?.parse?.text) return []
  const $ = cheerio.load(data.parse.text['*'])
  const movies = []
  const monthRe = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i

  $('table.wikitable').each((ti, table) => {
    const rows = $(table).find('tr')
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
      const actualIdx = ci => ci === -1 ? -1 : (ci + (dateIsMerged ? 1 : 0)) < cells.length ? ci + (dateIsMerged ? 1 : 0) : -1
      const ti = noDateColumn ? cols.title : actualIdx(cols.title)
      if (ti === -1 || ti >= cells.length) return
      const cell = cells.eq(ti)
      const link = cell.find('a').first()
      const title = cleanText(link.length ? link.text() : cell.text())
      if (!title || title.length < 2 || monthRe.test(title)) return
      let director = '', castArray = []
      const di = noDateColumn ? cols.director : actualIdx(cols.director)
      const ci = noDateColumn ? cols.cast : actualIdx(cols.cast)
      if (di >= 0 && di < cells.length) director = cleanText(cells.eq(di).text())
      if (ci >= 0 && ci < cells.length) {
        const raw = cleanText(cells.eq(ci).text())
        castArray = raw.split(/,|\band\b|&|\//).map(s => s.trim()).filter(s => s.length > 1 && !['various','tba','tdb','n/a','unknown'].includes(s.toLowerCase()))
      }
      movies.push({ title, year, director, cast: castArray })
    })
  })

  // Deduplicate
  const seen = new Set()
  return movies.filter(m => {
    const k = m.title.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + m.year
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

async function main() {
  const jsonPath = path.join(__dirname, '..', 'wikipedia-movies.json')
  let existing = []
  if (fs.existsSync(jsonPath)) {
    existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    console.log(`📂 Existing JSON: ${existing.length} movies`)
  }

  // Years to extract (missing from previous run)
  const missingYears = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2021, 2022, 2023]
  const existingYears = new Set(existing.map(m => m.year))
  const needed = missingYears.filter(y => !existingYears.has(y) || existing.filter(m => m.year === y).length < 30)

  if (needed.length === 0) { console.log('✅ All years already extracted!'); return }
  console.log(`\n🎯 Years to extract: ${needed.join(', ')} (${needed.length} years)\n`)

  const existingNormalized = new Set(existing.map(m => m.title.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + m.year))

  for (const year of needed) {
    process.stdout.write(`📋 ${year}... `)
    const movies = await extract(year)
    process.stdout.write(`${movies.length} movies`)

    let added = 0
    for (const m of movies) {
      const key = m.title.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + m.year
      if (!existingNormalized.has(key)) {
        existing.push(m)
        existingNormalized.add(key)
        added++
      }
    }
    process.stdout.write(` (+${added} new)\n`)
  }

  fs.writeFileSync(jsonPath, JSON.stringify(existing, null, 2))
  console.log(`\n✅ Total in JSON: ${existing.length} movies`)

  const yearBreakdown = {}
  existing.forEach(m => { yearBreakdown[m.year] = (yearBreakdown[m.year] || 0) + 1 })
  console.log(`📊 By year: ${Object.keys(yearBreakdown).sort().map(y => `${y}:${yearBreakdown[y]}`).join(' ')}`)
}

main().catch(err => { console.error('💥', err); process.exit(1) })
