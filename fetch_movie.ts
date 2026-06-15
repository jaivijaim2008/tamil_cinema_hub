import { client } from './sanity/client';
import { movieBySlugQuery } from './lib/queries';

async function test() {
  const movies = await client.fetch(`*[_type == "movie"][0...5]{ slug }`);
  console.log('Available movies:', movies);
  
  if (movies.length > 0) {
    const movie = await client.fetch(movieBySlugQuery, { slug: movies[0].slug.current });
    console.log('Movie data:', movie);
  }
}

test().catch(console.error);
