'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Star,
  Calendar,
  Clock,
  Film,
  Users,
  Award,
  Play,
  ExternalLink,
  Bookmark,
  Heart,
  ChevronRight,
  Quote,
  Globe,
  Tv,
  Monitor,
  Smartphone,
  MapPin,
  Clapperboard,
} from 'lucide-react'
import RatingStars from '../../../components/graphics/RatingStars'
import GenreBadge from '../../../components/ui/GenreBadge'
import CinematicDivider from '../../../components/ui/CinematicDivider'
import SpotlightCard from '../../../components/ui/SpotlightCard'
import CinemaBackground from '../../../components/graphics/CinemaBackground'
import { toArray } from '../../../lib/utils'

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════════════════════ */

interface Props {
  movie: any
  posterUrl: string | null
  backdropUrl: string | null
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════════ */

const ottIcons: Record<string, string> = {
  Netflix: '🎬',
  'Amazon Prime': '📦',
  'Disney+ Hotstar': '🌟',
  ZEE5: '📺',
  SunNXT: '☀️',
  'SonyLIV': '🎭',
  'Aha': '💡',
  JioCinema: '📱',
}

const ratingLabels: Record<string, { text: string; color: string }> = {
  excellent: { text: 'Masterpiece', color: 'text-accent-gold' },
  good: { text: 'Highly Recommended', color: 'text-accent-emerald' },
  average: { text: 'Worth Watching', color: 'text-accent-amber' },
  poor: { text: 'Below Average', color: 'text-accent-red' },
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── Ambient Glow ──────────────────────────────────────────────────────────── */
function AmbientGlow({ posterUrl }: { posterUrl: string | null }) {
  if (!posterUrl) return null
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 scale-150 blur-[100px] opacity-20">
        <Image src={posterUrl} alt="" fill className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/50 via-transparent to-bg-primary" />
    </div>
  )
}

/* ── Film Reel Decoration ──────────────────────────────────────────────────── */
function FilmReelDecor() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none hidden lg:block">
      <motion.svg
        viewBox="0 0 200 200"
        className="w-[300px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="100" cy="100" r="90" className="text-accent-gold" />
        <circle cx="100" cy="100" r="30" className="text-accent-gold" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <circle
            key={angle}
            cx={100 + 60 * Math.cos((angle * Math.PI) / 180)}
            cy={100 + 60 * Math.sin((angle * Math.PI) / 180)}
            r="12"
            className="text-accent-gold"
          />
        ))}
      </motion.svg>
    </div>
  )
}

/* ── Rating Badge ──────────────────────────────────────────────────────────── */
function RatingBadgeLarge({ rating }: { rating: number }) {
  const label =
    rating >= 8
      ? ratingLabels.excellent
      : rating >= 6
        ? ratingLabels.good
        : rating >= 4
          ? ratingLabels.average
          : ratingLabels.poor

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-bg-card border border-border-accent flex items-center justify-center relative overflow-hidden">
          <span className="font-playfair text-3xl font-bold text-accent-gold relative z-10">{rating.toFixed(1)}</span>
          <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 to-transparent" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-gold flex items-center justify-center">
          <Star size={12} className="text-text-inverse" fill="currentColor" />
        </div>
      </div>
      <div>
        <p className={`font-semibold text-sm ${label.color}`}>{label.text}</p>
        <RatingStars rating={rating} />
        <p className="text-text-muted text-xs mt-1">Out of 10</p>
      </div>
    </div>
  )
}

/* ── Cast Member Card ──────────────────────────────────────────────────────── */
function CastMemberCard({ name, index }: { name: string; index: number }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.05 }}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center group-hover:border-accent-gold/30 transition-colors">
        <span className="text-accent-gold/60 text-sm font-bold group-hover:text-accent-gold transition-colors">
          {initials}
        </span>
      </div>
      <span className="text-text-secondary text-xs text-center leading-tight max-w-[80px] truncate group-hover:text-text-primary transition-colors">
        {name}
      </span>
    </motion.div>
  )
}

/* ── OTT Platform Card ─────────────────────────────────────────────────────── */
function OTTCard({ platform, index }: { platform: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      whileHover={{ y: -2, scale: 1.03 }}
      className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-gold/30 transition-all group cursor-default"
    >
      <span className="text-xl">{ottIcons[platform] || '📺'}</span>
      <div>
        <p className="text-text-primary text-sm font-medium group-hover:text-accent-gold transition-colors">{platform}</p>
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Streaming</p>
      </div>
    </motion.div>
  )
}

/* ── Info Pill ─────────────────────────────────────────────────────────────── */
function InfoPill({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-bg-card border border-border-subtle">
      <Icon size={14} className="text-accent-gold/60" />
      <div>
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">{label}</p>
        <p className="text-text-primary text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function MovieDetailClient({ movie, posterUrl, backdropUrl }: Props) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const heroRef = useRef(null)
  const detailsRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const detailsInView = useInView(detailsRef, { once: true, margin: '-50px' })

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const ottList = toArray(movie.ottPlatform)
  const genreList = toArray(movie.genre)
  const castList = toArray(movie.cast)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ratingColor =
    (movie.rating || 0) >= 8
      ? 'text-accent-gold'
      : (movie.rating || 0) >= 6
        ? 'text-accent-emerald'
        : (movie.rating || 0) >= 4
          ? 'text-accent-amber'
          : 'text-accent-red'

  return (
    <>
      {/* ═══ MOBILE LAYOUT (< lg) ═══ */}
      <div className="lg:hidden">
        {/* Full-bleed poster hero */}
        <div ref={heroRef} className="relative w-full h-[65vh] overflow-hidden">
          {posterUrl ? (
            <motion.div style={{ y: heroParallax }} className="absolute inset-0 scale-110">
              <Image src={posterUrl} alt={movie.title} fill className="object-cover object-top" priority />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2A1F08] via-bg-elevated to-bg-card flex items-center justify-center">
              <span className="font-playfair text-8xl text-text-muted/20">{movie.title[0]}</span>
            </div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/40 to-transparent" />

          {/* Back button */}
          <Link
            href="/movies"
            className="absolute top-4 left-4 z-10 w-11 h-11 rounded-full glass flex items-center justify-center hover:bg-accent-gold-muted transition-colors"
          >
            <ArrowLeft size={18} className="text-text-primary" />
          </Link>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className={`w-11 h-11 rounded-full glass flex items-center justify-center transition-all ${
                liked ? 'text-accent-rose bg-accent-rose/20' : 'text-text-primary hover:bg-accent-gold-muted'
              }`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleCopy}
              className="w-11 h-11 rounded-full glass flex items-center justify-center text-text-primary hover:bg-accent-gold-muted transition-colors"
            >
              {copied ? <Check size={18} className="text-accent-emerald" /> : <Share2 size={18} />}
            </button>
          </div>

          {/* Genre + rating overlaid */}
          <div className="absolute bottom-24 left-5 flex items-center gap-2 flex-wrap">
            {genreList.map((g) => (
              <GenreBadge key={g} genre={g} />
            ))}
            {movie.rating && (
              <span className={`text-xs font-mono font-bold ${ratingColor} bg-bg-elevated/80 backdrop-blur-sm px-3 py-1 rounded-lg`}>
                ★ {movie.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Title overlaid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute bottom-6 left-5 right-5 z-10"
          >
            <h1 className="font-playfair text-3xl text-text-primary leading-tight">{movie.title}</h1>
            {movie.titleTanglish && <p className="text-text-muted text-xs mt-1.5">{movie.titleTanglish}</p>}
          </motion.div>
        </div>

        {/* Content card */}
        <div className="bg-bg-primary rounded-t-3xl -mt-8 relative z-10 px-6 pt-8 pb-28">
          {/* Year + Director */}
          <div className="flex items-center gap-3 mb-6 text-text-secondary text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-accent-gold/60" />
              {movie.year}
            </span>
            <span className="text-border-mid">·</span>
            <span className="flex items-center gap-1.5">
              <Clapperboard size={13} className="text-accent-gold/60" />
              {movie.director}
            </span>
          </div>

          {/* Rating section */}
          {movie.rating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <RatingBadgeLarge rating={movie.rating} />
            </motion.div>
          )}

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {movie.year && <InfoPill icon={Calendar} label="Year" value={String(movie.year)} />}
            {movie.director && <InfoPill icon={Clapperboard} label="Director" value={movie.director} />}
            {castList.length > 0 && <InfoPill icon={Users} label="Cast" value={`${castList.length} actors`} />}
          </div>

          <CinematicDivider className="my-6" />

          {/* Cast */}
          {castList.length > 0 && (
            <div className="mb-8">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
                <Users size={12} className="text-accent-gold/40" />
                Cast
              </h3>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {castList.map((c, i) => (
                  <CastMemberCard key={c} name={c} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* OTT Platforms */}
          {ottList.length > 0 && (
            <div className="mb-8">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
                <Globe size={12} className="text-accent-gold/40" />
                Available On
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {ottList.map((p, i) => (
                  <OTTCard key={p} platform={p} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          {movie.synopsis && (
            <div className="mb-8">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
                <Quote size={12} className="text-accent-gold/40" />
                Synopsis
              </h3>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent-gold/20 rounded-full" />
                <p className="text-text-secondary text-sm leading-relaxed pl-4">{movie.synopsis}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-10">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:border-border-accent hover:text-text-primary transition-all"
            >
              {copied ? <Check size={14} className="text-accent-emerald" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                bookmarked
                  ? 'border-accent-gold/40 bg-accent-gold-muted text-accent-gold'
                  : 'border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary'
              }`}
            >
              <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
              Save
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(movie.title + ' - TamilCinemaHub')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:border-border-accent hover:text-text-primary transition-all"
            >
              <Share2 size={14} />
              Tweet
            </a>
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP LAYOUT (≥ lg) ═══ */}
      <div className="hidden lg:block min-h-screen pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-8 lg:px-10">
          {/* Back link */}
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 text-text-secondary text-sm hover:text-accent-gold mb-10 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Movies
          </Link>

          <div className="grid grid-cols-[340px_1fr] gap-14">
            {/* Poster with ambient glow */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative"
            >
              <AmbientGlow posterUrl={posterUrl} />

              <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-border-subtle relative shadow-2xl group">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                    sizes="340px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2A1F08] via-bg-elevated to-bg-card flex items-center justify-center">
                    <span className="font-playfair text-8xl text-text-muted/20">{movie.title[0]}</span>
                  </div>
                )}

                {/* Poster overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                  <span className="text-white/80 text-xs font-mono uppercase tracking-wider">View Poster</span>
                </div>
              </div>

              {/* Film reel decoration */}
              <FilmReelDecor />
            </motion.div>

            {/* Details */}
            <motion.div
              ref={detailsRef}
              initial={{ opacity: 0, x: 30 }}
              animate={detailsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Genre badges */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                {genreList.map((g) => (
                  <GenreBadge key={g} genre={g} />
                ))}
              </div>

              {/* Title */}
              <h1 className="font-playfair text-4xl lg:text-5xl xl:text-[56px] text-text-primary leading-[1.1] mb-3">
                {movie.title}
              </h1>

              {movie.titleTanglish && (
                <p className="text-text-muted text-sm mb-6 font-mono italic">{movie.titleTanglish}</p>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 mb-8 flex-wrap">
                {movie.year && (
                  <span className="flex items-center gap-1.5 text-text-secondary text-sm font-medium">
                    <Calendar size={14} className="text-accent-gold/60" />
                    {movie.year}
                  </span>
                )}
                {movie.director && (
                  <>
                    <span className="text-border-mid">·</span>
                    <span className="flex items-center gap-1.5 text-text-secondary text-sm font-medium">
                      <Clapperboard size={14} className="text-accent-gold/60" />
                      {movie.director}
                    </span>
                  </>
                )}
                {movie.rating && (
                  <>
                    <span className="text-border-mid">·</span>
                    <span className={`font-mono text-2xl font-bold ${ratingColor}`} style={{ textShadow: '0 0 40px currentColor' }}>
                      {movie.rating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>

              {/* Rating section */}
              {movie.rating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={detailsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mb-8"
                >
                  <RatingBadgeLarge rating={movie.rating} />
                </motion.div>
              )}

              <CinematicDivider className="my-8" />

              {/* Cast */}
              {castList.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
                    <Users size={12} className="text-accent-gold/40" />
                    Cast
                  </h3>
                  <div className="flex gap-5 flex-wrap">
                    {castList.map((c, i) => (
                      <CastMemberCard key={c} name={c} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* OTT Platforms */}
              {ottList.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
                    <Globe size={12} className="text-accent-gold/40" />
                    Available On
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {ottList.map((p, i) => (
                      <OTTCard key={p} platform={p} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Synopsis */}
              {movie.synopsis && (
                <div className="mb-10">
                  <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
                    <Quote size={12} className="text-accent-gold/40" />
                    Synopsis
                  </h3>
                  <div className="relative max-w-[65ch]">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent-gold/20 rounded-full" />
                    <p className="text-text-secondary leading-relaxed pl-5 text-[15px]">{movie.synopsis}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:border-border-accent hover:text-text-primary transition-all"
                >
                  {copied ? <Check size={14} className="text-accent-emerald" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                    bookmarked
                      ? 'border-accent-gold/40 bg-accent-gold-muted text-accent-gold'
                      : 'border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary'
                  }`}
                >
                  <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
                  {bookmarked ? 'Saved' : 'Save'}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(movie.title + ' - TamilCinemaHub')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:border-border-accent hover:text-text-primary transition-all"
                >
                  <Share2 size={14} />
                  Share
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
