'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Film, Globe, Mail, Sparkles, Send, Info } from 'lucide-react'

export default function Footer() {
  const [year, setYear] = useState<number | string>(2026)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="bg-ink pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none opacity-5">
         <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-crimson rounded-full blur-[100px]" />
      </div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* Brand Col */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-crimson/50 transition-colors">
                <Film size={20} className="text-white group-hover:text-crimson transition-colors" />
              </div>
              <span className="text-xl font-display font-black text-white uppercase tracking-tighter">
                TamilCinema<span className="text-crimson">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-white/30 font-medium leading-relaxed mb-10 max-w-xs">
              The definitive digital archive of Tamil cinema. Deep dives, real-time analytics, and AI-driven discovery for the next generation of cinephiles.
            </p>
            <div className="flex items-center gap-4">
               <SocialLink icon={<Globe size={16} />} href="#" />
               <SocialLink icon={<Send size={16} />} href="#" />
               <SocialLink icon={<Info size={16} />} href="#" />
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">Navigation</h4>
            <ul className="space-y-4">
              <FooterLink href="/movies">Movie Archive</FooterLink>
              <FooterLink href="/blogs">Editorial Review</FooterLink>
              <FooterLink href="/analytics">Data Insights</FooterLink>
              <FooterLink href="/recommendations">Smart Discover</FooterLink>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">Community</h4>
            <ul className="space-y-4">
              <FooterLink href="/about">Our Mission</FooterLink>
              <FooterLink href="/contact">Contact Personnel</FooterLink>
              <FooterLink href="/privacy-policy">Privacy Protocol</FooterLink>
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-crimson hover:text-white transition-colors"
                >
                  <Sparkles size={12} /> Ask Kollywood AI
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">Direct Channel</h4>
            <div className="p-6 rounded-[2rem] glass border-white/10">
               <p className="text-[10px] font-bold text-white/40 uppercase mb-4 tracking-widest">General Inquiries</p>
               <a href="mailto:hq@tamilcinemahub.xyz" className="text-sm font-black text-white hover:text-crimson transition-colors flex items-center gap-2">
                 <Mail size={14} className="text-crimson" /> hq@tamilcinemahub.xyz
               </a>
            </div>
          </div>

        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10">
             © {year} TamilCinemaHub — Developed for Excellence
           </div>
           <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/10">
             Coded with <span className="text-crimson">❤</span> in Tamil Nadu
           </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a href={href} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 transition-all">
      {icon}
    </a>
  )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-xs font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
        {children}
      </Link>
    </li>
  )
}
