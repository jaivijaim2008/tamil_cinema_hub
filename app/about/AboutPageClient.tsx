'use client'

import Link from 'next/link'
import { Film, Code, Database, Globe, ArrowRight, Star, Users } from 'lucide-react'
import AdSenseBanner from '@/components/ui/AdSenseBanner'

interface Props {
  totalCount: number
  directorCount: number
}

export default function AboutPageClient({ totalCount, directorCount }: Props) {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent-gold mb-3 block">About</span>
          <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
            The Tamil Cinema Archive
          </h1>
          <p className="text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
            TamilCinemaHub is a curated digital archive dedicated to documenting and celebrating
            the rich history of Tamil cinema — from the golden era to modern blockbusters.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          <div className="bg-bg-card border border-border rounded-xl p-6 text-center">
            <Film size={24} className="text-accent-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">{totalCount.toLocaleString()}</p>
            <p className="text-xs text-text-muted mt-1">Movies Catalogued</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-6 text-center">
            <Users size={24} className="text-accent-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">{directorCount.toLocaleString()}</p>
            <p className="text-xs text-text-muted mt-1">Directors</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-6 text-center">
            <Star size={24} className="text-accent-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">6+</p>
            <p className="text-xs text-text-muted mt-1">Genres Covered</p>
          </div>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-text-primary mb-4">Our Mission</h2>
          <div className="bg-bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              Tamil cinema has a legacy spanning over a century, producing some of the most influential
              films in Indian cinema. From the pioneering works of silent era to the technically advanced
              productions of today, Kollywood has consistently pushed creative boundaries.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              TamilCinemaHub aims to be the definitive digital archive for Tamil films — providing
              comprehensive metadata, thoughtful reviews, and data-driven insights into the patterns
              and trends that shape this vibrant industry.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Whether you&apos;re a casual viewer looking for your next watch or a cinema enthusiast
              researching the evolution of Tamil filmmaking, our archive has something for you.
            </p>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-text-primary mb-4">Built With</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TechItem icon={<Code size={18} />} name="Next.js" desc="React framework with App Router" />
            <TechItem icon={<Database size={18} />} name="Sanity CMS" desc="Headless content management" />
            <TechItem icon={<Globe size={18} />} name="Tailwind CSS" desc="Utility-first styling" />
            <TechItem icon={<Star size={18} />} name="Recharts" desc="Interactive data visualization" />
          </div>
        </section>

        {/* AdSense */}
        <div className="mb-16">
          <AdSenseBanner slot="0" format="horizontal" minHeight={100} />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse px-6 py-3 rounded-xl text-sm font-semibold hover:bg-accent-gold-dim transition-colors"
          >
            Explore the Archive <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function TechItem({ icon, name, desc }: { icon: React.ReactNode; name: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 bg-bg-card border border-border rounded-xl p-4">
      <span className="text-accent-gold">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-text-primary">{name}</p>
        <p className="text-xs text-text-muted">{desc}</p>
      </div>
    </div>
  )
}
