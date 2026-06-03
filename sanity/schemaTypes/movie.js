export default {
  name: 'movie',
  title: 'Tamil Movie',
  type: 'document',
  fields: [
    { name: 'title', title: 'Movie Title', type: 'string' },
    { name: 'titleTanglish', title: 'Title in Tanglish', type: 'string' },
    { name: 'slug', title: 'URL Slug', type: 'slug',
      options: { source: 'title' } },
    { name: 'year', title: 'Release Year', type: 'number' },
    { name: 'director', title: 'Director', type: 'string' },
    { 
  name: 'cast', 
  title: 'Main Cast', 
  type: 'array',
  of: [{ 
    type: 'object',
    fields: [
      { name: 'name', title: 'Actor Name', type: 'string' },
      { name: 'character', title: 'Character Name', type: 'string' },
      { name: 'photo', title: 'Actor Photo', type: 'image' },
      { name: 'tmdbPersonId', title: 'TMDB Person ID', type: 'number' },
    ]
  }]
},
    { name: 'genre', title: 'Genre', type: 'array',
      of: [{ type: 'string' }] },
    { name: 'rating', title: 'Our Rating (out of 5)', type: 'number' },
    { name: 'poster', title: 'Poster Image', type: 'image' },
    { name: 'backdropImage', title: 'Backdrop / Hero Image', type: 'image' },
    { name: 'synopsis', title: 'Synopsis in Tanglish', type: 'text' },
    { name: 'ottPlatform', title: 'OTT Platform', type: 'string' },
    { name: 'tmdbId', title: 'TMDB ID', type: 'number' },
    { name: 'review', title: 'Full Review (Tanglish)', type: 'array',
      of: [{ type: 'block' }] },
  ]
}