'use client'

import Link from 'next/link'

const footerLinks = {
  Explore: [
    { label: 'Movies', href: '/movies' },
    { label: 'Reviews', href: '/blogs' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Recommendations', href: '/recommendations' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ],
  Community: [
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'Twitter', href: 'https://twitter.com' },
  ],
}

export default function Footer() {
  return (
    <footer className="hidden lg:block bg-bg-secondary border-t border-border-subtle">
      {/* Film strip ticker */}
      <div className="w-full overflow-hidden py-3 bg-bg-secondary border-b border-border-subtle">
        <div className="flex gap-8 animate-filmroll whitespace-nowrap" style={{ width: '200%' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="text-text-muted font-mono text-xs tracking-widest uppercase shrink-0">
              {i % 2 === 0 ? '◆' : '·'} TamilCinemaHub
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="text-xl font-bold">
              <span className="text-gradient-gold">Tamil</span>
              <span className="text-text-primary">CinemaHub</span>
            </Link>
            <p className="mt-4 text-text-secondary text-sm leading-relaxed">
              The definitive archive of Tamil cinema. Discover, explore, and rediscover Kollywood.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span className="text-accent-emerald text-xs font-medium">Database Active</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-text-primary font-semibold text-sm uppercase tracking-wider mb-5">{title}</h4>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-secondary text-sm hover:text-accent-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-16 pt-8 border-t border-border-subtle flex items-center justify-between">
          <p className="text-text-muted text-xs">&copy; {new Date().getFullYear()} TamilCinemaHub. All rights reserved.</p>
          <p className="text-text-muted text-xs">Built with Next.js &amp; Sanity</p>
        </div>
      </div>
    </footer>
  )
}
