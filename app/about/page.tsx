import Link from 'next/link'

export const metadata = {
  title: 'About Us — TamilCinemaHub',
  description: 'Learn about TamilCinemaHub, our mission to celebrate Tamil cinema, and the AI-powered tools we built for movie lovers.',
}

export default function AboutPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: '#07070f', fontFamily: "'Outfit', sans-serif" }}
    >
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        {/* bg glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(168,85,247,0.18) 0%, transparent 70%)',
          }}
        />
        {/* film grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '180px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-16 text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest mb-5"
            style={{
              background: 'rgba(168,85,247,0.12)',
              color: '#c084fc',
              border: '1px solid rgba(168,85,247,0.25)',
            }}
          >
            🎬 About Us
          </span>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff 30%, #a78bfa 70%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Tamil Cinema,<br />One Hub.
          </h1>

          <p className="mt-6 text-lg text-white/50 leading-relaxed max-w-xl mx-auto">
            A passion project built for Tamil movie lovers — curated reviews, deep catalogues, and an AI companion that actually knows Kollywood.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-24 space-y-16">

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.4), transparent)' }}
        />

        {/* Mission */}
        <section className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: '#a855f7' }}
            >
              Our Mission
            </p>
            <h2 className="text-2xl font-black text-white leading-tight">Why we built this</h2>
          </div>
          <div className="space-y-4 text-[17px] leading-[1.8] text-white/60">
            <p>
              Most movie databases treat Tamil cinema as an afterthought — a footnote in a sea of Hollywood content. We think that's wrong. Kollywood has produced some of the most inventive, emotionally powerful films in the world, and it deserves a home built specifically for it.
            </p>
            <p>
              TamilCinemaHub is that home. A hand-curated catalogue spanning 2000–2026, honest reviews, and an AI chatbot that can discuss plot arcs, recommend hidden gems, and debate director filmographies — without needing a Google search in between.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }}
        />

        {/* Tech */}
        <section className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: '#fb923c' }}
            >
              Under the Hood
            </p>
            <h2 className="text-2xl font-black text-white leading-tight">How it works</h2>
          </div>
          <div className="space-y-4 text-[17px] leading-[1.8] text-white/60">
            <p>
              The site is built on Next.js with content managed through Sanity CMS, giving editors a fast and flexible workflow. The recommendation engine uses TF-IDF vectorisation and cosine similarity to surface genuinely related titles — not just movies from the same year.
            </p>
            <p>
              The AI chatbot is powered by a large language model fine-tuned on Tamil cinema context, so it can discuss cast, crew, OTT availability, ratings, and plot details fluently — in plain English.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }}
        />

        {/* Ads / Operations */}
        <section className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: '#34d399' }}
            >
              Operations
            </p>
            <h2 className="text-2xl font-black text-white leading-tight">Keeping the lights on</h2>
          </div>
          <div className="space-y-4 text-[17px] leading-[1.8] text-white/60">
            <p>
              To keep the servers running and fund continued development, we display non-intrusive Google AdSense advertisements. We comply fully with all relevant privacy regulations and are committed to a clean, family-safe browsing experience.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }}
        />

        {/* CTA */}
        <section className="text-center space-y-4">
          <p className="text-white/40 text-sm">Have feedback, suggestions, or just want to talk movies?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #ea580c)',
            }}
          >
            Get in Touch
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </div>
    </main>
  )
}