import Link from 'next/link'

const EXPLORE_LINKS = [
  { label: 'Home',            href: '/'       },
  { label: 'Movies',          href: '/movies' },
  { label: 'Blogs & Reviews', href: '/blogs'  },
]

const LEGAL_LINKS = [
  { label: 'About Us',       href: '/about'          },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Contact',        href: '/contact'        },
]

export default function Footer() {
  return (
    <footer
      style={{
        background: 'rgba(0,0,0,0.4)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)' }}
              >
                🎬
              </div>
              <span
                className="text-lg font-black text-white tracking-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Tamil<span style={{ color: '#a78bfa' }}>Cinema</span>
                <span
                  className="ml-1 rounded-md px-1.5 py-0.5 text-xs font-black"
                  style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}
                >
                  HUB
                </span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              The ultimate Tamil cinema database. Discover movies, read reviews,
              and get AI-powered recommendations — all in one place.
            </p>

            {/* Mini stats */}
            <div className="flex gap-6">
              {[
                { value: '1,600+',    label: 'Movies'  },
                { value: '2000–2026', label: 'Years'   },
                { value: 'AI',        label: 'Chatbot' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-sm font-black text-white">{s.value}</p>
                  <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style={{ color: '#a78bfa' }}>
              Explore
            </p>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-medium hover:text-white transition-colors"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style={{ color: '#fb923c' }}>
              Info & Legal
            </p>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-medium hover:text-white transition-colors"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mt-12 mb-6 h-px"
          style={{ background: 'linear-gradient(to right, rgba(124,58,237,0.3), transparent)' }}
        />

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <p>&copy; {new Date().getFullYear()} TamilCinemaHub. All rights reserved.</p>
          <p>Built with Next.js · Sanity CMS · Python AI</p>
        </div>

      </div>
    </footer>
  )
}