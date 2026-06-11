'use client'

import { motion } from 'framer-motion'
import { Sparkles, Search, SlidersHorizontal, Film } from 'lucide-react'
import MovieCard from '../../components/ui/MovieCard'
import HorizontalScrollRow from '../../components/ui/HorizontalScrollRow'
import SectionHeader from '../../components/ui/SectionHeader'
import CinematicDivider from '../../components/ui/CinematicDivider'
import CinemaBackground from '../../components/graphics/CinemaBackground'
import FilmStripDecoration from '../../components/graphics/FilmStripDecoration'
import type { Movie } from '../../components/ui/MovieCard'

interface Props {
  topRated: Movie[]
  hiddenGems: Movie[]
  genreSections: [string, Movie[]][]
}

const steps = [
  { icon: Search, title: 'Search', desc: 'Tell us what you like' },
  { icon: SlidersHorizontal, title: 'Filter', desc: 'By genre, year, mood' },
  { icon: Sparkles, title: 'AI Match', desc: 'Smart recommendations' },
  { icon: Film, title: 'Discover', desc: 'Find your next film' },
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
}

export default function RecommendationsPageClient({ topRated, hiddenGems, genreSections }: Props) {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50svh] flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-10 overflow-hidden">
        <CinemaBackground />
        <div className="relative z-10">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <span className="text-5xl">🤖</span>
          </motion.div>
          <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-3">AI-Powered</p>
          <h1 className="font-playfair text-[clamp(32px,6vw,64px)] text-text-primary leading-tight mb-5">
            Find Your Perfect<br />
            <span className="text-gradient-gold">Tamil Film</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Our AI analyzes 1,600+ films to recommend exactly what you&apos;re looking for.
          </p>
        </div>
      </section>

      <FilmStripDecoration className="opacity-40" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* How It Works — Timeline */}
        <section className="section-padding">
          <SectionHeader overline="How It Works" title="Get Recommendations" />
          <div className="relative mt-10">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-border-accent" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-accent-gold-muted border-2 border-accent-gold flex items-center justify-center mx-auto mb-5 relative z-10 shadow-lg shadow-accent-gold/10">
                    <step.icon size={22} className="text-accent-gold" />
                  </div>
                  <h3 className="text-text-primary font-semibold text-base mb-2">{step.title}</h3>
                  <p className="text-text-muted text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <CinematicDivider className="mb-10" />

        {/* Top Rated - from real Sanity data */}
        {topRated.length > 0 && (
          <section className="py-10 relative">
            {/* Subtle star bg */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden>
              {Array.from({ length: 20 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute text-accent-gold"
                  style={{ left: `${(i * 5.3) % 100}%`, top: `${(i * 7.1) % 100}%`, fontSize: '8px' }}
                >
                  ★
                </span>
              ))}
            </div>
            <SectionHeader title="Top Rated" />
            <HorizontalScrollRow>
              {topRated.map((movie) => (
                <div key={movie._id} className="w-[44vw] sm:w-[200px]">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalScrollRow>
          </section>
        )}

        {/* Hidden Gems - from real Sanity data */}
        {hiddenGems.length > 0 && (
          <section className="py-10">
            <SectionHeader title="Hidden Gems" />
            <HorizontalScrollRow>
              {hiddenGems.map((movie) => (
                <div key={movie._id} className="w-[44vw] sm:w-[200px]">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalScrollRow>
          </section>
        )}

        {/* Genre Sections - from real Sanity data */}
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
      </div>

      {/* AI CTA */}
      <section className="section-padding text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="font-playfair text-2xl md:text-3xl text-text-primary mb-5">
            Want Personalized Recommendations?
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mb-10 leading-relaxed">
            Click the AI chat button to start a conversation about Tamil cinema.
          </p>
          <div className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-accent-gold/20">
            <Sparkles size={16} />
            Use the AI Chat →
          </div>
        </div>
      </section>
    </>
  )
}
