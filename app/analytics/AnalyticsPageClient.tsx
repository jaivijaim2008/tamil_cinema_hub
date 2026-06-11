'use client'

import { useState, useMemo } from 'react'
import {
  Film, Star, TrendingUp, Users, Calendar,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import type { MovieAnalytics } from '@/lib/types'
import PageHeader from '@/components/ui/PageHeader'

interface Props {
  movies: MovieAnalytics[]
  totalCount: number
}

const PALETTE = ['#E8B84B', '#3b82f6', '#ef4444', '#a855f7', '#06b6d4', '#22c55e', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6']

export default function AnalyticsPageClient({ movies, totalCount }: Props) {
  const [tab, setTab] = useState<'year' | 'genre' | 'rating' | 'directors'>('year')

  const stats = useMemo(() => {
    const yearMap = new Map<number, number>()
    const genreMap = new Map<string, number>()
    const directorMap = new Map<string, number>()
    const ratingBuckets = [0, 0, 0, 0, 0] // 0-2, 2-3, 3-4, 4-4.5, 4.5-5
    let ratingSum = 0
    let ratedCount = 0

    for (const m of movies) {
      yearMap.set(m.year, (yearMap.get(m.year) || 0) + 1)
      m.genre?.forEach((g) => genreMap.set(g, (genreMap.get(g) || 0) + 1))
      if (m.director) directorMap.set(m.director, (directorMap.get(m.director) || 0) + 1)
      if (m.rating != null) {
        ratingSum += m.rating
        ratedCount++
        if (m.rating < 2) ratingBuckets[0]++
        else if (m.rating < 3) ratingBuckets[1]++
        else if (m.rating < 4) ratingBuckets[2]++
        else if (m.rating < 4.5) ratingBuckets[3]++
        else ratingBuckets[4]++
      }
    }

    const yearData = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year)

    const genreData = Array.from(genreMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)

    const topDirectors = Array.from(directorMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)

    const ratingData = [
      { label: 'Poor (0-2)', count: ratingBuckets[0], fill: '#ef4444' },
      { label: 'Fair (2-3)', count: ratingBuckets[1], fill: '#f97316' },
      { label: 'Good (3-4)', count: ratingBuckets[2], fill: '#eab308' },
      { label: 'Great (4-4.5)', count: ratingBuckets[3], fill: '#22c55e' },
      { label: 'Excellent (4.5+)', count: ratingBuckets[4], fill: '#E8B84B' },
    ]

    return {
      yearData,
      genreData: genreData.slice(0, 10),
      topDirectors,
      ratingData,
      avgRating: ratedCount > 0 ? (ratingSum / ratedCount).toFixed(1) : '0',
      ratedCount,
      minYear: yearData.length > 0 ? yearData[0].year : 0,
      maxYear: yearData.length > 0 ? yearData[yearData.length - 1].year : 0,
    }
  }, [movies])

  const tabs = [
    { key: 'year' as const, label: 'By Year', icon: Calendar },
    { key: 'genre' as const, label: 'By Genre', icon: Film },
    { key: 'rating' as const, label: 'By Rating', icon: Star },
    { key: 'directors' as const, label: 'Directors', icon: Users },
  ]

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          label="Analytics"
          title="Cinema Insights"
          description={`Data from ${totalCount.toLocaleString()} Tamil movies`}
        />

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <KPICard icon={<Film size={16} />} label="Total Movies" value={totalCount.toLocaleString()} />
          <KPICard icon={<Star size={16} />} label="Avg Rating" value={stats.avgRating} />
          <KPICard icon={<TrendingUp size={16} />} label="Year Range" value={`${stats.minYear}–${stats.maxYear}`} />
          <KPICard icon={<Users size={16} />} label="Directors" value={stats.topDirectors.length.toLocaleString()} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-bg-card rounded-xl p-1 border border-border overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'bg-accent-gold text-text-inverse'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="bg-bg-card border border-border rounded-2xl p-4 md:p-6 min-h-[400px]">
          {tab === 'year' && (
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-4">Movies by Year</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.yearData}>
                    <defs>
                      <linearGradient id="yearGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E8B84B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E8B84B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#161616', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#999' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#E8B84B" strokeWidth={2} fill="url(#yearGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === 'genre' && (
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-4">Genre Distribution</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.genreData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="genre" tick={{ fill: '#ccc', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#161616', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                      {stats.genreData.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === 'rating' && (
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-4">Rating Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.ratingData}>
                      <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#161616', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                        {stats.ratingData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center gap-3">
                  {stats.ratingData.map((r) => (
                    <div key={r.label} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.fill }} />
                      <span className="text-sm text-text-secondary flex-1">{r.label}</span>
                      <span className="text-sm font-bold text-text-primary">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'directors' && (
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-4">Top Directors</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topDirectors.slice(0, 10).reverse()} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#ccc', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#161616', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16} fill="#E8B84B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KPICard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-accent-gold">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</span>
      </div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
    </div>
  )
}
