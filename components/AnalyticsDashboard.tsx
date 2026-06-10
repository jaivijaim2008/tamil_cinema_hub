'use client'

import { useState, useEffect } from 'react'
import LinkNext from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend
} from 'recharts'
import {
  TrendingUp, Film, Star, Monitor, Users, Calendar,
  ChevronLeft, BarChart3, PieChart as PieIcon, Activity
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  total: number
  years: { year: number; count: number }[]
  genres: { genre: string; count: number }[]
  ratingBuckets: number[]
  ottPlatforms: { name: string; count: number }[]
  topDirectors: { name: string; count: number }[]
  avgRating: string
  minYear: number
  maxYear: number
  totalRated: number
}

// ─── Palettes ─────────────────────────────────────────────────────────────────
const THEME = {
  primary: '#D4291A', // Crimson
  secondary: '#7C3AED', // Violet
  accent: '#F0B429', // Gold
  teal: '#0D9488',
  rose: '#F43F5E',
  ink: '#0A0008',
  fog: '#F1F0FF',
}

const COLORS = [THEME.primary, THEME.secondary, THEME.accent, THEME.teal, THEME.rose, '#3B82F6', '#84CC16', '#FF6B35', '#A78BFA', '#2DD4BF']

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent']
const RATING_COLORS = ['#555555', '#D4291A', '#FF4D1C', '#FF8C00', '#F0B429']

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#12000a] border border-white/10 p-3 rounded-lg shadow-2xl backdrop-blur-xl">
        <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-white">
          {payload[0].value} <span className="text-white/40 font-medium">films</span>
        </p>
      </div>
    )
  }
  return null
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard({ stats }: { stats: Stats }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Prepare data for charts
  const ratingData = stats.ratingBuckets.map((count, i) => ({
    name: RATING_LABELS[i],
    count: count,
    fill: RATING_COLORS[i]
  }))

  const ottData = stats.ottPlatforms.slice(0, 6).map((ott, i) => ({
    name: ott.name,
    value: ott.count,
    fill: COLORS[i % COLORS.length]
  }))

  const genreData = stats.genres.slice(0, 8).map((g) => ({
    subject: g.genre,
    A: g.count,
    fullMark: Math.max(...stats.genres.map(g => g.count))
  }))

  const directorData = [...stats.topDirectors].slice(0, 8).reverse()

  return (
    <div className="min-h-screen bg-[#0A0008] text-[#F1F0FF] font-sans pb-20">
      
      {/* ── HEADER ── */}
      <section className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <LinkNext href="/movies" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors mb-4 group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Database
            </LinkNext>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-crimson to-violet flex items-center justify-center shadow-lg shadow-crimson/20" style={{ background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})` }}>
                <BarChart3 size={20} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Cinema <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${THEME.primary}, ${THEME.accent})` }}>Insights</span>
              </h1>
            </div>
            <p className="text-sm text-white/40 max-w-md">
              A data-driven analysis of <span className="text-white/70 font-bold">{stats.total.toLocaleString()}</span> Tamil movies from {stats.minYear} to {stats.maxYear}.
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <KPIItem icon={<Film size={14} />} label="Total Movies" value={stats.total.toLocaleString()} color="primary" />
            <KPIItem icon={<Star size={14} />} label="Avg Rating" value={stats.avgRating} color="accent" />
            <KPIItem icon={<Activity size={14} />} label="Movies Rated" value={stats.totalRated.toLocaleString()} color="teal" />
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* Row 1: Yearly Trend */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <TrendingUp size={120} />
          </div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-display font-extrabold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <Calendar size={18} style={{ color: THEME.primary }} /> Yearly Release Trends
              </h3>
              <p className="text-xs text-white/30">Growth of Kollywood cinema output (2000–2026)</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.years}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke={THEME.primary} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Genre Distribution */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col">
            <div className="mb-8">
              <h3 className="text-lg font-display font-extrabold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <Users size={18} style={{ color: THEME.secondary }} /> Genre Landscape
              </h3>
              <p className="text-xs text-white/30">Diversity of themes in Tamil cinema</p>
            </div>
            <div className="flex-1 min-h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={genreData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} 
                  />
                  <Radar
                    name="Films"
                    dataKey="A"
                    stroke={THEME.secondary}
                    fill={THEME.secondary}
                    fillOpacity={0.4}
                    animationDuration={1500}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rating Spread */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col">
            <div className="mb-8">
              <h3 className="text-lg font-display font-extrabold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <Star size={18} style={{ color: THEME.accent }} /> Quality Analysis
              </h3>
              <p className="text-xs text-white/30">Spread of audience and critic ratings</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1800}>
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3: Platform Share & Top Directors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* OTT Share */}
          <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-display font-extrabold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <Monitor size={18} style={{ color: THEME.teal }} /> Platform Share
              </h3>
              <p className="text-xs text-white/30">OTT digital distribution</p>
            </div>
            <div className="flex-1 min-h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ottData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {ottData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Digital</span>
                <span className="text-xl font-display font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>OTT</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {ottData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-[10px] font-bold text-white/40 truncate uppercase tracking-tighter">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Directors */}
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-display font-extrabold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <Users size={18} style={{ color: THEME.rose }} /> Top Directors
              </h3>
              <p className="text-xs text-white/30">Filmmakers with most catalogued titles</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={directorData} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700 }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18} animationDuration={2000}>
                    {directorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? THEME.rose : THEME.rose + '88'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

function KPIItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: keyof typeof THEME }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 bg-white/[0.03] border border-white/5 px-4 py-3 rounded-2xl hover:bg-white/[0.06] transition-colors cursor-default">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: THEME[color] + '22', color: THEME[color] }}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-lg font-display font-extrabold text-white leading-none" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
      </div>
    </div>
  )
}
