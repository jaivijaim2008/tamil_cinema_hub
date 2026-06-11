'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Code, Database, Globe, Sparkles, ArrowRight } from 'lucide-react'
import SpotlightCard from '../../components/ui/SpotlightCard'
import AnimatedCounter from '../../components/ui/AnimatedCounter'
import CinematicDivider from '../../components/ui/CinematicDivider'
import CinemaBackground from '../../components/graphics/CinemaBackground'

interface Props {
  totalCount: number
  directorCount: number
}

const techStack = [
  { name: 'Next.js', desc: 'React framework with App Router', icon: Code },
  { name: 'Sanity CMS', desc: 'Headless content management', icon: Database },
  { name: 'Tailwind CSS', desc: 'Utility-first styling', icon: Globe },
  { name: 'AI Engine', desc: 'Intelligent movie recommendations', icon: Sparkles },
]

export default function AboutPageClient({ totalCount, directorCount }: Props) {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50svh] flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-10 overflow-hidden">
        <CinemaBackground />
        {/* Rotating film reel SVG */}
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-[300px] lg:w-[400px] text-accent-gold animate-rotateReel" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="100" cy="100" r="90" />
            <circle cx="100" cy="100" r="30" />
            <circle cx="100" cy="40" r="10" />
            <circle cx="100" cy="160" r="10" />
            <circle cx="40" cy="100" r="10" />
            <circle cx="160" cy="100" r="10" />
            <circle cx="57" cy="57" r="10" />
            <circle cx="143" cy="57" r="10" />
            <circle cx="57" cy="143" r="10" />
            <circle cx="143" cy="143" r="10" />
          </svg>
        </div>

        <div className="relative z-10">
          <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-3">About</p>
          <h1 className="font-playfair text-[clamp(32px,6vw,72px)] text-text-primary leading-tight mb-5">
            The Archive<br />
            <span className="text-gradient-gold">Behind the Screen</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            TamilCinemaHub is a passion project dedicated to preserving and celebrating Tamil cinema.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20">
        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 relative"
        >
          <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-accent-gold" />
          <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-3 pl-6">Our Mission</p>
          <h2 className="font-playfair text-2xl md:text-3xl text-text-primary mb-5 pl-6">
            Preserving Kollywood&apos;s Legacy
          </h2>
          <p className="text-text-secondary leading-relaxed pl-6 max-w-[60ch]">
            Tamil cinema has produced some of the most groundbreaking films in Indian history.
            TamilCinemaHub aims to be the definitive digital archive — cataloging every film,
            every director, every story that has shaped this incredible industry.
          </p>
        </motion.div>

        <CinematicDivider className="mb-20" />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-20">
          {[
            { value: totalCount, suffix: '+', label: 'Films Cataloged' },
            { value: directorCount, suffix: '+', label: 'Directors' },
            { value: 26, suffix: '+', label: 'Years Covered' },
          ].map((s) => (
            <SpotlightCard key={s.label} className="bg-bg-card border border-border-subtle p-8 text-center card-shine">
              <div className="text-[clamp(28px,5vw,40px)] font-playfair text-gradient-gold mb-2">
                <AnimatedCounter to={s.value} suffix={s.suffix} />
              </div>
              <p className="text-text-muted text-xs font-mono uppercase tracking-wider">{s.label}</p>
            </SpotlightCard>
          ))}
        </div>

        {/* Tech Stack */}
        <section className="mb-20">
          <h2 className="font-playfair text-2xl text-text-primary mb-10">Built With</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {techStack.map((tech) => (
              <SpotlightCard key={tech.name} className="bg-bg-card border border-border-subtle p-6 group card-shine">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-accent-gold-muted flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <tech.icon size={20} className="text-accent-gold" />
                  </div>
                  <div>
                    <h3 className="text-text-primary font-semibold text-base mb-1">{tech.name}</h3>
                    <p className="text-text-muted text-sm">{tech.desc}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse font-semibold px-10 py-4 rounded-xl hover:bg-accent-gold-dim transition-colors shadow-lg shadow-accent-gold/20"
          >
            Explore the Archive <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  )
}
