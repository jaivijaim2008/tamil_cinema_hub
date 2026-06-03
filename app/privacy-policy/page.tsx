import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — TamilCinemaHub',
  description: 'Privacy Policy and Terms of Use for TamilCinemaHub. Learn how we handle cookies, data, and Google AdSense advertising.',
}

const sections = [
  {
    id: '1',
    title: 'Log Files',
    body: `TamilCinemaHub follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any personally identifiable information.`,
  },
  {
    id: '2',
    title: 'Cookies and Web Beacons',
    body: `Like any other website, TamilCinemaHub uses "cookies". These cookies are used to store information including visitors' preferences and the pages on the website that the visitor accessed or visited. The information is used to optimise the users' experience by customising our web page content based on visitors' browser type and/or other information.`,
  },
  {
    id: '3',
    title: 'Google DoubleClick DART Cookie & AdSense',
    body: `Google is one of the third-party vendors on our site. It uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. Visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at https://policies.google.com/technologies/ads. These third-party ad servers use technologies like cookies, JavaScript, or Web Beacons that are used in their advertisements and links that appear on TamilCinemaHub, which are sent directly to users' browsers. They automatically receive your IP address when this occurs.`,
    link: { href: 'https://policies.google.com/technologies/ads', label: 'Google Privacy Policy →' },
  },
  {
    id: '4',
    title: 'Third Party Privacy Policies',
    body: `TamilCinemaHub's Privacy Policy does not apply to other advertisers or websites. We advise you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt out of certain options.`,
  },
  {
    id: '5',
    title: 'Consent',
    body: `By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.`,
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: '#07070f', fontFamily: "'Outfit', sans-serif" }}
    >
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.13) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '180px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-12">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest mb-5"
            style={{
              background: 'rgba(59,130,246,0.12)',
              color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.25)',
            }}
          >
            🔒 Legal
          </span>

          <h1
            className="text-4xl sm:text-5xl font-black leading-[1.05] tracking-tight text-white"
          >
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-white/35">
            Last Updated: May 31, 2026
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-24">

        {/* Divider */}
        <div
          className="mb-12 h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.4), transparent)' }}
        />

        {/* Intro */}
        <p className="mb-12 text-[17px] leading-[1.85] text-white/55">
          Welcome to <span className="text-white font-semibold">TamilCinemaHub</span>. One of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information we collect and how we use it.
        </p>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-start gap-4">
                {/* number badge */}
                <span
                  className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black"
                  style={{
                    background: 'rgba(59,130,246,0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59,130,246,0.25)',
                  }}
                >
                  {s.id}
                </span>
                <div>
                  <h2 className="text-lg font-black text-white mb-3">{s.title}</h2>
                  <p className="text-[15px] leading-[1.8] text-white/55">{s.body}</p>
                  {s.link && (
                    <a
                      href={s.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70"
                      style={{ color: '#60a5fa' }}
                    >
                      {s.link.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-12 text-sm text-white/30 text-center">
          Questions about this policy?{' '}
          <Link href="/contact" className="text-white/60 underline underline-offset-2 hover:text-white transition-colors">
            Contact us
          </Link>
          .
        </p>
      </div>
    </main>
  )
}