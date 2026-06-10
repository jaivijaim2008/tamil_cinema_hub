require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function main() {
  const total = await c.fetch('count(*[_type == "movie"])')
  console.log('Total movies:', total)

  const missingDirector = await c.fetch('count(*[_type == "movie" && (!defined(director) || director == "" || director == "Unknown")])')
  const missingRating = await c.fetch('count(*[_type == "movie" && (!defined(rating) || rating == 0)])')
  const missingSynopsis = await c.fetch('count(*[_type == "movie" && (!defined(synopsis) || synopsis == "")])')
  const missingPoster = await c.fetch('count(*[_type == "movie" && (!defined(poster) && (!defined(posterUrl) || posterUrl == ""))])')
  const missingOtt = await c.fetch('count(*[_type == "movie" && (!defined(ottPlatform) || ottPlatform == "")])')
  const missingGenre = await c.fetch('count(*[_type == "movie" && (!defined(genre) || genre == [])])')
  const missingTmdbId = await c.fetch('count(*[_type == "movie" && !defined(tmdbId)])')
  
  console.log('\n=== Missing Data Stats ===')
  console.log(`Missing Director: ${missingDirector}`)
  console.log(`Missing Rating: ${missingRating}`)
  console.log(`Missing Synopsis: ${missingSynopsis}`)
  console.log(`Missing Poster: ${missingPoster}`)
  console.log(`Missing OTT: ${missingOtt}`)
  console.log(`Missing Genre: ${missingGenre}`)
  console.log(`Missing TMDB ID: ${missingTmdbId}`)
  console.log(`Complete (all fields): ${total - missingDirector - missingRating - missingSynopsis - missingPoster - missingOtt - missingGenre}`)

  // Get year distribution
  const movies = await c.fetch('*[_type == "movie"] { title, year, rating, director } | order(year desc)')
  
  const byYear = {}
  for (const m of movies) {
    const y = m.year || 0
    byYear[y] = (byYear[y] || 0) + 1
  }
  
  console.log('\n=== Movies by Year ===')
  for (const year of Object.keys(byYear).sort((a, b) => b - a)) {
    console.log(`${year}: ${byYear[year]} movies`)
  }

  // Latest 10 movies
  console.log('\n=== Latest 10 movies ===')
  movies.slice(0, 10).forEach(m => {
    console.log(`${m.title} (${m.year}) - Dir: ${m.director || 'N/A'} - Rating: ${m.rating || 'N/A'}`)
  })
  
  console.log('\n=== Earliest 5 movies ===')
  movies.slice(-5).forEach(m => {
    console.log(`${m.title} (${m.year}) - Dir: ${m.director || 'N/A'} - Rating: ${m.rating || 'N/A'}`)
  })
}

main().catch(console.error)
