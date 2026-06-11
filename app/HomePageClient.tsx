'use client'

import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  BarChart3,
  Bot,
  Play,
  Star,
  Film,
  Camera,
  Clapperboard,
  Award,
  TrendingUp,
  Quote,
  Eye,
  Heart,
  Clock,
  Calendar,
  Users,
  Zap,
  Globe,
  Bookmark,
  Share2,
  MessageCircle,
  ThumbsUp,
  ExternalLink,
  Search,
  Filter,
  Grid,
  List,
  ArrowUpRight,
  ChevronRight,
  Sparkle,
  Wand2,
  Trophy,
  Flame,
  Crown,
  Medal,
  Gem,
  Lightbulb,
  Target,
  Rocket,
  Compass,
  MapPin,
  Tv,
  Monitor,
  Smartphone,
  Volume2,
  Music,
  Mic,
  Palette,
  Mail,
} from 'lucide-react'
import type { Movie } from '../components/ui/MovieCard'
import MovieCard from '../components/ui/MovieCard'
import SectionHeader from '../components/ui/SectionHeader'
import HorizontalScrollRow from '../components/ui/HorizontalScrollRow'
import CinematicDivider from '../components/ui/CinematicDivider'
import SpotlightCard from '../components/ui/SpotlightCard'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import CinemaBackground from '../components/graphics/CinemaBackground'
import FilmStripDecoration from '../components/graphics/FilmStripDecoration'
import TickerBar from '../components/graphics/TickerBar'

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════════════════════ */

interface GenreCount {
  genre: string
  count: number
}

interface Props {
  movies: Movie[]
  blogs: any[]
  recentTitles: string[]
  totalMovies: number
  totalBlogs: number
  genreCounts: GenreCount[]
  avgRating: number
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS — Bar Colors & Film Trivia
   ═══════════════════════════════════════════════════════════════════════════════ */

const barColors = [
  'from-accent-gold to-accent-gold-dim',
  'from-accent-red to-accent-red-bright',
  'from-accent-rose to-accent-rose-bright',
  'from-accent-emerald to-accent-emerald-bright',
  'from-accent-purple to-accent-purple-bright',
  'from-accent-blue to-accent-blue-bright',
  'from-accent-teal to-accent-teal-bright',
  'from-accent-amber to-accent-amber-bright',
]

const barColorSolid = [
  '#E8B84B',
  '#C0392B',
  '#F43F5E',
  '#10B981',
  '#A855F7',
  '#3B82F6',
  '#06B6D4',
  '#F59E0B',
]

/* ── Mail icon imported at top level ── */

const filmTrivia = [
  { icon: '🎬', text: 'The first Tamil talkie film, Kalidas, was released in 1931' },
  { icon: '🏆', text: 'MGR won the National Film Award for Best Feature Film in Tamil' },
  { icon: '🎭', text: 'Sivaji Ganesan acted in over 280 films across 5 decades' },
  { icon: '🎵', text: 'Ilaiyaraaja has composed over 7,000 songs in his career' },
  { icon: '📽️', text: 'Kollywood produces over 200 films annually' },
  { icon: '🌟', text: 'MGR was the first film actor to become Chief Minister of an Indian state' },
  { icon: '🎥', text: 'Padayappa (1999) held the record for longest theatrical run' },
  { icon: '🎞️', text: 'Thalapathy Vijay\'s Leo had one of the highest opening day collections' },
]

const decadeStats = [
  { decade: '1950s', highlight: 'Golden Era begins', count: '~200 films' },
  { decade: '1970s', highlight: 'KB & Balachander era', count: '~500 films' },
  { decade: '1990s', highlight: 'Digital revolution', count: '~1,200 films' },
  { decade: '2000s', highlight: 'Global expansion', count: '~2,000 films' },
  { decade: '2020s', highlight: 'Pan-Indian rise', count: '~1,500+ films' },
]

const heroStats = [
  { icon: Film, suffix: '+', label: 'Movies', color: 'text-accent-gold' },
  { icon: Star, suffix: '+', label: 'Reviews', color: 'text-accent-red' },
  { icon: Users, suffix: '+', label: 'Average Rating', color: 'text-accent-emerald' },
  { icon: Bot, suffix: '', label: 'AI Powered', color: 'text-accent-purple' },
]

const premiumFeatures = [
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find any Tamil film with intelligent search powered by our comprehensive database of thousands of titles.',
    accent: 'accent-gold',
  },
  {
    icon: Bot,
    title: 'AI Recommendations',
    description: 'Our AI understands Tamil cinema deeply. Get personalized suggestions based on your taste and mood.',
    accent: 'accent-purple',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Explore genre trends, ratings distributions, and cinematic data across decades of Tamil filmmaking.',
    accent: 'accent-teal',
  },
  {
    icon: Globe,
    title: 'Pan-Indian Coverage',
    description: 'From classic Kollywood to modern pan-Indian blockbusters, we cover the full spectrum of Tamil cinema.',
    accent: 'accent-rose',
  },
]

const awardsTimeline = [
  { year: '1953', event: 'Chandralekha wins President\'s Silver Medal' },
  { year: '1969', event: 'Kandan Karunai — National Award Winner' },
  { year: '1982', event: 'Sagara Sangamam gains international acclaim' },
  { year: '1996', event: 'Indian selected for Academy Awards consideration' },
  { year: '2005', event: 'Anniyan sweeps Filmfare Awards South' },
  { year: '2017', event: 'Baahubali 2 breaks all Indian box office records' },
  { year: '2022', event: 'RRR wins Golden Globe, Oscar nominations' },
  { year: '2023', event: 'Ponniyin Selvan — epic visual masterpiece' },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── Particle Field — Cinematic dust particles ────────────────────────────── */
function ParticleField({ count = 30 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.1,
      })),
    [count]
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent-gold"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, -15, -45, 0],
            x: [0, 10, -5, 15, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity, p.opacity * 0.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ── Cinematic Spotlight Beam ─────────────────────────────────────────────── */
function SpotlightBeam() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] opacity-[0.04]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(232,184,75,0.3) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] opacity-[0.03]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(192,57,43,0.3) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* ── Animated Gradient Ring ───────────────────────────────────────────────── */
function GradientRing({ size = 300, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full border border-accent-gold/10 ${className}`}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-gold/30" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent-red/20" />
    </motion.div>
  )
}

/* ── Premium Stat Card ────────────────────────────────────────────────────── */
function HeroStatCard({
  icon: Icon,
  value,
  suffix,
  label,
  color,
  index,
}: {
  icon: any
  value: number
  suffix: string
  label: string
  color: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
      className="relative group"
    >
      <SpotlightCard className="bg-bg-card/80 border border-border-subtle p-6 text-center card-shine backdrop-blur-sm">
        {index > 0 && (
          <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-border-accent hidden sm:block" />
        )}
        <div className={`mx-auto mb-3 ${color}`}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <div className="text-[clamp(28px,5vw,44px)] font-playfair text-gradient-gold leading-none mb-2">
          {label === 'AI Powered' ? (
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-purple-muted">
              <Bot className="text-accent-purple" size={28} />
            </span>
          ) : (
            <AnimatedCounter to={value} suffix={suffix} />
          )}
        </div>
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-[0.2em]">{label}</p>
      </SpotlightCard>
    </motion.div>
  )
}

/* ── Film Reel Icon Animation ─────────────────────────────────────────────── */
function FilmReelAnimated({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    >
      <Clapperboard size={20} className="text-accent-gold/40" />
    </motion.div>
  )
}

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

/* ── Section Reveal Wrapper ───────────────────────────────────────────────── */
function SectionReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Trivia Card ──────────────────────────────────────────────────────────── */
function TriviaCard({ item, index }: { item: { icon: string; text: string }; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-bg-card border border-border-subtle rounded-2xl p-6 card-shine cursor-default group"
    >
      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
      <p className="text-text-secondary text-sm leading-relaxed">{item.text}</p>
    </motion.div>
  )
}

/* ── Decade Card ──────────────────────────────────────────────────────────── */
function DecadeCard({
  item,
  index,
}: {
  item: { decade: string; highlight: string; count: string }
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="flex items-center gap-6 p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-border-accent transition-all duration-300 card-shine">
        {/* Year */}
        <div className="shrink-0 w-20 text-center">
          <span className="font-playfair text-2xl text-gradient-gold">{item.decade}</span>
        </div>

        {/* Connector */}
        <div className="hidden sm:block relative shrink-0">
          <motion.div
            className="w-3 h-3 rounded-full bg-accent-gold/30 border-2 border-accent-gold"
            whileHover={{ scale: 1.4 }}
          />
          <div className="absolute top-1/2 left-full w-8 h-px bg-border-accent -translate-y-1/2" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm font-medium truncate">{item.highlight}</p>
          <p className="text-text-muted text-xs mt-0.5">{item.count}</p>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={14}
          className="text-text-muted group-hover:text-accent-gold group-hover:translate-x-1 transition-all shrink-0"
        />
      </div>
    </motion.div>
  )
}

/* ── Feature Card ─────────────────────────────────────────────────────────── */
function FeatureCard({
  feature,
  index,
}: {
  feature: { icon: any; title: string; description: string; accent: string }
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="bg-bg-card border border-border-subtle rounded-2xl p-8 card-shine relative overflow-hidden group"
    >
      {/* Background glow */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-${feature.accent}/5 group-hover:bg-${feature.accent}/10 transition-colors duration-500`}
      />

      <div
        className={`w-14 h-14 rounded-2xl bg-${feature.accent}-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
      >
        <feature.icon size={24} className={`text-${feature.accent}`} strokeWidth={1.5} />
      </div>

      <h3 className="font-playfair text-xl text-text-primary mb-3">{feature.title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>

      <div className="mt-6 flex items-center gap-2 text-accent-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Learn more <ArrowUpRight size={14} />
      </div>
    </motion.div>
  )
}

/* ── Timeline Event ───────────────────────────────────────────────────────── */
function TimelineEvent({
  event,
  index,
  isLast,
}: {
  event: { year: string; event: string }
  index: number
  isLast: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex gap-6 relative"
    >
      {/* Timeline dot & line */}
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          className="w-4 h-4 rounded-full bg-accent-gold border-2 border-bg-primary z-10"
          whileHover={{ scale: 1.5 }}
        />
        {!isLast && <div className="w-px flex-1 bg-border-accent min-h-[40px]" />}
      </div>

      {/* Content */}
      <div className="pb-8">
        <span className="text-accent-gold font-mono text-xs tracking-wider">{event.year}</span>
        <p className="text-text-primary text-sm mt-1 leading-relaxed">{event.event}</p>
      </div>
    </motion.div>
  )
}

/* ── Newsletter CTA ───────────────────────────────────────────────────────── */
function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (email) {
        setSubscribed(true)
        setEmail('')
      }
    },
    [email]
  )

  return (
    <div className="bg-bg-card border border-border-subtle rounded-2xl p-8 md:p-10 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-accent-purple/5 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-gold-muted flex items-center justify-center">
            <Mail size={18} className="text-accent-gold" />
          </div>
          <h3 className="font-playfair text-xl text-text-primary">Stay in the Loop</h3>
        </div>
        <p className="text-text-secondary text-sm mb-6 max-w-md">
          Get the latest Tamil cinema updates, new additions, and AI-powered recommendations delivered to your inbox.
        </p>

        <AnimatePresence mode="wait">
          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 text-accent-emerald"
            >
              <div className="w-8 h-8 rounded-full bg-accent-emerald-muted flex items-center justify-center">
                <ThumbsUp size={16} />
              </div>
              <span className="text-sm font-medium">You&apos;re subscribed! Welcome aboard.</span>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-bg-primary border border-border-mid rounded-xl px-5 py-3.5 text-text-primary text-sm placeholder:text-text-dim focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/20 outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-accent-gold text-text-inverse font-semibold px-7 py-3.5 rounded-xl hover:bg-accent-gold-dim transition-colors shadow-lg shadow-accent-gold/20 whitespace-nowrap"
              >
                Subscribe
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Quick Stats Strip ────────────────────────────────────────────────────── */
function QuickStatsStrip({
  totalMovies,
  totalBlogs,
  avgRating,
}: {
  totalMovies: number
  totalBlogs: number
  avgRating: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="flex flex-wrap justify-center gap-x-8 gap-y-3 py-4"
    >
      {[
        { label: 'Films in DB', value: totalMovies.toLocaleString() },
        { label: 'Published Reviews', value: totalBlogs.toLocaleString() },
        { label: 'Average Rating', value: avgRating > 0 ? `${avgRating}/10` : '—' },
        { label: 'AI Models', value: '1 Active' },
      ].map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
          <span className="text-text-muted text-xs font-mono uppercase tracking-wider">{s.label}:</span>
          <span className="text-text-primary text-xs font-semibold">{s.value}</span>
        </div>
      ))}
    </motion.div>
  )
}



/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function HomePageClient({
  movies,
  blogs,
  recentTitles,
  totalMovies,
  totalBlogs,
  genreCounts,
  avgRating,
}: Props) {
  /* ── Refs for scroll-linked animations ─────────────────────────────────────── */
  const heroRef = useRef<HTMLElement>(null)
  const section2Ref = useRef(null)
  const section3Ref = useRef(null)
  const section4Ref = useRef(null)
  const section5Ref = useRef(null)
  const section6Ref = useRef(null)
  const section7Ref = useRef(null)
  const section8Ref = useRef(null)
  const section9Ref = useRef(null)
  const section10Ref = useRef(null)

  const section2InView = useInView(section2Ref, { once: true, margin: '-100px' })
  const section3InView = useInView(section3Ref, { once: true, margin: '-80px' })
  const section4InView = useInView(section4Ref, { once: true, margin: '-80px' })
  const section5InView = useInView(section5Ref, { once: true, margin: '-80px' })
  const section6InView = useInView(section6Ref, { once: true, margin: '-80px' })
  const section7InView = useInView(section7Ref, { once: true, margin: '-80px' })
  const section8InView = useInView(section8Ref, { once: true, margin: '-80px' })
  const section9InView = useInView(section9Ref, { once: true, margin: '-80px' })
  const section10InView = useInView(section10Ref, { once: true, margin: '-80px' })

  /* ── Hero parallax scroll ──────────────────────────────────────────────────── */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const springY = useSpring(heroY, { stiffness: 50, damping: 20 })

  /* ── Parallax for section decorations ──────────────────────────────────────── */
  const { scrollYProgress: scroll3 } = useScroll({
    target: section3Ref,
    offset: ['start end', 'end start'],
  })
  const parallaxY = useTransform(scroll3, [0, 1], [60, -60])

  const { scrollYProgress: scroll5 } = useScroll({
    target: section5Ref,
    offset: ['start end', 'end start'],
  })
  const parallaxY2 = useTransform(scroll5, [0, 1], [40, -40])

  /* ── State ─────────────────────────────────────────────────────────────────── */
  const [activeTrivia, setActiveTrivia] = useState(0)
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null)

  /* ── Auto-rotate trivia ────────────────────────────────────────────────────── */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTrivia((prev) => (prev + 1) % filmTrivia.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  /* ── Derived data ──────────────────────────────────────────────────────────── */
  const featuredBlog = blogs[0]
  const genreStats = useMemo(() => {
    const maxCount = Math.max(...genreCounts.map((g) => g.count), 1)
    return genreCounts.slice(0, 8).map((g, i) => ({
      name: g.genre,
      count: g.count,
      pct: Math.round((g.count / maxCount) * 100),
      color: barColors[i % barColors.length],
      colorSolid: barColorSolid[i % barColorSolid.length],
    }))
  }, [genreCounts])

  const topRatedMovies = useMemo(
    () => [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6),
    [movies]
  )

  /* ═══════════════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════════════ */

  return (
    <>
      {/* ═══ TICKER BAR ═══ */}
      {recentTitles.length > 0 && <TickerBar items={recentTitles} />}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 1 — EPIC CINEMATIC HERO
          ═══════════════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-10 overflow-hidden"
      >
        {/* Background layers */}
        <CinemaBackground />
        <SpotlightBeam />
        <ParticleField count={40} />

        {/* Decorative rings */}
        <GradientRing size={400} className="top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        <GradientRing size={600} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />

        {/* Parallax content wrapper */}
        <motion.div
          style={{ y: springY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Overline badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2.5 bg-accent-gold-muted/60 backdrop-blur-sm border border-accent-gold/20 rounded-full px-5 py-2.5">
              <FilmReelAnimated />
              <span className="text-accent-gold text-[11px] font-mono tracking-[0.25em] uppercase">
                Kollywood Archive · Est. 2000
              </span>
              <FilmReelAnimated />
            </div>
          </motion.div>

          {/* Main heading */}
          <h1 className="font-playfair text-[clamp(44px,11vw,130px)] leading-[0.88] tracking-tight mb-8">
            <motion.span
              initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="block text-text-primary"
            >
              Tamil
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="block text-text-primary"
            >
              Cinema,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="block text-gradient-gold-shine text-glow-strong"
            >
              Redefined.
            </motion.span>
          </h1>

          {/* Underline reveal */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.65, 0, 0.35, 1] }}
            className="w-24 h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent mb-8"
          />

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-text-secondary text-base lg:text-lg max-w-2xl mb-12 leading-relaxed"
          >
            A high-fidelity archive of Tamil cinema. Discover iconic classics, explore modern masterpieces,
            and rediscover the magic of Kollywood — powered by intelligent recommendations.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 mb-20"
          >
            <Link
              href="/movies"
              className="group relative bg-accent-gold text-text-inverse font-semibold px-10 py-4 rounded-xl overflow-hidden min-h-[52px] flex items-center justify-center shadow-lg shadow-accent-gold/20 hover:shadow-accent-gold/40 transition-all duration-300 hover:scale-[1.02]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Search size={16} />
                Browse Database
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
            <Link
              href="/recommendations"
              className="group border border-accent-gold text-accent-gold px-10 py-4 rounded-xl hover:bg-accent-gold-muted backdrop-blur-sm min-h-[52px] flex items-center justify-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-gold/10"
            >
              <Sparkles size={16} className="mr-2 group-hover:rotate-12 transition-transform" />
              AI Recommendations
            </Link>
          </motion.div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl">
            {heroStats.map((stat, i) => (
              <HeroStatCard
                key={stat.label}
                icon={stat.icon}
                value={i === 0 ? totalMovies : i === 1 ? totalBlogs : i === 2 ? avgRating : 1}
                suffix={i === 0 ? '+' : i === 1 ? '+' : ''}
                label={stat.label}
                color={stat.color}
                index={i}
              />
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono">Scroll to explore</span>
          <motion.div
            className="w-5 h-8 rounded-full border border-text-muted/30 flex items-start justify-center pt-1.5"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-2 rounded-full bg-accent-gold/60"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FILM STRIP DECORATION ═══ */}
      <FilmStripDecoration className="opacity-40" />

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 2 — LATEST ADDITIONS (Horizontal Scroll)
          ═══════════════════════════════════════════════════════════════════════════════ */}
      <section ref={section2Ref} className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={section2InView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            overline="New This Week"
            title="Latest Additions"
            viewAllHref="/movies"
            viewAllLabel="View All Films"
          />
          <HorizontalScrollRow>
            {movies.map((movie, i) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={section2InView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="w-[44vw] sm:w-[200px] shrink-0"
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </HorizontalScrollRow>
        </motion.div>
      </section>

      <CinematicDivider className="max-w-7xl mx-auto px-6 sm:px-8" />

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 3 — FEATURED REVIEW (Cinematic Card)
          ═══════════════════════════════════════════════════════════════════════════════ */}
      {featuredBlog && (
        <section ref={section3Ref} className="section-padding max-w-7xl mx-auto">
          <SectionReveal>
            <SectionHeader overline="Editor's Pick" title="Featured Review" />
          </SectionReveal>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={section3InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="border-gradient-premium rounded-3xl overflow-hidden bg-bg-elevated relative group">
              {/* Shimmer overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-gold/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-[1fr_320px]">
                {/* Content */}
                <div className="p-8 md:p-12 lg:p-16 relative">
                  {/* Overline */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-mono text-accent-gold tracking-[0.3em] uppercase bg-accent-gold-muted px-3 py-1.5 rounded-lg">
                      Featured Review
                    </span>
                    <div className="flex items-center gap-1.5 text-text-muted text-xs">
                      <Calendar size={12} />
                      {new Date(featuredBlog.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-playfair text-2xl md:text-3xl lg:text-[40px] text-text-primary leading-[1.15] mb-6 group-hover:text-accent-gold transition-colors duration-500">
                    {featuredBlog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-text-secondary text-sm lg:text-base leading-relaxed mb-8 max-w-[55ch] line-clamp-4">
                    {featuredBlog.excerpt}
                  </p>

                  {/* Author & CTA */}
                  <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-gold-muted flex items-center justify-center text-accent-gold text-xs font-bold">
                        {featuredBlog.author?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-text-primary text-sm font-medium">{featuredBlog.author}</p>
                        <p className="text-text-muted text-xs">Film Critic</p>
                      </div>
                    </div>
                    <Link
                      href={`/blogs/${featuredBlog.slug}`}
                      className="group/link inline-flex items-center gap-2 bg-accent-gold text-text-inverse font-semibold px-6 py-3 rounded-xl hover:bg-accent-gold-dim transition-all shadow-lg shadow-accent-gold/20 hover:shadow-accent-gold/30"
                    >
                      Read Review
                      <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Quote decoration */}
                <div className="hidden md:flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/[0.06] via-accent-red/5 to-accent-purple/5" />
                  <motion.div
                    style={{ y: parallaxY }}
                    className="relative text-center"
                  >
                    <Quote size={80} className="text-accent-gold/10 mx-auto mb-4" />
                    <span className="block text-[120px] font-playfair text-accent-gold/[0.06] leading-none select-none">
                      &ldquo;
                    </span>
                    <p className="text-text-muted text-xs font-mono tracking-wider uppercase mt-4">Cinema is a mirror</p>
                    <p className="text-text-muted text-xs font-mono tracking-wider uppercase">of society</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      <CinematicDivider className="max-w-7xl mx-auto px-6 sm:px-8" />

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 4 — LATEST REVIEWS GRID
          ═══════════════════════════════════════════════════════════════════════════════ */}
      {blogs.length > 0 && (
        <section ref={section4Ref} className="section-padding max-w-7xl mx-auto">
          <SectionReveal>
            <SectionHeader
              overline="Critics' Corner"
              title="Latest Reviews"
              viewAllHref="/blogs"
              viewAllLabel="All Reviews"
            />
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {blogs.slice(0, 3).map((blog: any, i: number) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 30 }}
                animate={section4InView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
              >
                <Link href={`/blogs/${blog.slug}`} className="block h-full">
                  <SpotlightCard className="bg-bg-card border border-border-subtle p-6 lg:p-8 hover:bg-bg-elevated transition-all duration-300 card-shine group h-full flex flex-col">
                    {/* Top */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-[10px] font-mono text-accent-gold tracking-widest uppercase bg-accent-gold-muted px-2.5 py-1 rounded-lg">
                        {blog.category || 'Review'}
                      </span>
                      <div className="flex items-center gap-1.5 text-text-muted text-xs">
                        <Clock size={11} />
                        {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-playfair text-lg text-text-primary line-clamp-2 mb-3 group-hover:text-accent-gold transition-colors leading-snug">
                      {blog.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-5 flex-1">
                      {blog.excerpt}
                    </p>

                    {/* Bottom */}
                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent-gold-muted flex items-center justify-center text-accent-gold text-[10px] font-bold">
                          {blog.author?.charAt(0) || 'A'}
                        </div>
                        <span className="text-text-muted text-xs">{blog.author}</span>
                      </div>
                      <span className="text-accent-gold text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ArrowRight size={10} />
                      </span>
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 5 — GENRE EXPLORER (Real Data)
          ═══════════════════════════════════════════════════════════════════════════════ */}
      <section ref={section5Ref} className="py-24 sm:py-32 relative overflow-hidden bg-bg-secondary">
        {/* Background decoration */}
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
          <SectionReveal>
            <SectionHeader overline="Deep Dive" title="Genre Explorer" />
            <p className="text-text-secondary text-sm max-w-lg mb-12 -mt-6">
              Explore the rich tapestry of Tamil cinema genres. Data pulled live from our complete database.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
            {/* Left — Stats */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={section5InView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-bg-card border border-border-subtle rounded-2xl p-8">
                <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-3">Database Overview</p>
                <h3 className="font-playfair text-3xl text-text-primary mb-8">By The Numbers</h3>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Films', value: totalMovies.toLocaleString(), accent: 'accent-gold' },
                    { label: 'Top Genre', value: genreStats[0]?.name || '—', accent: 'accent-purple' },
                    { label: 'Avg Rating', value: avgRating > 0 ? String(avgRating) : '—', accent: 'accent-emerald' },
                    { label: 'Genres', value: String(genreCounts.length), accent: 'accent-teal' },
                  ].map((s) => (
                    <motion.div
                      key={s.label}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-bg-primary border border-border-accent rounded-xl px-5 py-4 animate-borderGlow cursor-default`}
                    >
                      <p className={`text-${s.accent} font-playfair text-xl`}>{s.value}</p>
                      <p className="text-text-muted text-xs mt-0.5">{s.label}</p>
                    </motion.div>
                  ))}
                </div>

                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse font-semibold px-7 py-3.5 rounded-xl hover:bg-accent-gold-dim transition-colors shadow-lg shadow-accent-gold/20 mt-8"
                >
                  <BarChart3 size={16} />
                  Full Analytics
                </Link>
              </div>
            </motion.div>

            {/* Right — Genre Bars */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={section5InView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="space-y-4"
            >
              {genreStats.map((g, i) => (
                <motion.div
                  key={g.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={section5InView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
                  className="group cursor-default"
                  onMouseEnter={() => setHoveredGenre(g.name)}
                  onMouseLeave={() => setHoveredGenre(null)}
                >
                  <div className="flex items-center gap-4 mb-1.5">
                    <span
                      className={`text-sm w-24 shrink-0 font-medium transition-colors duration-300 ${
                        hoveredGenre === g.name ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {g.name}
                    </span>
                    <span className="text-accent-gold font-mono text-xs font-bold shrink-0">
                      {g.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-8 bg-bg-primary rounded-full overflow-hidden border border-border-subtle group-hover:border-border-accent transition-colors">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${g.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ background: `linear-gradient(90deg, ${g.colorSolid}33, ${g.colorSolid})` }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      </motion.div>
                    </div>
                    <span className="text-text-muted text-xs w-12 text-right shrink-0 font-mono">
                      {g.pct}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 6 — DID YOU KNOW? (Film Trivia)
          ═══════════════════════════════════════════════════════════════════════════════ */}
      <section ref={section6Ref} className="py-24 sm:py-32 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <SectionReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent-purple-muted/60 backdrop-blur-sm border border-accent-purple/20 rounded-full px-4 py-2 mb-6">
              <Lightbulb size={14} className="text-accent-purple" />
              <span className="text-accent-purple text-[11px] font-mono tracking-[0.2em] uppercase">Did You Know?</span>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-text-primary mb-4">
              Tamil Cinema <span className="text-gradient-gold">Trivia</span>
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Fascinating facts from over a century of Kollywood history
            </p>
          </div>
        </SectionReveal>

        {/* Featured trivia (rotating) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={section6InView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-16"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTrivia}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-bg-card border border-border-subtle rounded-2xl p-8 max-w-2xl mx-auto"
            >
              <span className="text-4xl mb-4 block">{filmTrivia[activeTrivia].icon}</span>
              <p className="text-text-primary text-lg font-playfair leading-relaxed">
                {filmTrivia[activeTrivia].text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {filmTrivia.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTrivia(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeTrivia ? 'bg-accent-gold w-6' : 'bg-text-muted/30 hover:bg-text-muted/50'
                }`}
                aria-label={`Trivia ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Trivia Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filmTrivia.map((item, i) => (
            <TriviaCard key={i} item={item} index={i} />
          ))}
        </div>
      </section>

      <CinematicDivider className="max-w-7xl mx-auto px-6 sm:px-8" />

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 7 — AWARDS TIMELINE
          ═══════════════════════════════════════════════════════════════════════════════ */}
      <section ref={section7Ref} className="py-24 sm:py-32 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left — Heading */}
            <SectionReveal>
              <div className="sticky top-32">
                <div className="inline-flex items-center gap-2 bg-accent-gold-muted/60 backdrop-blur-sm border border-accent-gold/20 rounded-full px-4 py-2 mb-6">
                  <Trophy size={14} className="text-accent-gold" />
                  <span className="text-accent-gold text-[11px] font-mono tracking-[0.2em] uppercase">Legacy</span>
                </div>
                <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-text-primary mb-6">
                  A Legacy of <span className="text-gradient-gold">Excellence</span>
                </h2>
                <p className="text-text-secondary text-base leading-relaxed mb-8 max-w-md">
                  From the golden age of black-and-white classics to today&apos;s pan-Indian blockbusters,
                  Tamil cinema has consistently pushed creative boundaries.
                </p>

                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Award, label: 'National Awards' },
                    { icon: Star, label: 'Filmfare South' },
                    { icon: Globe, label: 'International' },
                  ].map((badge) => (
                    <div
                      key={badge.label}
                      className="flex items-center gap-2 bg-bg-card border border-border-subtle rounded-xl px-4 py-2.5"
                    >
                      <badge.icon size={14} className="text-accent-gold" />
                      <span className="text-text-secondary text-xs font-medium">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>

            {/* Right — Timeline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={section7InView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {awardsTimeline.map((event, i) => (
                <TimelineEvent
                  key={event.year}
                  event={event}
                  index={i}
                  isLast={i === awardsTimeline.length - 1}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 8 — DECADE EVOLUTION
          ═══════════════════════════════════════════════════════════════════════════════ */}
      <section ref={section8Ref} className="py-24 sm:py-32 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <SectionReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent-teal-muted/60 backdrop-blur-sm border border-accent-teal/20 rounded-full px-4 py-2 mb-6">
              <Clock size={14} className="text-accent-teal" />
              <span className="text-accent-teal text-[11px] font-mono tracking-[0.2em] uppercase">Evolution</span>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-text-primary mb-4">
              Through the <span className="text-gradient-teal">Decades</span>
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              The evolution of Tamil cinema from silent films to digital epics
            </p>
          </div>
        </SectionReveal>

        <div className="max-w-3xl mx-auto space-y-3">
          {decadeStats.map((item, i) => (
            <DecadeCard key={item.decade} item={item} index={i} />
          ))}
        </div>
      </section>

      <CinematicDivider className="max-w-7xl mx-auto px-6 sm:px-8" />

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 9 — WHY TAMILCINEMAHUB? (Features)
          ═══════════════════════════════════════════════════════════════════════════════ */}
      <section ref={section9Ref} className="py-24 sm:py-32 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
          <SectionReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-accent-rose-muted/60 backdrop-blur-sm border border-accent-rose/20 rounded-full px-4 py-2 mb-6">
                <Gem size={14} className="text-accent-rose" />
                <span className="text-accent-rose text-[11px] font-mono tracking-[0.2em] uppercase">Why Us</span>
              </div>
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-text-primary mb-4">
                Why <span className="text-gradient-rose">TamilCinemaHub</span>?
              </h2>
              <p className="text-text-secondary text-sm max-w-lg mx-auto">
                More than a database — a living, breathing archive of Tamil cinematic heritage
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumFeatures.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          SECTION 10 — AI CTA + NEWSLETTER
          ═══════════════════════════════════════════════════════════════════════════════ */}
      <section ref={section10Ref} className="py-32 sm:py-40 relative overflow-hidden bg-bg-deep">
        {/* Animated blobs */}
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blob-1 opacity-50" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full blob-2 opacity-50" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full blob-3 opacity-30" />
        <div className="absolute bottom-1/3 left-1/3 w-56 h-56 rounded-full blob-4 opacity-30" />

        {/* Floating ghost cards */}
        {movies.slice(0, 4).map((m, i) => (
          <motion.div
            key={m._id}
            className="absolute opacity-[0.03] blur-[2px] pointer-events-none"
            animate={{
              y: [0, -15, 0],
              rotate: [i === 0 ? -6 : i === 1 ? 3 : i === 2 ? -2 : 4, i === 0 ? -4 : i === 1 ? 5 : i === 2 ? -3 : 2, i === 0 ? -6 : i === 1 ? 3 : i === 2 ? -2 : 4],
            }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              left: `${10 + i * 22}%`,
              top: `${20 + (i % 2) * 25}%`,
            }}
          >
            <div className="w-20 h-30 rounded-lg bg-bg-elevated border border-border-subtle" />
          </motion.div>
        ))}

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">
          {/* AI Section */}
          <SectionReveal>
            <div className="text-center mb-16">
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block mb-8"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-purple to-accent-gold flex items-center justify-center shadow-lg shadow-accent-purple/20">
                  <Wand2 size={32} className="text-white" />
                </div>
              </motion.div>

              <h2 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-gradient-gold mb-6 leading-tight">
                Find Your Perfect<br />Tamil Film
              </h2>
              <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Our AI assistant knows every film in the database. Ask for recommendations by mood, genre, actor, or era — and discover hidden gems you never knew existed.
              </p>

              <Link
                href="/recommendations"
                className="group inline-flex items-center gap-3 bg-accent-gold text-text-inverse font-semibold px-10 py-4.5 rounded-xl hover:bg-accent-gold-dim transition-all shadow-lg shadow-accent-gold/20 hover:shadow-accent-gold/40 hover:scale-[1.02]"
              >
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-lg">Start Exploring</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </SectionReveal>

          {/* Divider */}
          <AnimatedUnderline className="max-w-xs mx-auto mb-16" />

          {/* Quick stats strip */}
          <QuickStatsStrip totalMovies={totalMovies} totalBlogs={totalBlogs} avgRating={avgRating} />

          {/* Newsletter */}
          <SectionReveal delay={0.2}>
            <div className="max-w-xl mx-auto mt-12">
              <NewsletterCTA />
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
