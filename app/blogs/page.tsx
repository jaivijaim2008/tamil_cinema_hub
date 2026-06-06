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
    <div className="min-h-screen pb-24" style={{ background: '#07070f' }}>

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16 text-center">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(249,115,22,0.25) 0%, rgba(109,40,217,0.2) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px',
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">
            TamilCinemaHub
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Reviews &{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #fb923c, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Blogs
            </span>
          </h1>
          <p className="mt-4 text-sm text-white/40 max-w-md mx-auto">
            Tamil movie reviews, top lists, actor spotlights, and cinema news — all in one place.
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to bottom, transparent, #07070f)' }}
        />
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── FILTERS (client component) ──────────────────────────────── */}
        <Suspense fallback={<div className="h-28 mb-4" />}>
          <BlogFilters totalCount={totalCount} />
        </Suspense>

        {/* Result count */}
        <p className="text-xs text-white/25 text-center mb-6">
          Showing page{' '}
          <span className="font-bold text-orange-400">{safePage}</span>{' '}
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
            className="text-center py-24 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-4xl mb-4">✍️</p>
            <h3 className="text-lg font-black text-white mb-2">No Articles Found</h3>
            <p className="text-sm text-white/30 max-w-xs mx-auto">
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
