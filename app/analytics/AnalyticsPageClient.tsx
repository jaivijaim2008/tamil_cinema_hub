'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Film,
  Users,
  Star,
  Calendar,
  ArrowLeft,
  BarChart3,
  PieChart,
  Trophy,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts'
import SpotlightCard from '../../components/ui/SpotlightCard'
import AnimatedCounter from '../../components/ui/AnimatedCounter'
import RatingBadge from '../../components/ui/RatingBadge'
import CinematicDivider from '../../components/ui/CinematicDivider'
import CinemaBackground from '../../components/graphics/CinemaBackground'

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════════════════════ */

interface Props {
  movies: any[]
  totalCount: number
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════════ */

const CHART_COLORS = ['#E8B84B', '#C0392B', '#22c55e', '#3b82f6', '#a855f7', '#f97316', '#06b6d4', '#ec4899', '#F43F5E', '#10B981']

const kpiIcons = [
  { icon: Film, bg: 'bg-accent-gold-muted', text: 'text-accent-gold' },
  { icon: Users, bg: 'bg-accent-purple-muted', text: 'text-accent-purple' },
  { icon: Star, bg: 'bg-accent-emerald-muted', text: 'text-accent-emerald' },
  { icon: Calendar, bg: 'bg-accent-teal-muted', text: 'text-accent-teal' },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── KPI Card ──────────────────────────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  bg,
  text,
  index,
}: {
  label: string
  value: number
  suffix: string
  icon: any
  bg: string
  text: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <SpotlightCard className="bg-bg-card border border-border-subtle p-6 animate-borderGlow card-shine h-full">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
          <Icon size={20} className={text} />
        </div>
        <div className="text-[clamp(24px,4vw,36px)] font-playfair text-gradient-gold leading-none mb-1">
          <AnimatedCounter to={value} suffix={suffix} />
        </div>
        <p className="text-text-muted text-xs font-mono uppercase tracking-wider">{label}</p>
      </SpotlightCard>
    </motion.div>
  )
}

/* ── Chart Card ────────────────────────────────────────────────────────────── */
function ChartCard({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <SpotlightCard className={`bg-bg-card border border-border-subtle p-6 lg:p-8 ${className}`}>
        <h3 className="font-playfair text-lg text-text-primary mb-6 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
          {title}
        </h3>
        {children}
      </SpotlightCard>
    </motion.div>
  )
}

/* ── Director Row ──────────────────────────────────────────────────────────── */
function DirectorRow({
  director,
  rank,
  maxCount,
}: {
  director: { name: string; count: number; avgRating: number }
  rank: number
  maxCount: number
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="border-b border-border-subtle/50 hover:bg-bg-elevated transition-colors group"
    >
      <td className="py-4 px-3">
        <span className={`font-mono font-bold text-sm ${rank <= 3 ? 'text-accent-gold' : 'text-text-muted'}`}>
          {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
        </span>
      </td>
      <td className="py-4 px-3 text-text-primary font-medium">{director.name}</td>
      <td className="py-4 px-3 text-text-secondary font-mono">{director.count}</td>
      <td className="py-4 px-3">
        {director.avgRating > 0 ? <RatingBadge rating={director.avgRating} /> : <span className="text-text-muted">—</span>}
      </td>
      <td className="py-4 px-3 hidden sm:table-cell">
        <div className="w-full max-w-[200px] h-2.5 bg-bg-primary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(director.count / maxCount) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-accent-gold to-accent-gold-dim rounded-full"
          />
        </div>
      </td>
    </motion.tr>
  )
}

/* ── Genre Bar ─────────────────────────────────────────────────────────────── */
function GenreBar({
  name,
  value,
  maxVal,
  color,
  index,
}: {
  name: string
  value: number
  maxVal: number
  color: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group"
    >
      <div className="flex items-center gap-4 mb-1.5">
        <span className="text-text-secondary text-sm w-24 shrink-0 truncate font-medium group-hover:text-text-primary transition-colors">
          {name}
        </span>
        <span className="text-accent-gold font-mono text-xs font-bold shrink-0">{value}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-7 bg-bg-primary rounded-full overflow-hidden border border-border-subtle group-hover:border-border-accent transition-colors">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(value / maxVal) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full rounded-full relative overflow-hidden"
            style={{ background: `linear-gradient(90deg, ${color}44, ${color})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </motion.div>
        </div>
        <span className="text-text-muted text-xs w-12 text-right shrink-0 font-mono">
          {Math.round((value / maxVal) * 100)}%
        </span>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function AnalyticsPageClient({ movies, totalCount }: Props) {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true })

  const [activeChart, setActiveChart] = useState<'year' | 'genre' | 'rating'>('year')

  const stats = useMemo(() => {
    // Year distribution
    const yearMap = new Map<number, number>()
    movies.forEach((m) => {
      if (m.year) yearMap.set(m.year, (yearMap.get(m.year) || 0) + 1)
    })
    const yearData = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year: String(year), count }))
      .sort((a, b) => Number(a.year) - Number(b.year))

    // Genre distribution
    const genreMap = new Map<string, number>()
    movies.forEach((m) => {
      const genres = Array.isArray(m.genre) ? m.genre : m.genre ? [m.genre] : []
      genres.forEach((g: string) => genreMap.set(g, (genreMap.get(g) || 0) + 1))
    })
    const genreData = Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Director stats
    const dirMap = new Map<string, { count: number; totalRating: number }>()
    movies.forEach((m) => {
      if (m.director) {
        const existing = dirMap.get(m.director) || { count: 0, totalRating: 0 }
        dirMap.set(m.director, {
          count: existing.count + 1,
          totalRating: existing.totalRating + (m.rating || 0),
        })
      }
    })
    const directors = Array.from(dirMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgRating: data.count > 0 ? data.totalRating / data.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    // Rating distribution
    const ratingBuckets = [
      { range: '1–2', count: 0, color: '#C0392B' },
      { range: '3–4', count: 0, color: '#F59E0B' },
      { range: '5–6', count: 0, color: '#3B82F6' },
      { range: '7–8', count: 0, color: '#10B981' },
      { range: '9–10', count: 0, color: '#E8B84B' },
    ]
    movies.forEach((m) => {
      if (!m.rating) return
      if (m.rating <= 2) ratingBuckets[0].count++
      else if (m.rating <= 4) ratingBuckets[1].count++
      else if (m.rating <= 6) ratingBuckets[2].count++
      else if (m.rating <= 8) ratingBuckets[3].count++
      else ratingBuckets[4].count++
    })

    const avgRating =
      movies.length > 0
        ? movies.reduce((sum, m) => sum + (m.rating || 0), 0) / movies.filter((m) => m.rating).length
        : 0

    const uniqueDirectors = dirMap.size
    const yearSpan =
      yearData.length > 0 ? Number(yearData[yearData.length - 1].year) - Number(yearData[0].year) : 0

    // Decade distribution
    const decadeMap = new Map<string, number>()
    movies.forEach((m) => {
      if (m.year) {
        const decade = `${Math.floor(m.year / 10) * 10}s`
        decadeMap.set(decade, (decadeMap.get(decade) || 0) + 1)
      }
    })
    const decadeData = Array.from(decadeMap.entries())
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => a.decade.localeCompare(b.decade))

    return { yearData, genreData, directors, ratingBuckets, avgRating, uniqueDirectors, yearSpan, decadeData }
  }, [movies])

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-16">
      {/* ═══ HERO HEADER ═══ */}
      <section ref={headerRef} className="relative overflow-hidden py-20 px-6 sm:px-8 lg:px-10">
        <CinemaBackground />

        {/* Decorative */}
        <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none">
          <BarChart3 size={200} className="text-accent-gold" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-text-secondary text-sm hover:text-accent-gold mb-6 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Home
            </Link>

            <div className="inline-flex items-center gap-2 bg-accent-gold-muted/60 backdrop-blur-sm border border-accent-gold/20 rounded-full px-4 py-2 mb-6">
              <BarChart3 size={14} className="text-accent-gold" />
              <span className="text-accent-gold text-[11px] font-mono tracking-[0.2em] uppercase">Analytics</span>
            </div>

            <h1 className="font-playfair text-[clamp(32px,6vw,64px)] text-text-primary leading-tight mb-4">
              Kollywood <span className="text-gradient-gold">in Data</span>
            </h1>
            <p className="text-text-secondary text-sm sm:text-lg max-w-xl leading-relaxed">
              Exploring {totalCount.toLocaleString()} Tamil films across decades — trends, genres, ratings, and the directors who shaped an industry.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* ═══ KPI CARDS ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-14">
          {[
            { label: 'Total Films', value: totalCount, suffix: '' },
            { label: 'Directors', value: stats.uniqueDirectors, suffix: '' },
            { label: 'Avg Rating', value: Math.round(stats.avgRating * 10) / 10, suffix: '' },
            { label: 'Decades', value: stats.yearSpan, suffix: '+' },
          ].map((kpi, i) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              suffix={kpi.suffix}
              icon={kpiIcons[i].icon}
              bg={kpiIcons[i].bg}
              text={kpiIcons[i].text}
              index={i}
            />
          ))}
        </div>

        {/* ═══ CHART TABS ═══ */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {[
            { key: 'year' as const, label: 'By Year', icon: Calendar },
            { key: 'genre' as const, label: 'By Genre', icon: PieChart },
            { key: 'rating' as const, label: 'By Rating', icon: Star },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeChart === tab.key
                  ? 'bg-accent-gold text-text-inverse shadow-lg shadow-accent-gold/20'
                  : 'border border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ CHARTS GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-14">
          {/* Bar Chart - Movies by Year */}
          {activeChart === 'year' && (
            <>
              <ChartCard title="Movies by Year">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.yearData.slice(-20)} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F5CC6A" />
                          <stop offset="100%" stopColor="#C49A35" />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" tick={{ fill: '#5A5A5A', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#5A5A5A', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(232,184,75,0.2)', borderRadius: '12px', color: '#F0EDE8' }}
                        cursor={{ fill: 'rgba(232,184,75,0.05)' }}
                      />
                      <Bar dataKey="count" fill="url(#goldGrad)" radius={[6, 6, 0, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Decade Distribution">
                <div className="space-y-4">
                  {stats.decadeData.map((d, i) => {
                    const maxVal = Math.max(...stats.decadeData.map((x) => x.count), 1)
                    return (
                      <motion.div
                        key={d.decade}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                        className="flex items-center gap-4"
                      >
                        <span className="text-text-secondary text-sm w-16 shrink-0 font-mono font-bold">{d.decade}</span>
                        <div className="flex-1 h-8 bg-bg-primary rounded-full overflow-hidden border border-border-subtle">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(d.count / maxVal) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                            className="h-full bg-gradient-to-r from-accent-gold/60 to-accent-gold rounded-full relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
                          </motion.div>
                        </div>
                        <span className="text-accent-gold font-mono text-xs w-10 text-right font-bold">{d.count}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </ChartCard>
            </>
          )}

          {/* Genre Charts */}
          {activeChart === 'genre' && (
            <>
              <ChartCard title="Genre Distribution">
                <div className="h-[300px] flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={stats.genreData.slice(0, 10)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {stats.genreData.slice(0, 10).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(232,184,75,0.2)', borderRadius: '12px', color: '#F0EDE8' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  {stats.genreData.slice(0, 8).map((g, i) => (
                    <span key={g.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                      {g.name} ({g.value})
                    </span>
                  ))}
                </div>
              </ChartCard>

              <ChartCard title="Top Genres">
                <div className="space-y-4">
                  {stats.genreData.slice(0, 10).map((g, i) => (
                    <GenreBar
                      key={g.name}
                      name={g.name}
                      value={g.value}
                      maxVal={stats.genreData[0]?.value || 1}
                      color={CHART_COLORS[i % CHART_COLORS.length]}
                      index={i}
                    />
                  ))}
                </div>
              </ChartCard>
            </>
          )}

          {/* Rating Charts */}
          {activeChart === 'rating' && (
            <>
              <ChartCard title="Rating Distribution">
                <div className="space-y-4">
                  {stats.ratingBuckets.map((b) => (
                    <div key={b.range} className="flex items-center gap-4">
                      <span className="text-text-secondary text-sm w-12 shrink-0 font-medium">{b.range}</span>
                      <div className="flex-1 h-8 bg-bg-primary rounded-full overflow-hidden border border-border-subtle">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${totalCount > 0 ? (b.count / totalCount) * 100 : 0}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${b.color}66, ${b.color})` }}
                        />
                      </div>
                      <span className="font-mono text-xs w-10 text-right shrink-0 font-bold" style={{ color: b.color }}>
                        {b.count}
                      </span>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard title="Rating Overview">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-full bg-bg-primary border-4 border-accent-gold/20 flex items-center justify-center">
                      <span className="font-playfair text-4xl font-bold text-accent-gold">{stats.avgRating.toFixed(1)}</span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent-gold text-text-inverse text-xs font-bold px-3 py-1 rounded-full">
                      AVG
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm mb-2">Average Rating Across All Films</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={s <= Math.round(stats.avgRating / 2) ? 'text-accent-gold' : 'text-text-muted/30'}
                        fill={s <= Math.round(stats.avgRating / 2) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
              </ChartCard>
            </>
          )}
        </div>

        <CinematicDivider className="mb-14" />

        {/* ═══ DIRECTORS TABLE ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <SpotlightCard className="bg-bg-card border border-border-subtle p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-playfair text-xl text-text-primary flex items-center gap-2">
                <Trophy size={18} className="text-accent-gold" />
                Top Directors
              </h3>
              <span className="text-text-muted text-xs font-mono">
                {stats.directors.length} directors shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left text-text-muted text-xs uppercase tracking-wider py-3 px-3 w-12">#</th>
                    <th className="text-left text-text-muted text-xs uppercase tracking-wider py-3 px-3">Director</th>
                    <th className="text-left text-text-muted text-xs uppercase tracking-wider py-3 px-3">Films</th>
                    <th className="text-left text-text-muted text-xs uppercase tracking-wider py-3 px-3">Avg Rating</th>
                    <th className="text-left text-text-muted text-xs uppercase tracking-wider py-3 px-3 hidden sm:table-cell">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.directors.map((d, i) => (
                    <DirectorRow
                      key={d.name}
                      director={d}
                      rank={i + 1}
                      maxCount={stats.directors[0]?.count || 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </div>
  )
}
