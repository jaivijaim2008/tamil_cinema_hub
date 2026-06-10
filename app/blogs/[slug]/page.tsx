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
import { User, Calendar, Clock, ChevronLeft, ArrowRight, Hash, Newspaper } from 'lucide-react'

interface BlogDetailProps {
  params: Promise<{ slug: string }>
}

interface BlogDetail extends Blog {
  body?: any
  seoTitle?: string
  seoDescription?: string
  readTime?: number
  tags?: string[]
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
  if (!data?.blog) return { title: 'Blog Not Found' }
  const { blog } = data
  return {
    title: blog.seoTitle || blog.title,
    description: blog.seoDescription || blog.excerpt,
    alternates: { canonical: `https://tamilcinemahub.xyz/blogs/${slug}` },
  }
}

const ptComponents = {
  block: {
    h1: ({ children }: any) => <h1 className="font-display text-4xl font-black mt-16 mb-8 uppercase tracking-tighter text-white">{children}</h1>,
    h2: ({ children }: any) => <h2 className="font-display text-3xl font-black mt-12 mb-6 uppercase tracking-tight text-white">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-black mt-10 mb-5 uppercase tracking-wider text-white/90">{children}</h3>,
    normal: ({ children }: any) => <p className="leading-relaxed mb-8 text-white/50 text-lg font-medium">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-violet bg-white/[0.02] pl-8 pr-6 py-10 my-12 italic rounded-3xl text-white/40 text-2xl leading-relaxed">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="mb-8 space-y-4">{children}</ul>,
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="flex items-start gap-4 text-lg font-medium text-white/50">
        <span className="w-1.5 h-1.5 rounded-full bg-violet mt-3 flex-shrink-0" />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-black text-white">{children}</strong>,
    link: ({ value, children }: any) => <a href={value?.href} className="text-violet underline decoration-violet/20 hover:decoration-violet transition-all">{children}</a>,
  },
  types: {
    image: ({ value }: any) => {
      const url = value?.asset ? urlFor(value).width(1200).url() : null
      if (!url) return null
      return (
        <figure className="my-16 group">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 relative aspect-video">
            <Image src={url} alt={value.alt || 'Editorial'} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
          </div>
          {value.caption && <figcaption className="mt-6 text-center text-sm font-bold text-white/20 uppercase tracking-widest">{value.caption}</figcaption>}
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
  const coverUrl = blog.mainImage ? urlFor(blog.mainImage).width(1600).url() : null
  const formattedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <main className="bg-ink min-h-screen pb-24 overflow-x-hidden">
      
      {/* ── SPATIAL EDITORIAL HERO ── */}
      <div className="relative pt-48 pb-24 border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none opacity-10">
           <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet rounded-full blur-[150px]" />
        </div>

        <div className="spatial-container relative z-10">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all mb-12 group">
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Editorial Index
          </Link>

          <div className="max-w-4xl">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mb-8 border-violet/20">
                <Newspaper size={12} className="text-violet" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-violet/60">{blog.category}</span>
             </div>

             <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-[0.85] uppercase mb-10">
               {blog.title}
             </h1>

             <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                <span className="flex items-center gap-2.5"><User size={14} className="text-crimson" /> {blog.author}</span>
                <span className="flex items-center gap-2.5"><Calendar size={14} className="text-violet" /> {formattedDate}</span>
                {blog.readTime && <span className="flex items-center gap-2.5"><Clock size={14} className="text-teal" /> {blog.readTime} Min Read</span>}
             </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="spatial-container py-24">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
            
            <article className="lg:col-span-8">
               {blog.excerpt && (
                 <p className="text-2xl md:text-3xl font-medium leading-tight text-white/60 mb-20 border-l-4 border-white/5 pl-10 italic">
                   {blog.excerpt}
                 </p>
               )}

               <div className="prose max-w-none">
                  {blog.body ? <PortableText value={blog.body} components={ptComponents} /> : <p className="italic text-white/20">Archive content missing.</p>}
               </div>

               {/* Interaction Layer */}
               <div className="mt-24 pt-16 border-t border-white/5">
                  <BlogReactions slug={slug} />
                  
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="mt-12 flex flex-wrap gap-3">
                       {blog.tags.map(tag => (
                         <span key={tag} className="px-5 py-2 rounded-2xl glass-panel text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all cursor-pointer">
                            <Hash size={12} className="inline mr-1 text-violet" /> {tag}
                         </span>
                       ))}
                    </div>
                  )}
               </div>

               <BlogComments slug={slug} />
            </article>

            {/* Sidebar / Related */}
            <aside className="lg:col-span-4">
               <div className="sticky top-48 space-y-12">
                  <div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 pb-4 border-b border-white/5">Related Perspectives</h3>
                     <div className="space-y-6">
                        {related?.slice(0, 3).map(rel => (
                          <Link key={rel._id} href={`/blogs/${rel.slug}`} className="block group">
                             <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden glass-panel flex-shrink-0 relative">
                                   {rel.mainImage ? <Image src={urlFor(rel.mainImage).width(200).url()} alt={rel.title} fill className="object-cover group-hover:scale-110 transition-transform" /> : <div className="w-full h-full bg-white/5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <h4 className="text-sm font-black uppercase tracking-tight text-white/80 group-hover:text-violet transition-colors line-clamp-2 leading-none mb-2">{rel.title}</h4>
                                   <p className="text-[9px] font-bold text-white/20 uppercase">{rel.author}</p>
                                </div>
                             </div>
                          </Link>
                        ))}
                     </div>
                  </div>
                  
                  <div className="glass-panel rounded-[2rem] p-10">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-crimson mb-6">Mission</h4>
                     <p className="text-xs font-medium text-white/40 leading-relaxed uppercase">
                        Documenting the cultural velocity of Tamil cinema through a rigorous spatial archive lens.
                     </p>
                  </div>
               </div>
            </aside>

         </div>
      </div>

    </main>
  )
}
