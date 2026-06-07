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
}

interface BlogCardProps {
  blog: Blog
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  Review:    { bg: 'rgba(124,58,237,0.25)',  text: '#a78bfa' },
  'Top List':{ bg: 'rgba(249,115,22,0.25)',  text: '#fb923c' },
  News:      { bg: 'rgba(59,130,246,0.25)',  text: '#60a5fa' },
  Actor:     { bg: 'rgba(236,72,153,0.25)',  text: '#f472b6' },
  Director:  { bg: 'rgba(16,185,129,0.25)',  text: '#34d399' },
  default:   { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.5)' },
}

export default function BlogCard({ blog }: BlogCardProps) {
  const imageUrl = blog.mainImage
    ? urlFor(blog.mainImage).width(600).height(340).quality(90).fit('max').url()
    : null

  const formattedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const catStyle = CATEGORY_STYLES[blog.category] ?? CATEGORY_STYLES.default

  return (
    <Link href={`/blogs/${blog.slug}`} className="group block h-full">
      <article
        className="flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Cover image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ background: '#111122' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={blog.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #1a0a2e, #2d1b69)' }}
            >
              <svg
                className="h-10 w-10 opacity-20 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: catStyle.text }}
              >
                {blog.category}
              </span>
            </div>
          )}

          {/* Bottom gradient */}
          <div
            className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(7,7,15,0.9), transparent)' }}
          />

          {/* Category badge */}
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: catStyle.bg, color: catStyle.text, backdropFilter: 'blur(8px)' }}
          >
            {blog.category}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          {/* Meta */}
          <div className="flex items-center justify-between text-[10px] text-white/30 font-medium mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {blog.author}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-black text-white line-clamp-2 leading-snug group-hover:text-violet-300 transition-colors">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="mt-2 text-xs text-white/40 line-clamp-3 leading-relaxed flex-1">
            {blog.excerpt}
          </p>

          {/* Comment count */}
          {blog.commentCount != null && blog.commentCount > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-white/30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-[11px] font-medium">{blog.commentCount} {blog.commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {blog.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Read more arrow */}
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-white/25 group-hover:text-violet-400 transition-colors">
            Read article
            <svg
              className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>

        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(124,58,237,0.4)' }}
        />
      </article>
    </Link>
  )
}