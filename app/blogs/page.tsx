import { Suspense } from 'react'
import { client } from '../../sanity/client'
import { paginatedBlogsQuery, blogsCountQuery } from '../../lib/queries'
import BlogCard, { Blog } from '../../components/BlogCard'
import BlogFilters from '../../components/BlogFilters'
import Pagination from '../../components/Pagination'
import { Newspaper, Sparkles, Hash } from 'lucide-react'

export const revalidate = 60

const PAGE_SIZE = 12

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; q?: string }> }) {
  const params = await searchParams
  return {
    title: 'Editorial | TamilCinemaHub',
    description: 'Expert reviews and cinema news.',
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
    <div className="bg-ink min-h-screen pb-24">
      
      {/* ── HEADER ── */}
      <section className="relative pt-40 pb-20 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
           <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet rounded-full blur-[120px]" />
        </div>

        <div className="section-container relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg glass border-white/10 mb-6">
                <Newspaper size={12} className="text-violet" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Editorial Columns</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-[0.9] uppercase mb-6">
                The <span className="text-gradient">Review</span>
              </h1>
              <p className="text-lg text-white/30 font-medium">
                Deep dives, critical analysis, and the latest news from the heart of Kollywood.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS & GRID ── */}
      <main className="section-container">
        <div className="mb-20">
          <Suspense fallback={<div className="h-32 bg-white/5 rounded-3xl animate-pulse" />}>
            <BlogFilters />
          </Suspense>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {blogs.map((blog, i) => (
              <BlogCard key={blog._id} blog={blog} index={i} />
            ))}
          </div>
        ) : (
          <div className="bento-card p-24 text-center">
            <Hash size={64} className="text-white/5 mx-auto mb-8" />
            <h3 className="text-2xl font-display font-black text-white uppercase mb-4">No Articles Found</h3>
            <p className="text-white/30 font-medium max-w-sm mx-auto">
              Our writers haven&apos;t covered this specific topic yet. Try searching for a director or actor name.
            </p>
          </div>
        )}

        <div className="mt-20">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            baseUrl="/blogs"
            params={{ category: category !== 'All' ? category : '', q: rawQ }}
          />
        </div>
      </main>
    </div>
  )
}
