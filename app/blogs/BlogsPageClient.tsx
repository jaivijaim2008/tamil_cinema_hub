'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import type { Blog } from '@/lib/types'
import BlogCard from '@/components/ui/BlogCard'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import AdSenseBanner from '@/components/ui/AdSenseBanner'
import { BLOG_CATEGORIES } from '@/lib/constants'

interface Props {
  initialBlogs: Blog[]
  totalCount: number
  initialCategory: string
  currentPage: number
  totalPages: number
}

export default function BlogsPageClient({
  initialBlogs,
  totalCount,
  initialCategory,
  currentPage,
  totalPages,
}: Props) {
  const [search, setSearch] = useState('')
  const router = useRouter()

  function applyCategory(cat: string) {
    const sp = new URLSearchParams()
    if (cat && cat !== 'All') sp.set('category', cat)
    router.push(`/blogs?${sp.toString()}`)
  }

  const filtered = search
    ? initialBlogs.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase())
      )
    : initialBlogs

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          label="Editorial"
          title="Reviews & Articles"
          description={`Browse ${totalCount.toLocaleString()} articles about Tamil cinema`}
        />

        {/* Search */}
        <div className="relative max-w-md mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => applyCategory(cat)}
              className={`text-xs font-medium rounded-full px-3 py-1.5 transition-all ${
                (initialCategory || 'All') === cat
                  ? 'bg-accent-gold text-text-inverse'
                  : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-border-light'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog grid */}
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>

          </>
        ) : (
          <EmptyState title="No articles found" description="Try adjusting your search or category filter." />
        )}

        {/* AdSense */}
        <div className="my-8">
          <AdSenseBanner slot="0" format="horizontal" minHeight={100} />
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/blogs"
          params={{ category: initialCategory }}
        />
      </div>
    </div>
  )
}
