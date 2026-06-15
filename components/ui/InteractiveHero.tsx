'use client'

import Link from 'next/link'
import { ArrowRight, Play, Film, Star, Sparkles, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface InteractiveHeroProps {
  totalMovies: number
}

export default function InteractiveHero({ totalMovies }: InteractiveHeroProps) {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden" aria-label="Hero">
      {/* ── Background Layers ──────────────────────────────────────────── */}

      {/* Gradient mesh */}
      <div className="absolute inset-0 hero-gradient-mesh" />

      {/* Subtle grid */}
      <div className="absolute inset-0 hero-grid-pattern opacity-30" />

      {/* Floating orbs */}
      <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-accent-gold/[0.04] blur-[150px] animate-float" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/[0.04] blur-[120px] animate-float-delayed" />
      <div className="absolute top-[50%] left-[60%] w-[300px] h-[300px] rounded-full bg-[#3b82f6]/[0.03] blur-[100px] animate-float-slow" />

      {/* Floating cinema icons */}
      <div className="absolute top-24 left-[8%] animate-float hidden md:block">
        <Film size={40} className="text-accent-gold/[0.08]" />
      </div>
      <div className="absolute bottom-40 right-[12%] animate-float-delayed hidden md:block">
        <Star size={28} className="text-accent-gold/[0.08]" />
      </div>
      <div className="absolute top-36 right-[18%] animate-float-slow hidden md:block">
        <Sparkles size={24} className="text-accent-gold/[0.06]" />
      </div>

      {/* Horizontal lines accent */}
      <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-gold/10 to-transparent" />
      <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-gold/5 to-transparent" />

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-semibold tracking-wider uppercase">
            <Sparkles size={12} />
            Your Gateway to Kollywood
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
        >
          <span className="text-text-primary">Discover the Magic of</span>
          <br />
          <span className="text-gradient-gold font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            Tamil Cinema
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A curated archive of {totalMovies.toLocaleString()}+ Tamil films — from timeless
          classics to modern blockbusters. Explore, discover, and relive Kollywood.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/movies"
            className="group relative inline-flex items-center gap-2 bg-accent-gold text-text-inverse px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-accent-gold-dim transition-all duration-300 glow-button"
          >
            Browse Movies
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <Link
            href="/recommendations"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium text-text-secondary border border-border hover:border-accent-gold/30 hover:text-text-primary bg-bg-card/50 backdrop-blur-sm transition-all duration-300"
          >
            <Play size={14} className="text-accent-gold" />
            AI Recommendations
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="inline-flex items-center gap-6 sm:gap-10 px-8 py-5 rounded-2xl glassmorphism"
        >
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-text-primary">{totalMovies.toLocaleString()}+</div>
            <div className="text-[11px] text-text-muted mt-0.5 uppercase tracking-wider font-medium">Films</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-accent-gold">24+</div>
            <div className="text-[11px] text-text-muted mt-0.5 uppercase tracking-wider font-medium">Genres</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-text-primary">100+</div>
            <div className="text-[11px] text-text-muted mt-0.5 uppercase tracking-wider font-medium">Years</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} className="text-text-muted" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />
    </section>
  )
}
