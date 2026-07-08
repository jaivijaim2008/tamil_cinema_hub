'use client'

import Link from 'next/link'
import { Film, ArrowUp } from 'lucide-react'

const EXPLORE_LINKS = [
  { label: 'All Movies', href: '/movies' },
  { label: 'Reviews', href: '/blogs' },
  { label: 'Analytics', href: '/analytics' },
]

const GENRE_LINKS = [
  { label: 'Action', href: '/movies?genre=Action' },
  { label: 'Drama', href: '/movies?genre=Drama' },
  { label: 'Comedy', href: '/movies?genre=Comedy' },
  { label: 'Thriller', href: '/movies?genre=Thriller' },
  { label: 'Romance', href: '/movies?genre=Romance' },
]

const INFO_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
]

function openCookieSettings() {
  window.dispatchEvent(new Event('withdraw-consent'))
}

export default function Footer() {
  const year = new Date().getFullYear()

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-bg-secondary border-t border-border">
      {/* Gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-accent-gold flex items-center justify-center group-hover:bg-accent-gold-dim transition-all duration-300">
                <Film size={16} className="text-text-inverse" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-text-primary tracking-tight">
                Tamil<span className="text-accent-gold">Cinema</span>Hub
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs mb-6">
              A high-fidelity archive of Tamil films. Discover, explore, and rediscover the
              magic of Kollywood cinema.
            </p>
            {/* Back to top */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-accent-gold transition-colors font-medium group"
            >
              <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
              Back to top
            </button>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <FooterHeading>Explore</FooterHeading>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div className="md:col-span-3">
            <FooterHeading>Popular Genres</FooterHeading>
            <ul className="space-y-3">
              {GENRE_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="md:col-span-3">
            <FooterHeading>Info</FooterHeading>
            <ul className="space-y-3">
              {INFO_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
              <li>
                <button
                  onClick={openCookieSettings}
                  className="text-sm text-text-secondary hover:text-accent-gold transition-colors duration-200"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            © {year} TamilCinemaHub. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Made with ❤️ for Tamil cinema lovers
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
      {children}
    </h4>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-text-secondary hover:text-accent-gold transition-colors duration-200"
      >
        {children}
      </Link>
    </li>
  )
}
