require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500'

async function main() {
  console.log('Fetching movies without posters...')

  // Get all movies that have tmdbId but no poster
  const movies = await sanity.fetch(`
    *[_type == "movie" && defined(tmdbId) && !defined(poster)] {
      _id, title, tmdbId
    }
  `)

  console.log(`Found ${movies.length} movies without posters`)

  let updated = 0

  for (const movie of movies) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.tmdbId}?api_key=${TMDB_KEY}`
      )
      const data = await res.json()

      if (data.poster_path) {
        const posterUrl = `${TMDB_IMAGE}${data.poster_path}`

        // Download image and upload to Sanity
        const imageRes = await fetch(posterUrl)
        const imageBuffer = await imageRes.buffer()

        const asset = await sanity.assets.upload('image', imageBuffer, {
          filename: `${movie.tmdbId}.jpg`,
          contentType: 'image/jpeg',
        })

        await sanity
          .patch(movie._id)
          .set({
            poster: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: asset._id,
              },
            },
          })
          .commit()

        updated++
        console.log(`Updated poster: ${movie.title} — ${updated} done`)
      }

      await new Promise(r => setTimeout(r, 300))

    } catch (err) {
      console.log(`Error for ${movie.title}: ${err.message}`)
    }
  }

  console.log(`\nDone! Updated ${updated} movie posters`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})