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

const sampleMovies = [
  'Vikram', 'Ponniyin Selvan', 'Jailer', 'Leo', 'Varisu',
  'Thunivu', 'Ponniyin Selvan II', 'Maamannan', 'Por Thozhil', 'Mark Antony',
  'Indian 2', 'Bade Miyan Chote Miyan', 'Aranmanai 4', 'Raayan', 'Viduthalai Part 2',
]

export default function Footer() {
  return (
    <footer className="hidden lg:block bg-bg-secondary">
      {/* Film strip ticker */}
      <div className="w-full overflow-hidden border-y border-border-subtle py-3 bg-bg-secondary">
        <div className="flex gap-8 animate-filmroll whitespace-nowrap" style={{ width: '200%' }}>
          {[...sampleMovies, ...sampleMovies].map((m, i) => (
            <span key={i} className="text-text-muted font-mono text-xs tracking-widest uppercase shrink-0">
              {m} · {2020 + (i % 6)}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
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
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-text-primary font-semibold text-sm uppercase tracking-wider mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-secondary text-sm hover:text-accent-gold transition-colors"
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
        <div className="mt-16 pt-6 border-t border-border-subtle flex items-center justify-between">
          <p className="text-text-muted text-xs">&copy; 2024 TamilCinemaHub. All rights reserved.</p>
          <p className="text-text-muted text-xs">Built with Next.js &amp; Sanity</p>
        </div>
      </div>
    </footer>
  )
}
