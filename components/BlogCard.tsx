'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { urlFor } from '../sanity/lib/image'
import { Calendar, User, ArrowRight, Hash } from 'lucide-react'

export interface Blog {
  _id: string
  title: string
  slug: string
  author: string
  publishedAt: string
  category: string
  mainImage?: any
  excerpt?: string
  tags?: string[]
}

interface BlogCardProps {
  blog: Blog
  index?: number
}

const CATEGORY_COLORS: Record<string, string> = {
  'Review': 'text-crimson',
  'News': 'text-blue-400',
  'Top List': 'text-gold',
  'Actor': 'text-violet',
  'Director': 'text-teal',
  'Feature': 'text-rose-400',
}

export default function BlogCard({ blog, index = 0 }: BlogCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Staggered entrance
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [20, -20])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0])

  const imageUrl = blog.mainImage 
    ? urlFor(blog.mainImage).width(800).height(500).quality(90).fit('max').url() 
    : null

  const catColor = CATEGORY_COLORS[blog.category] || 'text-white'
  const date = new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity }}
      className="h-full"
    >
      <Link href={`/blogs/${blog.slug}`} className="block h-full bento-card flex flex-col md:flex-row group">
        
        {/* Image Side */}
        <div className="relative w-full md:w-[40%] aspect-video md:aspect-auto overflow-hidden">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={blog.title} 
              fill 
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
              <Hash size={40} className="text-white/5" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent md:block hidden" />
          
          <div className="absolute top-4 left-4">
             <span className={`px-3 py-1 rounded-full glass border-white/10 text-[8px] font-black uppercase tracking-widest ${catColor}`}>
                {blog.category}
             </span>
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 p-8 flex flex-col justify-center">
           <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-4">
              <span className="flex items-center gap-1.5"><Calendar size={10} className="text-crimson" /> {date}</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="flex items-center gap-1.5"><User size={10} className="text-violet" /> {blog.author}</span>
           </div>

           <h3 className="text-xl md:text-2xl font-display font-black text-white leading-tight uppercase group-hover:text-gradient transition-all duration-500 mb-4">
             {blog.title}
           </h3>

           <p className="text-sm text-white/30 line-clamp-2 mb-8 font-medium leading-relaxed">
             {blog.excerpt || "Dive deep into our latest editorial coverage of the Tamil cinema landscape..."}
           </p>

           <div className="mt-auto flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-teal-400 group-hover:text-white transition-colors">
              Read Column <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
           </div>
        </div>
      </Link>
    </motion.div>
  )
}
