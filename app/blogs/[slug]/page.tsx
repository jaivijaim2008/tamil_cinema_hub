import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { client } from '../../../sanity/client'
import { blogBySlugQuery, relatedBlogsQuery } from '../../../lib/queries'
import { urlFor } from '../../../sanity/lib/image'
import { Blog } from '../../../components/BlogCard'
import BlogReactions from '../../../components/BlogReactions'
import BlogComments from '../../../components/BlogComments'

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlogDetailProps {
  params: Promise<{ slug: string }>
}

interface BlogDetail extends Blog {
  body?: any
  seoTitle?: string
  seoDescription?: string
  readTime?: number
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getBlogData(slug: string) {
  try {
    const blog = await client.fetch<BlogDetail>(blogBySlugQuery, { slug })
    if (!blog) return null
    const related = await client.fetch<Blog[]>(relatedBlogsQuery, {
      category: blog.category,
      slug: blog.slug,
    })
    return { blog, related }
  } catch (error) {
    console.error('Error fetching blog details:', error)
    return null
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getBlogData(slug)
  if (!data?.blog) return { title: 'Blog Not Found | TamilCinemaHub' }

  const { blog } = data
  const ogImageUrl = blog.mainImage ? urlFor(blog.mainImage).width(1200).height(630).url() : ''
  return {
    title: `${blog.seoTitle || blog.title} | TamilCinemaHub`,
    description: blog.seoDescription || blog.excerpt,
    openGraph: {
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt,
      type: 'article',
      publishedTime: blog.publishedAt,
      modifiedTime: blog.publishedAt,
      authors: [blog.author],
      url: `https://tamilcinemahub.xyz/blogs/${slug}`,
      siteName: 'TamilCinemaHub',
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: blog.title }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
    alternates: {
      canonical: `https://tamilcinemahub.xyz/blogs/${slug}`,
    },
  }
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { color: string; glow: string; label: string }> = {
  Review:     { color: '#a855f7', glow: 'rgba(168,85,247,0.3)',  label: '★ Review' },
  'Top List': { color: '#f97316', glow: 'rgba(249,115,22,0.3)',  label: '⊞ Top List' },
  News:       { color: '#3b82f6', glow: 'rgba(59,130,246,0.3)',  label: '◉ News' },
  Actor:      { color: '#ec4899', glow: 'rgba(236,72,153,0.3)',  label: '♦ Actor' },
  Director:   { color: '#10b981', glow: 'rgba(16,185,129,0.3)',  label: '◈ Director' },
}

// ─── PortableText components ──────────────────────────────────────────────────

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="mb-5 text-[17px] leading-[1.85] text-[#c8c8d8]">{children}</p>
    ),
    h1: ({ children }: any) => (
      <h1 className="mt-10 mb-4 text-3xl font-black text-white tracking-tight">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="mt-10 mb-4 text-2xl font-black text-white tracking-tight">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mt-8 mb-3 text-xl font-bold text-white">{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-8 pl-5 border-l-2 border-violet-500 italic text-[#b8b0d8] text-[17px] leading-relaxed">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="mb-5 space-y-2 pl-6 list-none">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="mb-5 space-y-2 pl-6 list-decimal text-[#c8c8d8]">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="flex items-start gap-2 text-[17px] text-[#c8c8d8] leading-relaxed">
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-violet-300">{children}</em>,
    link: ({ value, children }: any) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-violet-400 underline underline-offset-2 hover:text-violet-300 transition-colors"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => {
      const url = value?.asset ? urlFor(value).width(900).quality(90).fit('max').url() : null
      if (!url) return null
      return (
        <figure className="my-8 mx-auto max-w-[85%] overflow-hidden rounded-xl">
          <img src={url} alt={value.alt || ''} className="w-full object-cover rounded-lg" loading="lazy" />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-[#888]">{value.caption}</figcaption>
          )}
        </figure>
      )
    },
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params
  const data = await getBlogData(slug)

  if (!data?.blog) notFound()

  const { blog, related } = data
  const cat = CATEGORY_CONFIG[blog.category] ?? { color: '#a855f7', glow: 'rgba(168,85,247,0.3)', label: blog.category }
  const coverUrl = blog.mainImage ? urlFor(blog.mainImage).width(1400).height(600).quality(90).fit('max').url() : null
  const formattedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt,
      image: coverUrl || '',
      url: `https://tamilcinemahub.xyz/blogs/${slug}`,
      author: {
        '@type': 'Person',
        name: blog.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'TamilCinemaHub',
        url: 'https://tamilcinemahub.xyz',
      },
      datePublished: blog.publishedAt,
      dateModified: blog.publishedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://tamilcinemahub.xyz/blogs/${slug}`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tamilcinemahub.xyz' },
        { '@type': 'ListItem', position: 2, name: 'Blogs', item: 'https://tamilcinemahub.xyz/blogs' },
        { '@type': 'ListItem', position: 3, name: blog.title },
      ],
    },
  ]

  return (
    <main
      className="min-h-screen"
      style={{ background: '#07070f', fontFamily: "'Outfit', sans-serif" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Hero ── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 'clamp(320px, 52vw, 580px)' }}>
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt={blog.title}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: 'brightness(0.28) saturate(1.2)' }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(7,7,15,0.1) 0%, rgba(7,7,15,0.55) 60%, #07070f 100%)',
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${cat.glow} 0%, transparent 70%), #07070f`,
            }}
          />
        )}

        {/* film grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '180px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 flex flex-col justify-end h-full pb-12 pt-24">
          <Link
            href="/blogs"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors self-start"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Articles
          </Link>

          <span
            className="mb-4 inline-flex self-start items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
            style={{
              background: `${cat.color}22`,
              color: cat.color,
              border: `1px solid ${cat.color}44`,
            }}
          >
            {cat.label}
          </span>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] text-white tracking-tight"
            style={{ textShadow: '0 2px 30px rgba(0,0,0,0.7)' }}
          >
            {blog.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              {blog.author}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {formattedDate}
            </span>
            {blog.readTime && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
                </svg>
                {blog.readTime} min read
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-24">
        {blog.excerpt && (
          <p
            className="mt-8 mb-10 text-lg sm:text-xl leading-relaxed font-medium"
            style={{ color: '#a09ab8' }}
          >
            {blog.excerpt}
          </p>
        )}

        <div
          className="mb-10 h-px w-full"
          style={{ background: `linear-gradient(to right, transparent, ${cat.color}55, transparent)` }}
        />

        <article>
          {blog.body ? (
            <PortableText value={blog.body} components={ptComponents} />
          ) : (
            <p className="text-[#666] italic">No content available for this post.</p>
          )}
        </article>

        {/* Reactions */}
        <BlogReactions slug={slug} />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {blog.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-lg px-3 py-1 text-xs font-semibold"
                style={{
                  background: 'rgba(168,85,247,0.1)',
                  color: '#a78bfa',
                  border: '1px solid rgba(168,85,247,0.2)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments */}
        <BlogComments slug={slug} />

        {/* ── Related Articles ── */}
        {related && related.length > 0 && (
          <section className="mt-20">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: cat.color }}>
                  More Articles
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">Related Reads</h2>
              </div>
              <Link
                href="/blogs"
                className="text-sm font-semibold text-white/40 hover:text-white transition-colors flex items-center gap-1"
              >
                All Articles
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((rel) => {
                const relCat = CATEGORY_CONFIG[rel.category] ?? cat
                const relImg = rel.mainImage ? urlFor(rel.mainImage).width(500).height(280).quality(85).fit('max').url() : null
                const relDate = new Date(rel.publishedAt).toLocaleDateString('en-US', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
                return (
                  <Link
                    key={rel._id}
                    href={`/blogs/${rel.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {relImg ? (
                        <img
                          src={relImg}
                          alt={rel.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="h-full w-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${relCat.color}22, ${relCat.color}08)` }}
                        >
                          <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
                          </svg>
                        </div>
                      )}
                      <span
                        className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: `${relCat.color}22`, color: relCat.color, border: `1px solid ${relCat.color}44` }}
                      >
                        {rel.category}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 p-4">
                      <div className="flex items-center justify-between text-[11px] text-white/35 mb-2">
                        <span>{rel.author}</span>
                        <span>{relDate}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
                        {rel.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/40 line-clamp-2">{rel.excerpt}</p>
                      <span className="mt-auto pt-3 text-xs font-semibold flex items-center gap-1" style={{ color: relCat.color }}>
                        Read article
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}