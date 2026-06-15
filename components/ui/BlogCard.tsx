'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User } from 'lucide-react'
import type { Blog } from '@/lib/types'
import { urlFor } from '@/sanity/lib/image'

interface Props {
  blog: Blog
  variant?: 'default' | 'featured'
}

export default function BlogCard({ blog, variant = 'default' }: Props) {
  const imageUrl = blog.mainImage
    ? urlFor(blog.mainImage).width(800).height(450).url()
    : null

  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const categoryColors: Record<string, string> = {
    Review: '#E8B84B',
    'Top List': '#3b82f6',
    News: '#ef4444',
    Actor: '#a855f7',
    Director: '#06b6d4',
    Feature: '#22c55e',
  }

  if (variant === 'featured') {
    return (
      <Link href={`/blogs/${blog.slug}`} className="group block">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-bg-card border border-border group-hover:border-accent-gold/20 transition-all duration-300">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-3"
              style={{
                backgroundColor: `${categoryColors[blog.category] || '#666'}20`,
                color: categoryColors[blog.category] || '#999',
              }}
            >
              {blog.category}
            </span>
            <h2 className="text-xl md:text-3xl font-bold text-white leading-tight mb-2 group-hover:text-accent-gold transition-colors">
              {blog.title}
            </h2>
            {blog.excerpt && (
              <p className="text-sm text-white/60 line-clamp-2 max-w-xl">{blog.excerpt}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
              {blog.author && (
                <span className="flex items-center gap-1">
                  <User size={12} /> {blog.author}
                </span>
              )}
              {date && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {date}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/blogs/${blog.slug}`} className="group block">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-bg-card border border-border group-hover:border-accent-gold/20 transition-all duration-300">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={blog.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-2 left-2">
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5"
            style={{
              backgroundColor: `${categoryColors[blog.category] || '#666'}20`,
              color: categoryColors[blog.category] || '#999',
            }}
          >
            {blog.category}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 group-hover:text-accent-gold transition-colors">
          {blog.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
          {blog.author && <span>{blog.author}</span>}
          {date && (
            <>
              <span>•</span>
              <span>{date}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
