export default {
 name: 'blog',
 title: 'Blog Post',
 type: 'document',
 fields: [
 { name: 'title', title: 'Title (Tanglish)', type: 'string' },
 { name: 'slug', title: 'URL Slug', type: 'slug',
 options: { source: 'title' } },
 { name: 'author', title: 'Author', type: 'string' },
 { name: 'publishedAt', title: 'Published Date', type: 'datetime' },
 { name: 'category', title: 'Category', type: 'string',
 options: { list: ['Review','Top List','News','Actor','Director','Feature'] } },
 { name: 'mainImage', title: 'Cover Image', type: 'image' },
 { name: 'excerpt', title: 'Short Description', type: 'text' },
 { name: 'body', title: 'Blog Content', type: 'array', of: [
    { type: 'block' },
    {
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt Text', type: 'string' },
        { name: 'caption', title: 'Caption', type: 'string' },
      ],
    },
  ] },
 { name: 'seoTitle', title: 'SEO Title', type: 'string' },
 { name: 'seoDescription', title: 'SEO Description', type: 'text' },
 { name: 'tags', title: 'Tags', type: 'array',
 of: [{ type: 'string' }] },
 { name: 'likes', title: 'Likes', type: 'number', initialValue: 0 },
 { name: 'dislikes', title: 'Dislikes', type: 'number', initialValue: 0 },
 ]
}
