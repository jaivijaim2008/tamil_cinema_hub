export default {
  name: 'blog',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title (Tanglish)',
      type: 'string',
      description: 'Title in Tanglish (e.g., Vikram Movie Review: Semma Mass Bro!)',
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
      name: 'author',
      title: 'Author',
      type: 'string',
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Review', value: 'Review' },
          { title: 'Top List', value: 'Top List' },
          { title: 'News', value: 'News' },
          { title: 'Actor', value: 'Actor' },
          { title: 'Director', value: 'Director' },
          { title: 'Feature', value: 'Feature' },
          { title: 'Box Office', value: 'Box Office' },
          { title: 'OTT', value: 'OTT' },
          { title: 'Music', value: 'Music' },
          { title: 'Interview', value: 'Interview' },
          { title: 'Opinion', value: 'Opinion' },
        ],
      },
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Short summary of the blog post',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Alternative text for accessibility',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
    },
    {
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
    },
    {
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
      description: 'Estimated reading time in minutes',
      initialValue: 5,
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show this post prominently on the blog listing',
      initialValue: false,
    },
    {
      name: 'authorBio',
      title: 'Author Bio',
      type: 'text',
      description: 'Short bio of the author',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'dislikes',
      title: 'Dislikes',
      type: 'number',
      initialValue: 0,
    },
  ],
}
