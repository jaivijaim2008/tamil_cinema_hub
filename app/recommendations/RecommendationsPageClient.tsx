'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Search,
  Heart,
  ArrowRight,
  Bot,
  MessageCircle,
  Wand2,
  Target,
  Globe,
  Award,
  Rocket,
} from 'lucide-react'
import MovieCard from '../../components/ui/MovieCard'
import HorizontalScrollRow from '../../components/ui/HorizontalScrollRow'
import SectionHeader from '../../components/ui/SectionHeader'
import CinematicDivider from '../../components/ui/CinematicDivider'
import CinemaBackground from '../../components/graphics/CinemaBackground'
import FilmStripDecoration from '../../components/graphics/FilmStripDecoration'
import type { Movie } from '../../components/ui/MovieCard'

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════════════════════ */

interface Props {
  topRated: Movie[]
  hiddenGems: Movie[]
  genreSections: [string, Movie[]][]
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════════ */

const steps = [
  { icon: Search, title: 'Search', desc: 'Tell us what you like — genre, mood, actor, or era', bg: 'bg-accent-gold-muted', border: 'border-accent-gold', text: 'text-accent-gold' },
  { icon: Wand2, title: 'AI Analyze', desc: 'Our AI scans 1,600+ films for the perfect match', bg: 'bg-accent-purple-muted', border: 'border-accent-purple', text: 'text-accent-purple' },
  { icon: Target, title: 'Smart Match', desc: 'Get personalized recommendations tailored to you', bg: 'bg-accent-teal-muted', border: 'border-accent-teal', text: 'text-accent-teal' },
  { icon: Rocket, title: 'Discover', desc: 'Find your next favorite Tamil film', bg: 'bg-accent-rose-muted', border: 'border-accent-rose', text: 'text-accent-rose' },
]

const genreColors: Record<string, string> = {
  Action: 'border-l-red-500',
  Drama: 'border-l-accent-gold',
  Romance: 'border-l-pink-500',
  Comedy: 'border-l-emerald-500',
  Thriller: 'border-l-purple-500',
  Horror: 'border-l-red-600',
  'Sci-Fi': 'border-l-blue-500',
  Crime: 'border-l-orange-500',
  Adventure: 'border-l-cyan-500',
  Fantasy: 'border-l-violet-500',
  Family: 'border-l-green-400',
  Musical: 'border-l-pink-400',
}

const moodSuggestions = [
  { emoji: '🔥', label: 'Action-packed', query: 'action thriller' },
  { emoji: '💔', label: 'Heartfelt drama', query: 'emotional drama' },
  { emoji: '😂', label: 'Light comedy', query: 'funny comedy' },
  { emoji: '😱', label: 'Edge of seat', query: 'suspense thriller' },
  { emoji: '💕', label: 'Romantic', query: 'romance love story' },
  { emoji: '🎭', label: 'Art house', query: 'art house drama' },
  { emoji: '👻', label: 'Scary', query: 'horror' },
  { emoji: '🚀', label: 'Mind-bending', query: 'sci-fi fantasy' },
]

const aiFeatures = [
  {
    icon: Bot,
    title: 'Natural Language',
    description: 'Ask in plain English — "recommend something like Baahubali" or "films like Mankatha"',
  },
  {
    icon: Heart,
    title: 'Mood-Based',
    description: 'Tell us your mood and we\'ll find the perfect film to match',
  },
  {
    icon: Globe,
    title: 'Era Exploration',
    description: 'Discover hidden classics from any decade of Tamil cinema',
  },
  {
    icon: Award,
    title: 'Rating Aware',
    description: 'We factor in ratings and reviews to suggest only the best',
  },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── Step Card ─────────────────────────────────────────────────────────────── */
function StepCard({ step, index, total }: { step: typeof steps[0]; index: number; total: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative text-center"
    >
      {/* Connector line */}
      {index < total - 1 && (
        <div className="hidden lg:block absolute top-7 left-[60%] right-[-40%] h-px border-t-2 border-dashed border-border-accent z-0" />
      )}

      <div className={`relative z-10 w-14 h-14 rounded-full ${step.bg} border-2 ${step.border} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
        <step.icon size={22} className={step.text} />
      </div>
      <h3 className="text-text-primary font-semibold text-base mb-2">{step.title}</h3>
      <p className="text-text-muted text-sm max-w-[200px] mx-auto">{step.desc}</p>
    </motion.div>
  )
}

/* ── Mood Suggestion Pill ──────────────────────────────────────────────────── */
function MoodPill({ suggestion, index }: { suggestion: typeof moodSuggestions[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={`/movies?q=${encodeURIComponent(suggestion.query)}`}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-gold/30 hover:bg-accent-gold-muted transition-all text-sm group"
      >
        <span className="text-lg group-hover:scale-110 transition-transform">{suggestion.emoji}</span>
        <span className="text-text-secondary group-hover:text-accent-gold transition-colors">{suggestion.label}</span>
      </Link>
    </motion.div>
  )
}

/* ── AI Feature Card ───────────────────────────────────────────────────────── */
function AIFeatureCard({ feature, index }: { feature: typeof aiFeatures[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-bg-card border border-border-subtle rounded-2xl p-6 card-shine group"
    >
      <div className="w-12 h-12 rounded-xl bg-accent-purple-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <feature.icon size={20} className="text-accent-purple" />
      </div>
      <h3 className="text-text-primary font-semibold text-base mb-2">{feature.title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function RecommendationsPageClient({ topRated, hiddenGems, genreSections }: Props) {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-[60svh] flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-10 overflow-hidden">
        <CinemaBackground />

        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full blob-1 opacity-30" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full blob-2 opacity-30" />

        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-accent-gold/30"
            style={{ left: `${10 + (i * 6) % 80}%`, top: `${15 + (i * 7) % 70}%` }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        <div className="relative z-10">
          {/* AI icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, type: 'spring' }}
            className="mb-8"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-purple to-accent-gold flex items-center justify-center mx-auto shadow-lg shadow-accent-purple/20">
              <Bot size={36} className="text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-accent-purple-muted/60 backdrop-blur-sm border border-accent-purple/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles size={14} className="text-accent-purple" />
            <span className="text-accent-purple text-[11px] font-mono tracking-[0.2em] uppercase">AI-Powered</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-playfair text-[clamp(36px,7vw,72px)] text-text-primary leading-tight mb-6"
          >
            Find Your Perfect<br />
            <span className="text-gradient-gold">Tamil Film</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10"
          >
            Our AI analyzes 1,600+ films to recommend exactly what you&apos;re looking for. Tell us your mood, favorite genre, or a film you loved.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-3 bg-accent-gold text-text-inverse font-semibold px-10 py-4 rounded-xl hover:bg-accent-gold-dim transition-all shadow-lg shadow-accent-gold/20 hover:shadow-accent-gold/40 hover:scale-[1.02]"
            >
              <Sparkles size={16} />
              Get Recommendations
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <FilmStripDecoration className="opacity-40" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* ═══ MOOD SUGGESTIONS ═══ */}
        <section className="py-16">
          <SectionHeader overline="Quick Start" title="What&apos;s Your Mood?" />
          <p className="text-text-secondary text-sm mb-8 -mt-4">
            Tap a mood to search for matching films
          </p>
          <div className="flex flex-wrap gap-3">
            {moodSuggestions.map((s, i) => (
              <MoodPill key={s.label} suggestion={s} index={i} />
            ))}
          </div>
        </section>

        <CinematicDivider className="mb-10" />

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how-it-works" className="py-16">
          <SectionHeader overline="How It Works" title="Get Recommendations in 4 Steps" />
          <div className="relative mt-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {steps.map((step, i) => (
                <StepCard key={step.title} step={step} index={i} total={steps.length} />
              ))}
            </div>
          </div>
        </section>

        <CinematicDivider className="mb-10" />

        {/* ═══ TOP RATED ═══ */}
        {topRated.length > 0 && (
          <section className="py-12 relative">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className="absolute text-accent-gold" style={{ left: `${(i * 5.3) % 100}%`, top: `${(i * 7.1) % 100}%`, fontSize: '8px' }}>★</span>
              ))}
            </div>
            <SectionHeader
              overline="Highest Rated"
              title="Top Rated Films"
              viewAllHref="/movies"
              viewAllLabel="View All"
            />
            <HorizontalScrollRow>
              {topRated.map((movie) => (
                <div key={movie._id} className="w-[44vw] sm:w-[200px]">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalScrollRow>
          </section>
        )}

        {/* ═══ HIDDEN GEMS ═══ */}
        {hiddenGems.length > 0 && (
          <section className="py-12">
            <SectionHeader
              overline="Underrated"
              title="Hidden Gems"
              viewAllHref="/movies"
              viewAllLabel="View All"
            />
            <HorizontalScrollRow>
              {hiddenGems.map((movie) => (
                <div key={movie._id} className="w-[44vw] sm:w-[200px]">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalScrollRow>
          </section>
        )}

        {/* ═══ GENRE SECTIONS ═══ */}
        {genreSections.map(([genre, movies]) => (
          <section key={genre} className="py-10">
            <div className={`border-l-4 ${genreColors[genre] || 'border-l-border-accent'} pl-5`}>
              <SectionHeader title={genre} viewAllHref={`/movies?genre=${genre}`} />
            </div>
            <HorizontalScrollRow className="pl-5">
              {movies.map((movie) => (
                <div key={movie._id} className="w-[44vw] sm:w-[200px]">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalScrollRow>
          </section>
        ))}

        <CinematicDivider className="my-10" />

        {/* ═══ AI FEATURES ═══ */}
        <section className="py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent-purple-muted/60 backdrop-blur-sm border border-accent-purple/20 rounded-full px-4 py-2 mb-6">
              <Bot size={14} className="text-accent-purple" />
              <span className="text-accent-purple text-[11px] font-mono tracking-[0.2em] uppercase">AI Engine</span>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl text-text-primary mb-4">
              How Our AI <span className="text-gradient-purple">Works</span>
            </h2>
            <p className="text-text-secondary text-sm max-w-lg mx-auto">
              Powered by understanding of Tamil cinema&apos;s rich history and your preferences
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, i) => (
              <AIFeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-20 text-center">
          <div className="max-w-lg mx-auto">
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-gold to-accent-purple flex items-center justify-center shadow-lg">
                <MessageCircle size={28} className="text-white" />
              </div>
            </motion.div>
            <h2 className="font-playfair text-2xl md:text-3xl text-text-primary mb-5">
              Ready to Discover?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base mb-8 leading-relaxed">
              Click the AI chat button to start a conversation about Tamil cinema. Ask anything — from classic black-and-white films to the latest blockbusters.
            </p>
            <div className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse font-semibold px-8 py-4 rounded-xl shadow-lg shadow-accent-gold/20 cursor-pointer hover:bg-accent-gold-dim transition-colors">
              <Sparkles size={16} />
              Use the AI Chat
              <ArrowRight size={16} />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
