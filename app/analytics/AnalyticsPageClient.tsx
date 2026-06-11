'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Film, Users, Star, Calendar, ArrowLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import SpotlightCard from '../../components/ui/SpotlightCard'
import AnimatedCounter from '../../components/ui/AnimatedCounter'
import RatingBadge from '../../components/ui/RatingBadge'
import CinematicDivider from '../../components/ui/CinematicDivider'
import CinemaBackground from '../../components/graphics/CinemaBackground'

interface Props {
  movies: any[]
  totalCount: number
}

const CHART_COLORS = ['#E8B84B', '#C0392B', '#22c55e', '#3b82f6', '#a855f7', '#f97316', '#06b6d4', '#ec4899']

export default function AnalyticsPageClient({ movies, totalCount }: Props) {
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
      { range: '1-2', count: 0 },
      { range: '3-4', count: 0 },
      { range: '5-6', count: 0 },
      { range: '7-8', count: 0 },
      { range: '9-10', count: 0 },
    ]
    movies.forEach((m) => {
      if (!m.rating) return
      if (m.rating <= 2) ratingBuckets[0].count++
      else if (m.rating <= 4) ratingBuckets[1].count++
      else if (m.rating <= 6) ratingBuckets[2].count++
      else if (m.rating <= 8) ratingBuckets[3].count++
      else ratingBuckets[4].count++
    })

    const avgRating = movies.length > 0
      ? movies.reduce((sum, m) => sum + (m.rating || 0), 0) / movies.filter((m) => m.rating).length
      : 0

    const uniqueDirectors = dirMap.size
    const yearSpan = yearData.length > 0
      ? Number(yearData[yearData.length - 1].year) - Number(yearData[0].year)
      : 0

    return { yearData, genreData, directors, ratingBuckets, avgRating, uniqueDirectors, yearSpan }
  }, [movies])

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-16">
      {/* Header */}
      <section className="relative overflow-hidden py-20 px-6 sm:px-8 lg:px-10">
        <CinemaBackground />
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-text-secondary text-sm hover:text-accent-gold mb-6 transition-colors">
            <ArrowLeft size={16} /> Home
          </Link>
          <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-3">Analytics</p>
          <h1 className="font-playfair text-[clamp(28px,5vw,48px)] text-text-primary mb-2">Kollywood in Data</h1>
          <p className="text-text-secondary text-sm sm:text-base mt-2">Exploring {totalCount.toLocaleString()} Tamil films across decades</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-14">
          {[
            { label: 'Total Films', value: totalCount, icon: Film, suffix: '' },
            { label: 'Directors', value: stats.uniqueDirectors, icon: Users, suffix: '' },
            { label: 'Avg Rating', value: Math.round(stats.avgRating * 10) / 10, icon: Star, suffix: '' },
            { label: 'Decades', value: stats.yearSpan, icon: Calendar, suffix: '+' },
          ].map((kpi) => (
            <SpotlightCard key={kpi.label} className="bg-bg-card border border-border-subtle p-6 animate-borderGlow card-shine">
              <div className="w-12 h-12 rounded-xl bg-accent-gold-muted flex items-center justify-center mb-4">
                <kpi.icon size={20} className="text-accent-gold" />
              </div>
              <div className="text-[clamp(24px,4vw,36px)] font-playfair text-gradient-gold leading-none mb-1">
                <AnimatedCounter to={kpi.value} suffix={kpi.suffix} />
              </div>
              <p className="text-text-muted text-xs font-mono uppercase tracking-wider">{kpi.label}</p>
            </SpotlightCard>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-14">
          {/* Bar Chart - Movies by Year */}
          <SpotlightCard className="bg-bg-card border border-border-subtle p-6 lg:p-8">
            <h3 className="font-playfair text-lg text-text-primary mb-5">Movies by Year</h3>
            <div className="h-[280px]">
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
          </SpotlightCard>

          {/* Donut Chart - Genre Distribution */}
          <SpotlightCard className="bg-bg-card border border-border-subtle p-6 lg:p-8">
            <h3 className="font-playfair text-lg text-text-primary mb-5">Genre Distribution</h3>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.genreData.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {stats.genreData.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(232,184,75,0.2)', borderRadius: '12px', color: '#F0EDE8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {stats.genreData.slice(0, 6).map((g, i) => (
                <span key={g.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  {g.name}
                </span>
              ))}
            </div>
          </SpotlightCard>

          {/* Rating Distribution */}
          <SpotlightCard className="bg-bg-card border border-border-subtle p-6 lg:p-8">
            <h3 className="font-playfair text-lg text-text-primary mb-5">Rating Distribution</h3>
            <div className="space-y-4">
              {stats.ratingBuckets.map((b) => (
                <div key={b.range} className="flex items-center gap-4">
                  <span className="text-text-secondary text-sm w-12 shrink-0 font-medium">{b.range}</span>
                  <div className="flex-1 h-7 bg-bg-primary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${totalCount > 0 ? (b.count / totalCount) * 100 : 0}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-accent-gold to-accent-gold-dim rounded-full"
                    />
                  </div>
                  <span className="text-accent-gold font-mono text-xs w-10 text-right shrink-0 font-bold">{b.count}</span>
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Genre bar chart */}
          <SpotlightCard className="bg-bg-card border border-border-subtle p-6 lg:p-8">
            <h3 className="font-playfair text-lg text-text-primary mb-5">Top Genres</h3>
            <div className="space-y-4">
              {stats.genreData.slice(0, 8).map((g) => {
                const maxVal = stats.genreData[0]?.value || 1
                return (
                  <div key={g.name} className="flex items-center gap-4">
                    <span className="text-text-secondary text-sm w-20 shrink-0 truncate font-medium">{g.name}</span>
                    <div className="flex-1 h-6 bg-bg-primary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(g.value / maxVal) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-accent-gold to-accent-gold-dim rounded-full"
                      />
                    </div>
                    <span className="text-accent-gold font-mono text-xs w-10 text-right shrink-0 font-bold">{g.value}</span>
                  </div>
                )
              })}
            </div>
          </SpotlightCard>
        </div>

        <CinematicDivider className="mb-14" />

        {/* Directors Table */}
        <SpotlightCard className="bg-bg-card border border-border-subtle p-6 lg:p-8 mb-14">
          <h3 className="font-playfair text-lg text-text-primary mb-8">Top Directors</h3>
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
                {stats.directors.map((d, i) => {
                  const maxCount = stats.directors[0]?.count || 1
                  return (
                    <tr
                      key={d.name}
                      className="border-b border-border-subtle/50 hover:bg-bg-elevated transition-colors group"
                    >
                      <td className="py-4 px-3 text-accent-gold font-mono font-bold">{i + 1}</td>
                      <td className="py-4 px-3 text-text-primary font-medium">{d.name}</td>
                      <td className="py-4 px-3 text-text-secondary">{d.count}</td>
                      <td className="py-4 px-3">
                        {d.avgRating > 0 ? <RatingBadge rating={d.avgRating} /> : <span className="text-text-muted">—</span>}
                      </td>
                      <td className="py-4 px-3 hidden sm:table-cell">
                        <div className="w-full max-w-[200px] h-2.5 bg-bg-primary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-gold rounded-full transition-all"
                            style={{ width: `${(d.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      </div>
    </div>
  )
}
