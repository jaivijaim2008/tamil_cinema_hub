import { Suspense } from 'react'
import { client } from '../../sanity/client'
import { paginatedBlogsQuery, blogsCountQuery } from '../../lib/queries'
import BlogCard, { Blog } from '../../components/BlogCard'
import BlogFilters from '../../components/BlogFilters'
import Pagination from '../../components/Pagination'

export const revalidate = 60

const PAGE_SIZE = 12

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; q?: string }> }) {
  const params = await searchParams
  const category = params.category || 'All'
  const q = params.q?.replace(/\*$/, '') || ''

  const title = q
    ? `Search "${q}" Articles`
    : category !== 'All'
      ? `${category} Articles`
      : 'Reviews & Blogs'

  return {
    title,
    description: 'Tamil movie reviews, top lists, actor spotlights, and cinema news — all in one place.',
    openGraph: {
      title,
      description: 'Tamil movie reviews, top lists, actor spotlights, and cinema news — all in one place.',
      type: 'website',
      url: 'https://tamilcinemahub.xyz/blogs',
      images: [{ url: 'https://tamilcinemahub.xyz/opengraph-image', width: 1200, height: 630, alt: 'TamilCinemaHub Reviews & Blogs' }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description: 'Tamil movie reviews, top lists, actor spotlights, and cinema news — all in one place.',
      images: ['https://tamilcinemahub.xyz/opengraph-image'],
    },
    alternates: { canonical: 'https://tamilcinemahub.xyz/blogs' },
  }
}

export default async function BlogsPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; q?: string }> }) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1') || 1)
  const category = params.category || 'All'
  const rawQ = params.q || ''
  const q = rawQ.replace(/\*$/, '')

  const sanitizedQ = q.replace(/[^a-zA-Z0-9\s]/g, '').trim()
  const searchQ = sanitizedQ.length >= 2 ? `${sanitizedQ}*` : ''

  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE

  const [blogs, totalCount] = await Promise.all([
    client.fetch<Blog[]>(paginatedBlogsQuery(start, end), { category, q: searchQ }).catch(() => []),
    client.fetch<number>(blogsCountQuery, { category, q: searchQ }).catch(() => 0),
  ])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const safePage = Math.min(page, totalPages || 1)

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', paddingBottom: 96 }}>
      {/* Page Header */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--rose-light)', marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>
            TamilCinemaHub
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 8, lineHeight: 1.1 }}>
            Reviews & Blogs
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
            Tamil movie reviews, top lists, actor spotlights, and cinema news — all in one place.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 0' }}>
        <Suspense fallback={<div style={{ height: 112, marginBottom: 16 }} />}>
          <BlogFilters />
        </Suspense>

        <p style={{ fontSize: 12, textAlign: 'center', marginBottom: 24, color: 'rgba(255,255,255,0.35)' }}>
          Showing page <span style={{ fontWeight: 700, color: 'var(--crimson)' }}>{safePage}</span> of {totalPages} · {totalCount.toLocaleString()} articles{q ? ` matching "${q}"` : ''}
        </p>

        {blogs.length > 0 ? (
          <div className="blogs-grid-pill reveal-group">
            {blogs.map((blog, i) => (
              <BlogCard key={blog._id} blog={blog} index={i} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '96px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>✍️</p>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>No Articles Found</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', maxWidth: 320, margin: '0 auto' }}>
              No results{q ? ` for "${q}"` : ''}{category !== 'All' ? ` in ${category}` : ''}. Try a different search or category.
            </p>
          </div>
        )}

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          baseUrl="/blogs"
          params={{ category: category !== 'All' ? category : '', q: rawQ }}
        />
      </main>
    </div>
  )
}
