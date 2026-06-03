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
  console.log('Fetching movies that need images...')

  const movies = await sanity.fetch(`
    *[_type == "movie" && defined(tmdbId) && (
      !defined(poster) || !defined(backdropImage)
    )] {
      _id, title, tmdbId,
      "hasPoster": defined(poster),
      "hasBackdrop": defined(backdropImage)
    }
  `)

  console.log(`Found ${movies.length} movies needing images\n`)

  let updated = 0
  let skipped = 0

  for (const movie of movies) {
    try {
      await new Promise(r => setTimeout(r, 300))

      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.tmdbId}?api_key=${TMDB_KEY}`
      )
      const data = await res.json()
      const updates = {}

      // Poster
      if (!movie.hasPoster && data.poster_path) {
        try {
          const posterRes = await fetch(`${TMDB_IMAGE}${data.poster_path}`)
          const posterBuffer = await posterRes.buffer()
          const posterAsset = await sanity.assets.upload('image', posterBuffer, {
            filename: `poster-${movie.tmdbId}.jpg`,
            contentType: 'image/jpeg',
          })
          updates.poster = {
            _type: 'image',
            asset: { _type: 'reference', _ref: posterAsset._id }
          }
        } catch (err) {
          console.log(`  Poster failed: ${movie.title}: ${err.message}`)
        }
      }

      // Backdrop
      if (!movie.hasBackdrop && data.backdrop_path) {
        try {
          const backdropRes = await fetch(`${TMDB_IMAGE}${data.backdrop_path}`)
          const backdropBuffer = await backdropRes.buffer()
          const backdropAsset = await sanity.assets.upload('image', backdropBuffer, {
            filename: `backdrop-${movie.tmdbId}.jpg`,
            contentType: 'image/jpeg',
          })
          updates.backdropImage = {
            _type: 'image',
            asset: { _type: 'reference', _ref: backdropAsset._id }
          }
        } catch (err) {
          console.log(`  Backdrop failed: ${movie.title}: ${err.message}`)
        }
      }

      if (Object.keys(updates).length > 0) {
        await sanity.patch(movie._id).set(updates).commit()
        updated++
        console.log(`Updated (${updated}): ${movie.title}`)
      } else {
        skipped++
        console.log(`Skipped — both exist: ${movie.title}`)
      }

    } catch (err) {
      console.log(`Error: ${movie.title}: ${err.message}`)
    }
  }

  console.log(`\nDone! Updated: ${updated} | Skipped: ${skipped}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})