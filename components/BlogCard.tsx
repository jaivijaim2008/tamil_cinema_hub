'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '../sanity/lib/image'
import { Calendar, User, ArrowRight, Newspaper } from 'lucide-react'

export interface Blog {
  _id: string
  title: string
  slug: string
  author: string
  publishedAt: string
  category: string
  mainImage?: any
  excerpt?: string
}

interface BlogCardProps {
  blog: Blog
  index?: number
}

export default function BlogCard({ blog, index = 0 }: BlogCardProps) {
  const imageUrl = blog.mainImage ? urlFor(blog.mainImage).width(1200).url() : null
  const date = new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full"
    >
      <Link href={`/blogs/${blog.slug}`} className="block border-t border-white/5 pt-12 pb-12 group transition-all duration-700">
         <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            
            {/* Meta - Clean Left Column */}
            <div className="w-full lg:w-48 flex-shrink-0">
               <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                  <span className="flex items-center gap-3"><Calendar size={12} className="text-crimson" /> {date}</span>
                  <span className="flex items-center gap-3"><User size={12} className="text-white/40" /> {blog.author}</span>
                  <div className="h-px w-12 bg-crimson/30" />
                  <span className="text-crimson">{blog.category}</span>
               </div>
            </div>

            {/* Content - Center Focal */}
            <div className="flex-1">
               <h3 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white uppercase leading-[0.9] mb-8 group-hover:text-crimson transition-all duration-500">
                 {blog.title}
               </h3>
               <p className="text-lg md:text-xl text-white/40 font-medium leading-relaxed max-w-3xl line-clamp-2">
                 {blog.excerpt || "Analyzing the historical trajectory and industrial impact of contemporary Tamil cinema..."}
               </p>
            </div>

            {/* Visual - Floating Artifact */}
            <div className="w-full lg:w-[25%] aspect-video rounded-3xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 relative shadow-2xl">
               {imageUrl ? (
                 <Image src={imageUrl} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
               ) : (
                 <div className="w-full h-full bg-coal flex items-center justify-center text-white/5"><Newspaper size={48} /></div>
               )}
            </div>

         </div>
      </Link>
    </motion.div>
  )
}
