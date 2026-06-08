'use client'

import Link from 'next/link'
import { urlFor } from '../sanity/lib/image'

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

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  Review:    { bg: '#FFF5F5', text: '#D4291A' },
  'Top List':{ bg: '#FFF8EE', text: '#C8973A' },
  News:      { bg: '#F0F7FF', text: '#1A6BD4' },
  Actor:     { bg: '#FFF5F5', text: '#D4291A' },
  Director:  { bg: '#F0FFF4', text: '#1A8C4E' },
  default:   { bg: '#F7F7F5', text: '#888888' },
}

export default function BlogCard({ blog, index = 0 }: BlogCardProps) {
  const imageUrl = blog.mainImage
    ? urlFor(blog.mainImage).width(600).height(340).quality(90).fit('max').url()
    : null

  const formattedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const catStyle = CATEGORY_STYLES[blog.category] ?? CATEGORY_STYLES.default

  return (
    <Link href={`/blogs/${blog.slug}`} className="group block h-full">
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[10px] transition-all duration-[280ms]"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E7E3',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        }}
      >
        {/* Cover image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ background: '#F2F1EE' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={blog.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-10 w-10 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}

          {/* Category badge */}
          <span
            className="absolute left-3 top-3 rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{ background: catStyle.bg, color: catStyle.text }}
          >
            {blog.category}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          {/* Author + date */}
          <div className="flex items-center text-[12px] text-[#888] mb-2">
            <span>{blog.author}</span>
            <span className="mx-1.5">·</span>
            <span>{formattedDate}</span>
          </div>

          {/* Title */}
          <h3
            className="text-[20px] font-semibold text-[#111] line-clamp-2 leading-[1.35]"
            style={{ fontFamily: "'Fraunces', serif", margin: '8px 0 10px' }}
          >
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-[14px] text-[#666] line-clamp-2 leading-[1.65] flex-1">
            {blog.excerpt}
          </p>

          {/* Read article link */}
          <div className="mt-3.5 text-[13px] font-medium text-[#D4291A] group-hover:underline">
            Read article →
          </div>
        </div>
      </div>
    </Link>
  )
}
