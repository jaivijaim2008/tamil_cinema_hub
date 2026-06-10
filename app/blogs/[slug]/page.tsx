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
import { User, Calendar, Clock, ChevronLeft, ArrowRight, Hash } from 'lucide-react'

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
  return {
    title: blog.seoTitle || blog.title,
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
  Review:     { color: 'text-crimson', bg: 'bg-crimson/10', label: 'Review' },
  'Top List': { color: 'text-gold', bg: 'bg-gold/10', label: 'Top List' },
  News:       { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'News' },
  Actor:      { color: 'text-violet', bg: 'bg-violet/10', label: 'Actor' },
  Director:   { color: 'text-teal', bg: 'bg-teal/10', label: 'Director' },
  Feature:    { color: 'text-rose-400', bg: 'bg-rose-400/10', label: 'Feature' },
}

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="mb-6 text-lg leading-relaxed text-white/50">{children}</p>
    ),
    h1: ({ children }: any) => (
      <h1 className="font-display mt-12 mb-6 text-3xl md:text-4xl font-extrabold text-white/90 tracking-tight">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="font-display mt-10 mb-5 text-2xl md:text-3xl font-extrabold text-white/90 tracking-tight">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mt-8 mb-4 text-xl md:text-2xl font-bold text-white/90 tracking-tight">{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-10 pl-6 border-l-2 border-crimson italic text-xl leading-relaxed text-white/40">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="mb-6 space-y-3">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="mb-6 space-y-3 list-decimal list-inside text-white/50">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="flex items-start gap-3 text-lg leading-relaxed text-white/50">
        <span className="mt-2.5 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-crimson" />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold text-white/90">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-crimson">{children}</em>,
    link: ({ value, children }: any) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-crimson underline underline-offset-4 decoration-crimson/30 hover:decoration-crimson transition-all">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => {
      const url = value?.asset ? urlFor(value).width(1200).quality(90).fit('max').url() : null
      if (!url) return null
      return (
        <figure className="my-12 group">
          <div className="relative overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
            <Image src={url} alt={value.alt || 'Editorial image'} width={1200} height={675} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          {value.caption && (
            <figcaption className="mt-4 text-center text-sm font-medium text-white/30 italic">{value.caption}</figcaption>
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
  const cat = CATEGORY_CONFIG[blog.category] ?? { color: 'text-crimson', bg: 'bg-crimson/10', label: blog.category }
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
    <main className="bg-ink min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Section */}
      <div className="border-b border-white/5 pt-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[600px] z-0 pointer-events-none opacity-20" style={{
          background: `radial-gradient(circle at 50% 0%, var(--crimson) 0%, transparent 70%)`
        }} />

        {coverUrl && (
          <div className="max-w-5xl mx-auto px-6 mb-12">
            <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <Image src={coverUrl} alt={blog.title} fill sizes="100vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-60" />
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-6 pb-16 relative z-10">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors mb-10 group">
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Editorial Index
          </Link>

          <div className="space-y-6">
            <span className={`inline-flex px-3 py-1 rounded-lg ${cat.bg} ${cat.color} border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em]`}>
              {cat.label}
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white leading-[1.1] tracking-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold uppercase tracking-widest text-white/30">
              <span className="flex items-center gap-2.5">
                <User size={14} className="text-crimson" />
                {blog.author}
              </span>
              <span className="flex items-center gap-2.5">
                <Calendar size={14} className="text-violet" />
                {formattedDate}
              </span>
              {blog.readTime && (
                <span className="flex items-center gap-2.5">
                  <Clock size={14} className="text-teal" />
                  {blog.readTime} Min Read
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        {blog.excerpt && (
          <p className="text-xl md:text-2xl font-medium leading-relaxed text-white/40 mb-16 border-l-2 border-white/5 pl-8 italic">
            {blog.excerpt}
          </p>
        )}

        <article className="prose prose-invert max-w-none prose-p:text-white/60 prose-headings:font-display prose-headings:font-extrabold">
          {blog.body ? (
            <PortableText value={blog.body} components={ptComponents} />
          ) : (
            <p className="italic text-white/30">Content details are currently being updated.</p>
          )}
        </article>

        {/* Engagement Section */}
        <div className="mt-16 pt-12 border-t border-white/5">
          <BlogReactions slug={slug} />
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-bold text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all cursor-pointer">
                  <Hash size={12} className="text-crimson/50" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <BlogComments slug={slug} />

        {/* Related Articles */}
        {related && related.length > 0 && (
          <section className="mt-32 pt-16 border-t border-white/5">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-crimson mb-2">Continue Reading</h2>
                <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white">Related Stories</h3>
              </div>
              <Link href="/blogs" className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((rel) => {
                const relCat = CATEGORY_CONFIG[rel.category] ?? cat
                const relImg = rel.mainImage ? urlFor(rel.mainImage).width(600).height(400).quality(85).fit('max').url() : null
                const relDate = new Date(rel.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <Link key={rel._id} href={`/blogs/${rel.slug}`} className="group flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-white/10 transition-all shadow-xl shadow-black/40">
                    <div className="relative aspect-video overflow-hidden border-b border-white/5">
                      {relImg ? (
                        <Image src={relImg} alt={rel.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <Hash size={32} className="text-white/10" />
                        </div>
                      )}
                      <span className={`absolute top-4 left-4 px-2.5 py-1 rounded-md ${relCat.bg} ${relCat.color} border border-white/5 text-[8px] font-bold uppercase tracking-widest`}>
                        {rel.category}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-white/20 mb-3">
                        <span>{rel.author}</span>
                        <span>{relDate}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white/90 leading-tight group-hover:text-white transition-colors mb-4 line-clamp-2">
                        {rel.title}
                      </h4>
                      <p className="text-[11px] leading-relaxed text-white/30 line-clamp-2 mb-6">
                        {rel.excerpt}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400 group-hover:gap-3 transition-all">
                        Explore <ArrowRight size={12} />
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
