/**
 * Clean up bad data created by the Wikipedia scraper.
 * Run: node scripts/cleanup-bad-data.js
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

async function main() {
  // Get all movies that look suspicious (short names with dots = likely director names)
  const movies = await c.fetch(`*[_type == "movie" && year >= 2020 && year <= 2026] | order(year desc) { _id, title, year, director }`)
  
  let deleted = 0
  for (const m of movies) {
    // Detect bad entries: titles that look like person names (have initials with dots)
    if (/^[A-Z]\.\s/.test(m.title) || /^[A-Z][a-z]+\s[A-Z]\./.test(m.title)) {
      // These are likely director names, not movie titles
      console.log(`Bad title (initials): "${m.title}" (${m.year}) — deleting`)
      await c.delete(m._id)
      deleted++
    }
  }

  // Also check for other suspicious patterns
  const suspicious = await c.fetch(`*[_type == "movie" && year >= 2025] { _id, title, year }`)
  const knownDirectors = ['mani ratnam', 'a. r. murugadoss', 'dhanush', 'sekhar kammula', 
    'prabhu solomon', 'pandiraaj', 'shankar dayal', 'arivazhagan', 'ponram', 'nelson venkatesan']

  for (const m of suspicious) {
    if (knownDirectors.includes(m.title.toLowerCase())) {
      console.log(`Bad title (known director): "${m.title}" (${m.year}) — deleting`)
      await c.delete(m._id)
      deleted++
    }
  }

  console.log(`\nDeleted ${deleted} bad entries`)
  const total = await c.fetch('count(*[_type == "movie"])')
  console.log(`Total movies now: ${total}`)
}

main().catch(console.error)
