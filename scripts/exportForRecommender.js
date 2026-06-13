require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const fs = require('fs')

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

async function main() {
  console.log('Fetching movies from Sanity for ML recommender...')

  const movies = await sanity.fetch(`
    *[_type == "movie"] {
      title,
      "slug": slug.current,
      year,
      director,
      cast,
      genre,
      rating,
      synopsis,
      ottPlatform,
      backdropUrl
    }
  `)

  // Normalize data for ML engine
  const normalized = movies.map(m => ({
    title: m.title || 'Untitled',
    slug: m.slug || '',
    year: m.year || 0,
    director: m.director || 'Unknown',
    cast: Array.isArray(m.cast)
      ? m.cast.map(c => {
          if (typeof c === 'string') return { name: c }
          return {
            name: c.name || 'Unknown',
            character: c.character || '',
            tmdbPersonId: c.tmdbPersonId,
          }
        })
      : [],
    genre: Array.isArray(m.genre) ? m.genre : [],
    rating: typeof m.rating === 'number' ? m.rating : 0,
    synopsis: m.synopsis || '',
    ottPlatform: m.ottPlatform || '',
    backdropUrl: m.backdropUrl || '',
  }))

  fs.writeFileSync(
    'recommender-api/movies.json',
    JSON.stringify(normalized, null, 2)
  )

  console.log(`\u2705 Exported ${normalized.length} movies to recommender-api/movies.json`)

  // Print stats
  const withRating = normalized.filter(m => m.rating > 0).length
  const withSynopsis = normalized.filter(m => m.synopsis.length > 0).length
  const withCast = normalized.filter(m => m.cast.length > 0).length
  console.log(`   With rating: ${withRating}/${normalized.length}`)
  console.log(`   With synopsis: ${withSynopsis}/${normalized.length}`)
  console.log(`   With cast: ${withCast}/${normalized.length}`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})