import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { client } from '../../../sanity/client'
import { blogBySlugQuery, relatedBlogsQuery } from '../../../lib/queries'
import { urlFor } from '../../../sanity/lib/image'
import { Blog } from '../../../components/BlogCard'
import BlogReactions from '../../../components/BlogReactions'
import BlogComments from '../../../components/BlogComments'

interface BlogDetailProps {
  params: Promise<{ slug: string }>
}

interface BlogDetail extends Blog {
  body?: any
  seoTitle?: string
  seoDescription?: string
  readTime?: number
}

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

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getBlogData(slug)
  if (!data?.blog) return { title: 'Blog Not Found | TamilCinemaHub' }

  const { blog } = data
  const ogImageUrl = blog.mainImage ? urlFor(blog.mainImage).width(1200).height(630).url() : ''
  const pageTitle = blog.seoTitle || blog.title
  return {
    title: pageTitle.includes('TamilCinemaHub') ? pageTitle : `${pageTitle} | TamilCinemaHub`,
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
    alternates: { canonical: `https://tamilcinemahub.xyz/blogs/${slug}` },
  }
}

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  Review:     { color: '#D4291A', bg: 'rgba(212,41,26,0.15)', label: 'Review' },
  'Top List': { color: '#F0B429', bg: 'rgba(240,180,41,0.15)', label: 'Top List' },
  News:       { color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', label: 'News' },
  Actor:      { color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', label: 'Actor' },
  Director:   { color: '#0D9488', bg: 'rgba(13,148,136,0.15)', label: 'Director' },
  Feature:    { color: '#F43F5E', bg: 'rgba(244,63,94,0.15)', label: 'Feature' },
}

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p style={{ marginBottom: 20, fontSize: 17, lineHeight: 1.85, color: 'rgba(255,255,255,0.5)' }}>{children}</p>
    ),
    h1: ({ children }: any) => (
      <h1 style={{ fontFamily: "'Syne', sans-serif", marginTop: 40, marginBottom: 16, fontSize: 30, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 style={{ fontFamily: "'Syne', sans-serif", marginTop: 40, marginBottom: 16, fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 style={{ marginTop: 32, marginBottom: 12, fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote style={{ margin: '32px 0', paddingLeft: 20, borderLeft: '2px solid var(--crimson)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.4)' }}>
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul style={{ marginBottom: 20, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol style={{ marginBottom: 20, paddingLeft: 24, listStyleType: 'decimal', color: 'rgba(255,255,255,0.5)' }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)' }}>
        <span style={{ marginTop: 8, width: 6, height: 6, flexShrink: 0, borderRadius: '50%', background: 'var(--crimson)' }} />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong style={{ fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{children}</strong>,
    em: ({ children }: any) => <em style={{ fontStyle: 'italic', color: 'var(--crimson)' }}>{children}</em>,
    link: ({ value, children }: any) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--crimson)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => {
      const url = value?.asset ? urlFor(value).width(900).quality(90).fit('max').url() : null
      if (!url) return null
      return (
        <figure style={{ margin: '32px auto', maxWidth: '85%', overflow: 'hidden', borderRadius: 12 }}>
          <Image src={url} alt={value.alt || ''} width={900} height={506} style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }} />
          {value.caption && (
            <figcaption style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{value.caption}</figcaption>
          )}
        </figure>
      )
    },
  },
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params
  const data = await getBlogData(slug)

  if (!data?.blog) notFound()

  const { blog, related } = data
  const cat = CATEGORY_CONFIG[blog.category] ?? { color: '#D4291A', bg: 'rgba(212,41,26,0.15)', label: blog.category }
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
      author: { '@type': 'Person', name: blog.author },
      publisher: { '@type': 'Organization', name: 'TamilCinemaHub', url: 'https://tamilcinemahub.xyz' },
      datePublished: blog.publishedAt,
      dateModified: blog.publishedAt,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `https://tamilcinemahub.xyz/blogs/${slug}` },
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
    <main style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {coverUrl && (
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 0' }}>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, aspectRatio: '21/9' }}>
              <Image src={coverUrl} alt={blog.title} width={960} height={411} style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--ink) 0%, transparent 45%)' }} />
            </div>
          </div>
        )}

        <div style={{ maxWidth: 768, margin: '0 auto', padding: '32px 24px 40px' }}>
          <Link href="/blogs" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Articles
          </Link>

          <span style={{ display: 'inline-flex', marginBottom: 16, alignItems: 'center', gap: 6, borderRadius: 6, paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', background: cat.bg, color: cat.color, border: `1px solid ${cat.color}33` }}>
            {cat.label}
          </span>

          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, color: 'rgba(255,255,255,0.92)' }}>
            {blog.title}
          </h1>

          <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              {blog.author}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {formattedDate}
            </span>
            {blog.readTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
                </svg>
                {blog.readTime} min read
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 768, margin: '0 auto', padding: '40px 24px' }}>
        {blog.excerpt && (
          <p style={{ marginBottom: 40, fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.7, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
            {blog.excerpt}
          </p>
        )}

        <div style={{ marginBottom: 40, height: 1, width: '100%', background: 'rgba(255,255,255,0.06)' }} />

        <article>
          {blog.body ? (
            <PortableText value={blog.body} components={ptComponents} />
          ) : (
            <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.35)' }}>No content available for this post.</p>
          )}
        </article>

        <BlogReactions slug={slug} />

        {blog.tags && blog.tags.length > 0 && (
          <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {blog.tags.map((tag, i) => (
              <span key={i} style={{ borderRadius: 6, paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <BlogComments slug={slug} />

        {/* Related Articles */}
        {related && related.length > 0 && (
          <section style={{ marginTop: 80 }}>
            <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>More Articles</p>
                <h2 style={{ fontFamily: "'Syne', sans-serif", marginTop: 4, fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>Related Reads</h2>
              </div>
              <Link href="/blogs" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', transition: 'color 0.2s' }}>
                All Articles →
              </Link>
            </div>

            <div className="related-blog-grid">
              {related.map((rel) => {
                const relCat = CATEGORY_CONFIG[rel.category] ?? cat
                const relImg = rel.mainImage ? urlFor(rel.mainImage).width(500).height(280).quality(85).fit('max').url() : null
                const relDate = new Date(rel.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <Link key={rel._id} href={`/blogs/${rel.slug}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 16, transition: 'all 0.3s', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                      {relImg ? (
                        <Image src={relImg} alt={rel.title} width={500} height={280} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: relCat.bg }}>
                          <span style={{ fontSize: 32, opacity: 0.2 }}>📰</span>
                        </div>
                      )}
                      <span style={{ position: 'absolute', left: 10, top: 10, borderRadius: 6, paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: relCat.bg, color: relCat.color, border: `1px solid ${relCat.color}33` }}>
                        {rel.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, marginBottom: 8, color: 'rgba(255,255,255,0.3)' }}>
                        <span>{rel.author}</span>
                        <span>{relDate}</span>
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'rgba(255,255,255,0.92)' }}>
                        {rel.title}
                      </h3>
                      <p style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'rgba(255,255,255,0.35)' }}>{rel.excerpt}</p>
                      <span style={{ marginTop: 'auto', paddingTop: 12, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--teal-light)' }}>
                        Read article →
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
