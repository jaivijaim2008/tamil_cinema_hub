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
  // Find movies with tmdbId where cast members are missing posterUrl
  const movies = await sanity.fetch(`
    *[_type == "movie" && defined(tmdbId)] {
      _id, title, tmdbId, cast
    }
  `)

  const needsPatch = movies.filter(m => {
    if (!m.cast || m.cast.length === 0) return false
    // Check if any cast member is an object without posterUrl but with tmdbPersonId
    return m.cast.some(c =>
      typeof c === 'object' && c.tmdbPersonId && !c.posterUrl && !c.photo
    )
  })

  console.log(`Found ${needsPatch.length} movies needing cast posterUrl patch\n`)

  let updated = 0
  for (const movie of needsPatch) {
    try {
      await new Promise(r => setTimeout(r, 300))

      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.tmdbId}?api_key=${TMDB_KEY}&append_to_response=credits`
      )
      const data = await res.json()

      if (!data.credits?.cast) continue

      // Build a map of personId -> profile_path
      const profileMap = {}
      for (const actor of data.credits.cast) {
        if (actor.profile_path) {
          profileMap[actor.id] = `${TMDB_IMAGE}${actor.profile_path}`
        }
      }

      // Update cast members with posterUrl
      const updatedCast = movie.cast.map(c => {
        if (typeof c === 'string') return c
        if (c.posterUrl || c.photo) return c // Already has image
        if (c.tmdbPersonId && profileMap[c.tmdbPersonId]) {
          return { ...c, posterUrl: profileMap[c.tmdbPersonId] }
        }
        return c
      })

      // Check if anything changed
      const changed = JSON.stringify(updatedCast) !== JSON.stringify(movie.cast)
      if (changed) {
        await sanity.patch(movie._id).set({ cast: updatedCast }).commit()
        updated++
        if (updated % 10 === 0) {
          process.stdout.write(`\r  Updated ${updated}/${needsPatch.length}...`)
        }
      }
    } catch (err) {
      // Skip errors silently
    }
  }

  console.log(`\n\nDone! Updated cast posterUrls for ${updated} movies`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
