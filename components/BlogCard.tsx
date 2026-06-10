'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
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
  const cardRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  })

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [5, 0, -5])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 })

  const imageUrl = blog.mainImage ? urlFor(blog.mainImage).width(1200).url() : null
  const date = new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX: springRotateX, opacity, transformStyle: "preserve-3d", perspective: 1000 }}
      className="w-full"
    >
      <Link href={`/blogs/${blog.slug}`} className="block glass-panel rounded-[3rem] p-10 md:p-16 relative overflow-hidden group transition-all duration-700">
         
         {/* Background Subtle Gradient */}
         <div className="absolute inset-0 bg-gradient-to-br from-violet/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

         <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            
            {/* Editorial Image */}
            <div className="w-full lg:w-[45%] aspect-video rounded-[2rem] overflow-hidden shadow-2xl relative">
               {imageUrl ? (
                 <Image src={imageUrl} alt={blog.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
               ) : (
                 <div className="w-full h-full bg-white/[0.03] flex items-center justify-center text-white/5"><Newspaper size={64} /></div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40" />
            </div>

            {/* Editorial Info */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
               <div className="inline-flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-8">
                  <span className="flex items-center gap-2"><Calendar size={12} className="text-crimson" /> {date}</span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="flex items-center gap-2"><User size={12} className="text-violet" /> {blog.author}</span>
               </div>

               <h3 className="text-3xl md:text-5xl font-display font-black text-white leading-[0.9] uppercase mb-8 group-hover:text-gradient transition-all duration-500">
                 {blog.title}
               </h3>

               <p className="text-lg text-white/40 font-medium leading-relaxed line-clamp-2 mb-10 max-w-xl">
                 {blog.excerpt || "Analyzing the latest shifts in the Tamil cinema landscape with deep industrial context..."}
               </p>

               <div className="mt-auto flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-teal-400 group-hover:text-white transition-all">
                  Access Narrative <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
               </div>
            </div>

         </div>

      </Link>
    </motion.div>
  )
}
