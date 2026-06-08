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
      images: [
        {
          url: 'https://tamilcinemahub.xyz/opengraph-image',
          width: 1200,
          height: 630,
          alt: 'TamilCinemaHub Reviews & Blogs',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description: 'Tamil movie reviews, top lists, actor spotlights, and cinema news — all in one place.',
      images: ['https://tamilcinemahub.xyz/opengraph-image'],
    },
    alternates: {
      canonical: 'https://tamilcinemahub.xyz/blogs',
    },
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
    <div className="min-h-screen pb-24" style={{ background: '#F7F7F5' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E7E3' }}>
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: '#D4291A' }}>
            TamilCinemaHub
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}
          >
            Reviews & Blogs
          </h1>
          <p className="text-base" style={{ color: '#666666' }}>
            Tamil movie reviews, top lists, actor spotlights, and cinema news — all in one place.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1280px] px-6 pt-8">

        {/* ── FILTERS (client component) ──────────────────────────────── */}
        <Suspense fallback={<div className="h-28 mb-4" />}>
          <BlogFilters totalCount={totalCount} />
        </Suspense>

        {/* Result count */}
        <p className="text-xs text-center mb-6" style={{ color: '#888888' }}>
          Showing page{' '}
          <span className="font-semibold" style={{ color: '#D4291A' }}>{safePage}</span>{' '}
          of {totalPages} · {totalCount.toLocaleString()} articles
          {q ? ` matching "${q}"` : ''}
        </p>

        {/* ── GRID ────────────────────────────────────────────────────── */}
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-24 rounded-xl"
            style={{ background: '#FFFFFF', border: '1px solid #E8E7E3' }}
          >
            <p className="text-4xl mb-4">✍️</p>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}>No Articles Found</h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: '#888888' }}>
              No results{q ? ` for "${q}"` : ''}{category !== 'All' ? ` in ${category}` : ''}. Try a different search or category.
            </p>
          </div>
        )}

        {/* ── PAGINATION ─────────────────────────────────────────────── */}
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
