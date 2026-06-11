'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Code,
  Database,
  Globe,
  Sparkles,
  ArrowRight,
  Heart,
  Star,
  Film,
  Users,
  Calendar,
  Award,
  Clapperboard,
  BookOpen,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Target,
  Zap,
  Shield,
  Trophy,
  Quote,
  Rocket,
  Compass,
  Gem,
  Clock,
} from 'lucide-react'
import SpotlightCard from '../../components/ui/SpotlightCard'
import AnimatedCounter from '../../components/ui/AnimatedCounter'
import CinematicDivider from '../../components/ui/CinematicDivider'
import CinemaBackground from '../../components/graphics/CinemaBackground'
import FilmStripDecoration from '../../components/graphics/FilmStripDecoration'

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */

interface Props {
  totalCount: number
  directorCount: number
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════════ */

const techStack = [
  { name: 'Next.js 15', desc: 'React framework with App Router, server components, and streaming', icon: Code, iconBg: 'bg-accent-gold-muted', iconText: 'text-accent-gold' },
  { name: 'Sanity CMS', desc: 'Headless content management with real-time collaboration', icon: Database, iconBg: 'bg-accent-purple-muted', iconText: 'text-accent-purple' },
  { name: 'Tailwind CSS', desc: 'Utility-first styling with custom design tokens', icon: Globe, iconBg: 'bg-accent-teal-muted', iconText: 'text-accent-teal' },
  { name: 'AI Engine', desc: 'Intelligent movie recommendations powered by our custom AI', icon: Sparkles, iconBg: 'bg-accent-rose-muted', iconText: 'text-accent-rose' },
  { name: 'Framer Motion', desc: 'Production-ready animations and transitions', icon: Zap, iconBg: 'bg-accent-amber-muted', iconText: 'text-accent-amber' },
  { name: 'Recharts', desc: 'Beautiful, composable data visualizations', icon: Target, iconBg: 'bg-accent-emerald-muted', iconText: 'text-accent-emerald' },
]

const values = [
  {
    icon: Shield,
    title: 'Accuracy',
    description: 'Every film entry is carefully curated and verified. We believe in presenting the truth of Tamil cinema.',
    iconBg: 'bg-accent-gold-muted', iconText: 'text-accent-gold', glow: 'bg-accent-gold/5', glowHover: 'group-hover:bg-accent-gold/10',
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'Built by cinephiles, for cinephiles. Our love for Tamil cinema drives every feature we build.',
    iconBg: 'bg-accent-rose-muted', iconText: 'text-accent-rose', glow: 'bg-accent-rose/5', glowHover: 'group-hover:bg-accent-rose/10',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'Making Tamil cinema discoverable worldwide. No paywalls, no barriers — just great films.',
    iconBg: 'bg-accent-teal-muted', iconText: 'text-accent-teal', glow: 'bg-accent-teal/5', glowHover: 'group-hover:bg-accent-teal/10',
  },
  {
    icon: Rocket,
    title: 'Innovation',
    description: 'Using modern AI and web technologies to reimagine how we explore and discuss cinema.',
    iconBg: 'bg-accent-purple-muted', iconText: 'text-accent-purple', glow: 'bg-accent-purple/5', glowHover: 'group-hover:bg-accent-purple/10',
  },
]

const milestones = [
  { year: '2020', event: 'TamilCinemaHub founded with a vision to digitize Tamil cinema heritage', icon: Compass },
  { year: '2021', event: 'Database reaches 500 films with comprehensive metadata', icon: Film },
  { year: '2022', event: 'Launched AI-powered recommendation engine', icon: Sparkles },
  { year: '2023', event: 'Analytics dashboard and deep genre analysis added', icon: Target },
  { year: '2024', event: 'Database surpasses 1,500 films — the largest open Tamil cinema archive', icon: Trophy },
  { year: '2025', event: 'Pan-Indian coverage expansion and community features', icon: Globe },
]

const quotes = [
  { text: 'Tamil cinema is not just entertainment — it is a cultural revolution.', author: 'Kollywood Heritage Foundation' },
  { text: 'The archive of a culture is the mirror of its soul.', author: 'TamilCinemaHub' },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── Animated Underline ───────────────────────────────────────────────────── */
function AnimatedUnderline({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
    />
  )
}

/* ── Section Reveal ───────────────────────────────────────────────────────── */
function SectionReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Value Card ────────────────────────────────────────────────────────────── */
function ValueCard({ value, index }: { value: typeof values[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="bg-bg-card border border-border-subtle rounded-2xl p-8 card-shine group relative overflow-hidden"
    >
      <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full ${value.glow} ${value.glowHover} transition-colors duration-500`} />
      <div className={`w-14 h-14 rounded-2xl ${value.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <value.icon size={24} className={value.iconText} strokeWidth={1.5} />
      </div>
      <h3 className="font-playfair text-xl text-text-primary mb-3">{value.title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{value.description}</p>
    </motion.div>
  )
}

/* ── Tech Card ─────────────────────────────────────────────────────────────── */
function TechCard({ tech, index }: { tech: typeof techStack[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ x: 4 }}
      className="flex items-start gap-5 p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-border-accent transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl ${tech.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        <tech.icon size={20} className={tech.iconText} />
      </div>
      <div>
        <h3 className="text-text-primary font-semibold text-base mb-1 group-hover:text-accent-gold transition-colors">{tech.name}</h3>
        <p className="text-text-muted text-sm">{tech.desc}</p>
      </div>
    </motion.div>
  )
}

/* ── Milestone Item ────────────────────────────────────────────────────────── */
function MilestoneItem({ milestone, index, isLast }: { milestone: typeof milestones[0]; index: number; isLast: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex gap-6 relative"
    >
      <div className="flex flex-col items-center shrink-0">
        <motion.div className="w-4 h-4 rounded-full bg-accent-gold border-2 border-bg-primary z-10" whileHover={{ scale: 1.5 }} />
        {!isLast && <div className="w-px flex-1 bg-border-accent min-h-[40px]" />}
      </div>
      <div className="pb-8 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-accent-gold font-mono text-xs tracking-wider font-bold">{milestone.year}</span>
          <milestone.icon size={14} className="text-accent-gold/40" />
        </div>
        <p className="text-text-primary text-sm leading-relaxed">{milestone.event}</p>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function AboutPageClient({ totalCount, directorCount }: Props) {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const missionRef = useRef(null)
  const missionInView = useInView(missionRef, { once: true, margin: '-80px' })
  const valuesRef = useRef(null)
  const valuesInView = useInView(valuesRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-[70svh] flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-10 overflow-hidden">
        <CinemaBackground />

        {/* Rotating film reel */}
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none hidden lg:block">
          <motion.svg
            viewBox="0 0 200 200"
            className="w-[400px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <circle cx="100" cy="100" r="90" className="text-accent-gold" />
            <circle cx="100" cy="100" r="30" className="text-accent-gold" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <circle key={angle} cx={100 + 60 * Math.cos((angle * Math.PI) / 180)} cy={100 + 60 * Math.sin((angle * Math.PI) / 180)} r="10" className="text-accent-gold" />
            ))}
          </motion.svg>
        </div>

        {/* Another reel on the left */}
        <div className="absolute left-[5%] top-1/3 opacity-[0.02] pointer-events-none hidden lg:block">
          <motion.svg
            viewBox="0 0 200 200"
            className="w-[250px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          >
            <circle cx="100" cy="100" r="90" className="text-accent-purple" />
            <circle cx="100" cy="100" r="40" className="text-accent-purple" />
          </motion.svg>
        </div>

        <motion.div style={{ y: heroParallax }} className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-accent-gold-muted/60 backdrop-blur-sm border border-accent-gold/20 rounded-full px-4 py-2 mb-8"
          >
            <Film size={14} className="text-accent-gold" />
            <span className="text-accent-gold text-[11px] font-mono tracking-[0.2em] uppercase">About Us</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-playfair text-[clamp(36px,7vw,80px)] text-text-primary leading-[1.05] mb-6"
          >
            The Archive<br />
            <span className="text-gradient-gold">Behind the Screen</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10"
          >
            TamilCinemaHub is a passion project dedicated to preserving and celebrating the incredible legacy of Tamil cinema.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { value: totalCount, suffix: '+', label: 'Films' },
              { value: directorCount, suffix: '+', label: 'Directors' },
              { value: 26, suffix: '+', label: 'Years' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-playfair text-gradient-gold mb-1">
                  <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <FilmStripDecoration className="opacity-30" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* ═══ MISSION ═══ */}
        <section ref={missionRef} className="py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <SectionReveal>
              <div>
                <div className="inline-flex items-center gap-2 bg-accent-gold-muted/60 backdrop-blur-sm border border-accent-gold/20 rounded-full px-4 py-2 mb-6">
                  <Target size={14} className="text-accent-gold" />
                  <span className="text-accent-gold text-[11px] font-mono tracking-[0.2em] uppercase">Our Mission</span>
                </div>
                <h2 className="font-playfair text-3xl md:text-4xl text-text-primary mb-6 leading-tight">
                  Preserving Kollywood&apos;s<br /><span className="text-gradient-gold">Living Legacy</span>
                </h2>
                <div className="space-y-4 text-text-secondary leading-relaxed">
                  <p>
                    Tamil cinema has produced some of the most groundbreaking, emotionally powerful, and culturally significant films in Indian history. From the pioneering works of the 1930s to today&apos;s pan-Indian blockbusters, this industry has shaped generations.
                  </p>
                  <p>
                    TamilCinemaHub aims to be the definitive digital archive — cataloging every film, every director, every story that has shaped this incredible industry. We believe these stories deserve to be preserved, explored, and celebrated.
                  </p>
                  <p>
                    Our AI-powered platform makes discovering Tamil cinema accessible to everyone, whether you&apos;re a lifelong fan or just beginning to explore Kollywood.
                  </p>
                </div>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.2}>
              <div className="relative">
                {/* Quote card */}
                <div className="bg-bg-card border border-border-subtle rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-accent-purple/5 pointer-events-none" />
                  <Quote size={40} className="text-accent-gold/15 mb-4" />
                  <p className="font-playfair text-xl text-text-primary italic leading-relaxed mb-4">
                    &ldquo;{quotes[0].text}&rdquo;
                  </p>
                  <p className="text-text-muted text-sm">— {quotes[0].author}</p>
                </div>

                {/* Floating decoration */}
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -right-6 w-20 h-20 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center"
                >
                  <Film size={28} className="text-accent-gold/40" />
                </motion.div>
              </div>
            </SectionReveal>
          </div>
        </section>

        <AnimatedUnderline className="max-w-xs mx-auto mb-24" />

        {/* ═══ VALUES ═══ */}
        <section ref={valuesRef} className="pb-24">
          <SectionReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-accent-rose-muted/60 backdrop-blur-sm border border-accent-rose/20 rounded-full px-4 py-2 mb-6">
                <Gem size={14} className="text-accent-rose" />
                <span className="text-accent-rose text-[11px] font-mono tracking-[0.2em] uppercase">Values</span>
              </div>
              <h2 className="font-playfair text-3xl md:text-4xl text-text-primary mb-4">
                What We <span className="text-gradient-rose">Stand For</span>
              </h2>
              <p className="text-text-secondary text-sm max-w-md mx-auto">
                The principles that guide everything we build
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <ValueCard key={value.title} value={value} index={i} />
            ))}
          </div>
        </section>

        <CinematicDivider className="mb-24" />

        {/* ═══ MILESTONES ═══ */}
        <section className="pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <SectionReveal>
              <div className="sticky top-32">
                <div className="inline-flex items-center gap-2 bg-accent-teal-muted/60 backdrop-blur-sm border border-accent-teal/20 rounded-full px-4 py-2 mb-6">
                  <Clock size={14} className="text-accent-teal" />
                  <span className="text-accent-teal text-[11px] font-mono tracking-[0.2em] uppercase">Journey</span>
                </div>
                <h2 className="font-playfair text-3xl md:text-4xl text-text-primary mb-6 leading-tight">
                  Our <span className="text-gradient-teal">Journey</span>
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-md">
                  From a small passion project to the largest open Tamil cinema archive — here&apos;s how we got here.
                </p>
              </div>
            </SectionReveal>

            <div>
              {milestones.map((m, i) => (
                <MilestoneItem key={m.year} milestone={m} index={i} isLast={i === milestones.length - 1} />
              ))}
            </div>
          </div>
        </section>

        <CinematicDivider className="mb-24" />

        {/* ═══ TECH STACK ═══ */}
        <section className="pb-24">
          <SectionReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-accent-gold-muted/60 backdrop-blur-sm border border-accent-gold/20 rounded-full px-4 py-2 mb-6">
                <Code size={14} className="text-accent-gold" />
                <span className="text-accent-gold text-[11px] font-mono tracking-[0.2em] uppercase">Technology</span>
              </div>
              <h2 className="font-playfair text-3xl md:text-4xl text-text-primary mb-4">
                Built With <span className="text-gradient-gold">Modern Tech</span>
              </h2>
              <p className="text-text-secondary text-sm max-w-md mx-auto">
                Cutting-edge technologies powering a world-class experience
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techStack.map((tech, i) => (
              <TechCard key={tech.name} tech={tech} index={i} />
            ))}
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="pb-24">
          <div className="bg-bg-card border border-border-subtle rounded-3xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-accent-purple/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-playfair text-3xl md:text-4xl text-text-primary mb-4">
                Ready to <span className="text-gradient-gold">Explore</span>?
              </h2>
              <p className="text-text-secondary text-sm max-w-md mx-auto mb-8">
                Dive into our database of {totalCount.toLocaleString()}+ Tamil films and discover your next favorite movie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/movies"
                  className="inline-flex items-center justify-center gap-2 bg-accent-gold text-text-inverse font-semibold px-8 py-4 rounded-xl hover:bg-accent-gold-dim transition-all shadow-lg shadow-accent-gold/20"
                >
                  Browse Database
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 border border-accent-gold text-accent-gold px-8 py-4 rounded-xl hover:bg-accent-gold-muted transition-all"
                >
                  Get in Touch
                  <Mail size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
