'use client'

import Link from 'next/link'
import { Film } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-gold flex items-center justify-center">
                <Film size={16} className="text-text-inverse" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-text-primary tracking-tight">
                Tamil<span className="text-accent-gold">Cinema</span>Hub
              </span>
            </Link>
            <p className="text-xs text-text-muted leading-relaxed">
              A high-fidelity archive of Tamil films. Discover, explore, and rediscover Kollywood.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-4">Explore</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/movies">All Movies</FooterLink>
              <FooterLink href="/blogs">Reviews</FooterLink>
              <FooterLink href="/analytics">Analytics</FooterLink>
              <FooterLink href="/recommendations">Recommendations</FooterLink>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-4">Genres</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/movies?genre=Action">Action</FooterLink>
              <FooterLink href="/movies?genre=Drama">Drama</FooterLink>
              <FooterLink href="/movies?genre=Comedy">Comedy</FooterLink>
              <FooterLink href="/movies?genre=Thriller">Thriller</FooterLink>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-4">Info</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">© {year} TamilCinemaHub. All rights reserved.</p>
          <p className="text-xs text-text-muted">Made for Tamil cinema lovers</p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
        {children}
      </Link>
    </li>
  )
}
