import Link from 'next/link'

const EXPLORE_LINKS = [
  { label: 'Home',            href: '/'       },
  { label: 'Movies',          href: '/movies' },
  { label: 'Blogs',           href: '/blogs'  },
]

const LEGAL_LINKS = [
  { label: 'About Us',       href: '/about'          },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Contact',        href: '/contact'        },
]

export default function Footer() {
  return (
    <footer className="bg-[#111111]" style={{ borderTop: '3px solid #D4291A' }}>
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-baseline gap-0.5">
              <span className="text-[#D4291A] text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>Tamil</span>
              <span className="text-white text-lg font-bold" style={{ fontFamily: "'Fraunces', serif" }}>CinemaHub</span>
            </Link>
            <p className="text-[14px] text-[#888] max-w-[220px] leading-relaxed">
              Made with ❤️ for Tamil cinema fans
            </p>
            <div className="flex gap-4">
              {['X', 'IG', 'YT'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[#888] hover:text-white hover:bg-white/10 transition-colors duration-200 text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#555] mb-5">Explore</p>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info & Legal */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#555] mb-5">Info & Legal</p>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderTop: '1px solid #222' }}>
          <p className="text-[#555]">&copy; {new Date().getFullYear()} TamilCinemaHub. All rights reserved.</p>
          <p className="text-[#555]">Built for Kollywood fans</p>
        </div>
      </div>
    </footer>
  )
}
