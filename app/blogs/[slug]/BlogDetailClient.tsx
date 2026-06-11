'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import type { BlogDetail } from '@/lib/types'
import type { Blog } from '@/lib/types'
import { urlFor } from '@/sanity/lib/image'
import PortableText from '@/components/ui/PortableText'
import BlogCard from '@/components/ui/BlogCard'

interface Props {
  blog: BlogDetail
  related: Blog[]
}

const categoryColors: Record<string, string> = {
  Review: '#E8B84B',
  'Top List': '#3b82f6',
  News: '#ef4444',
  Actor: '#a855f7',
  Director: '#06b6d4',
  Feature: '#22c55e',
}

export default function BlogDetailClient({ blog, related }: Props) {
  const imageUrl = blog.mainImage ? urlFor(blog.mainImage).width(1200).height(630).url() : null
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen pt-16 md:pt-24 pb-16">
      {/* Hero image */}
      {imageUrl && (
        <div className="relative h-[30vh] md:h-[45vh] overflow-hidden">
          <Image src={imageUrl} alt={blog.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        </div>
      )}

      <div className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${imageUrl ? '-mt-20 relative' : 'pt-8'}`}>
        {/* Back */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={12} /> Back to Reviews
        </Link>

        {/* Category */}
        <span
          className="inline-block text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4"
          style={{
            backgroundColor: `${categoryColors[blog.category] || '#666'}20`,
            color: categoryColors[blog.category] || '#999',
          }}
        >
          {blog.category}
        </span>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold text-text-primary leading-tight mb-4">
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted mb-8">
          {blog.author && (
            <span className="flex items-center gap-1"><User size={14} /> {blog.author}</span>
          )}
          {date && (
            <span className="flex items-center gap-1"><Calendar size={14} /> {date}</span>
          )}
        </div>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-base text-text-secondary leading-relaxed mb-8 pb-8 border-b border-border">
            {blog.excerpt}
          </p>
        )}

        {/* Body */}
        {blog.body && blog.body.length > 0 && (
          <div className="prose prose-invert prose-sm max-w-none mb-12">
            <PortableText value={blog.body as any} />
          </div>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12 pb-8 border-b border-border">
            <Tag size={14} className="text-text-muted" />
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-text-secondary bg-bg-card border border-border rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r, i) => (
                <BlogCard key={r._id} blog={r} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
