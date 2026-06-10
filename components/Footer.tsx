'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Film, Globe, Mail, Sparkles, MoveUpRight } from 'lucide-react'

export default function Footer() {
  const [year, setYear] = useState<number | string>(2026)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="bg-ink border-t border-white/5 pt-32 pb-16">
      <div className="main-container">
        <div className="flex flex-col lg:flex-row justify-between gap-24 mb-32">
          
          {/* Brand & Manifesto */}
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
              <div className="w-10 h-10 rounded-[1.25rem] bg-white text-black flex items-center justify-center group-hover:bg-crimson group-hover:text-white transition-all duration-500">
                <Film size={20} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-display font-black uppercase tracking-tighter text-white">
                TamilCinema<span className="text-white/20 group-hover:text-crimson transition-colors duration-500">Hub.</span>
              </span>
            </Link>
            <p className="text-xl text-white/30 font-medium leading-relaxed uppercase tracking-tight">
               Documenting the historical and contemporary velocity of Kollywood with technical rigor and aesthetic excellence.
            </p>
          </div>

          {/* Clean Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-32">
             <div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 mb-8">Navigation</p>
                <ul className="space-y-4">
                   <FooterLink href="/movies">Database</FooterLink>
                   <FooterLink href="/blogs">Editorial</FooterLink>
                   <FooterLink href="/analytics">Insights</FooterLink>
                   <FooterLink href="/recommendations">Smart Match</FooterLink>
                </ul>
             </div>
             <div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 mb-8">Corporate</p>
                <ul className="space-y-4">
                   <FooterLink href="/about">Mission</FooterLink>
                   <FooterLink href="/contact">Personnel</FooterLink>
                   <FooterLink href="/privacy-policy">Privacy</FooterLink>
                </ul>
             </div>
             <div className="col-span-2 md:col-span-1">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 mb-8">Connect</p>
                <a href="mailto:hq@tamilcinemahub.xyz" className="group flex items-center gap-2 text-sm font-black text-white hover:text-crimson transition-all">
                   hq@tamilcinemahub.xyz <MoveUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
             </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-white/5">
           <div className="flex items-center gap-6">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10">© {year} ARCHIVE</span>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-crimson animate-pulse">
                 <span className="w-1 h-1 rounded-full bg-crimson" /> Systems Online
              </div>
           </div>
           <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10">
              Developed for Excellence in Tamil Nadu
           </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all block">
        {children}
      </Link>
    </li>
  )
}
