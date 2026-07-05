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
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w185'

async function main() {
  console.log('Fetching movies that need cast photos...')

  // Get movies where cast is still strings (old format)
  const movies = await sanity.fetch(`
    *[_type == "movie" && defined(tmdbId)] {
      _id, title, tmdbId, cast
    }
  `)

  console.log(`Found ${movies.length} movies to process\n`)

  let updated = 0

  for (const movie of movies) {

    // Skip if cast is already in new object format
    if (movie.cast && movie.cast.length > 0 && typeof movie.cast[0] === 'object' && movie.cast[0].name) {
      console.log(`Skipped (already updated): ${movie.title}`)
      continue
    }

    try {
      await new Promise(r => setTimeout(r, 300))

      // Fetch full credits from TMDB
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.tmdbId}?api_key=${TMDB_KEY}&append_to_response=credits`
      )
      const data = await res.json()

      const castList = data.credits?.cast?.slice(0, 5) || []
      const newCast = []

      for (const actor of castList) {
        const castMember = {
          _type: 'object',
          _key: `cast-${actor.id}`,
          name: actor.name,
          character: actor.character || '',
          tmdbPersonId: actor.id,
        }

        // Store TMDB profile image URL directly (no upload needed)
        if (actor.profile_path) {
          castMember.posterUrl = `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        }

        newCast.push(castMember)
        await new Promise(r => setTimeout(r, 200))
      }

      // Save updated cast to Sanity
      await sanity.patch(movie._id).set({ cast: newCast }).commit()
      updated++
      console.log(`Updated (${updated}): ${movie.title} — ${newCast.length} cast members`)

    } catch (err) {
      console.log(`Error: ${movie.title}: ${err.message}`)
    }
  }

  console.log(`\nDone! Updated cast for ${updated} movies`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})