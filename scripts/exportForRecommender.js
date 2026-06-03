require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const fs = require('fs')

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function main() {
  console.log('Fetching movies from Sanity...')

  const movies = await sanity.fetch(`
    *[_type == "movie"] {
      title,
      "slug": slug.current,
      year,
      director,
      cast,
      genre
    }
  `)

  fs.writeFileSync(
    'recommender-api/movies.json',
    JSON.stringify(movies, null, 2)
  )

  console.log(`Done! Exported ${movies.length} movies to recommender-api/movies.json`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})