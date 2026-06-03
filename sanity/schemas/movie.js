export default {
  name: 'movie',
  title: 'Tamil Movie',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Movie Title',
      type: 'string',
    },
    {
      name: 'titleTanglish',
      title: 'Title in Tanglish',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'year',
      title: 'Release Year',
      type: 'number',
    },
    {
      name: 'director',
      title: 'Director',
      type: 'string',
    },
    {
      name: 'cast',
      title: 'Cast',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'genre',
      title: 'Genre',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'rating',
      title: 'Rating (out of 5)',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(5),
    },
    {
      name: 'poster',
      title: 'Poster Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'synopsis',
      title: 'Synopsis (Tanglish)',
      type: 'text',
      description: 'Short synopsis in Tanglish',
    },
    {
      name: 'ottPlatform',
      title: 'OTT Platform',
      type: 'string',
    },
    {
      name: 'tmdbId',
      title: 'TMDB ID',
      type: 'number',
    },
    {
      name: 'review',
      title: 'Full Review (Tanglish)',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
}
