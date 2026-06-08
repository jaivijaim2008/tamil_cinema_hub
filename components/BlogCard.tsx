'use client'

import Link from 'next/link'
import { urlFor } from '../sanity/lib/image'
import TiltCard from './TiltCard'

export interface Blog {
  _id: string
  title: string
  slug: string
  author: string
  publishedAt: string
  category: 'Review' | 'Top List' | 'News' | 'Actor' | 'Director' | string
  mainImage?: any
  excerpt: string
  tags?: string[]
  commentCount?: number
  likes?: number
}

interface BlogCardProps {
  blog: Blog
  index?: number
}

const CATEGORY_TAG_CLASS: Record<string, string> = {
  Review: 'tag-review',
  'Top List': 'tag-toplist',
  News: 'tag-news',
  Actor: 'tag-actor',
  Director: 'tag-director',
}

export default function BlogCard({ blog, index = 0 }: BlogCardProps) {
  const imageUrl = blog.mainImage
    ? urlFor(blog.mainImage).width(600).height(340).quality(90).fit('max').url()
    : null

  const formattedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const tagClass = CATEGORY_TAG_CLASS[blog.category] || 'tag-review'

  return (
    <TiltCard className="blog-card" maxTilt={6} perspective={1000} scale={1.02}>
      <Link href={`/blogs/${blog.slug}`} className="block h-full">
        <div className="blog-card-image">
          {imageUrl ? (
            <img src={imageUrl} alt={blog.title} loading="lazy" />
          ) : (
            <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <span className={`blog-category-tag ${tagClass}`}>{blog.category}</span>
        </div>
        <div className="blog-card-body">
          <span className="blog-author-line">{blog.author} · {formattedDate}</span>
          <h3 className="blog-title">{blog.title}</h3>
          <p className="blog-excerpt">{blog.excerpt}</p>
          <span className="blog-read-link">
            Read article
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
      </Link>
    </TiltCard>
  )
}
