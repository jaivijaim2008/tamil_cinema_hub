import Link from 'next/link'

export const metadata = {
  title: 'About Us — TamilCinemaHub',
  description: 'Learn about TamilCinemaHub, our mission to celebrate Tamil cinema, and the AI-powered tools we built for movie lovers.',
  openGraph: {
    title: 'About Us — TamilCinemaHub',
    description: 'Learn about TamilCinemaHub, our mission to celebrate Tamil cinema, and the AI-powered tools we built for movie lovers.',
    type: 'website',
    url: 'https://tamilcinemahub.xyz/about',
    images: [
      {
        url: 'https://tamilcinemahub.xyz/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'About TamilCinemaHub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'About Us — TamilCinemaHub',
    description: 'Learn about TamilCinemaHub, our mission to celebrate Tamil cinema, and the AI-powered tools we built for movie lovers.',
    images: ['https://tamilcinemahub.xyz/opengraph-image'],
  },
  alternates: {
    canonical: 'https://tamilcinemahub.xyz/about',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen" style={{ background: '#F7F7F5' }}>
      {/* ── Hero ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E7E3' }}>
        <div className="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#D4291A' }}>
            About Us
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}
          >
            Tamil Cinema,<br />One Hub.
          </h1>
          <p className="text-lg leading-relaxed max-w-xl mx-auto" style={{ color: '#666666' }}>
            A passion project built for Tamil movie lovers — curated reviews, deep catalogues, and an AI companion that actually knows Kollywood.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-16">

        {/* Mission */}
        <section className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#D4291A' }}>
              Our Mission
            </p>
            <h2 className="text-2xl font-bold leading-tight" style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}>Why we built this</h2>
          </div>
          <div className="space-y-4 text-[17px] leading-[1.8]" style={{ color: '#444444' }}>
            <p>
              Most movie databases treat Tamil cinema as an afterthought — a footnote in a sea of Hollywood content. We think that&apos;s wrong. Kollywood has produced some of the most inventive, emotionally powerful films in the world, and it deserves a home built specifically for it.
            </p>
            <p>
              TamilCinemaHub is that home. A hand-curated catalogue spanning 2000–2026, honest reviews, and an AI chatbot that can discuss plot arcs, recommend hidden gems, and debate director filmographies — without needing a Google search in between.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: '#E8E7E3' }} />

        {/* Tech */}
        <section className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#D4291A' }}>
              Under the Hood
            </p>
            <h2 className="text-2xl font-bold leading-tight" style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}>How it works</h2>
          </div>
          <div className="space-y-4 text-[17px] leading-[1.8]" style={{ color: '#444444' }}>
            <p>
              The site is built on Next.js with content managed through Sanity CMS, giving editors a fast and flexible workflow. The recommendation engine uses TF-IDF vectorisation and cosine similarity to surface genuinely related titles — not just movies from the same year.
            </p>
            <p>
              The AI chatbot is powered by a large language model fine-tuned on Tamil cinema context, so it can discuss cast, crew, OTT availability, ratings, and plot details fluently — in plain English.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: '#E8E7E3' }} />

        {/* Ads / Operations */}
        <section className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#D4291A' }}>
              Operations
            </p>
            <h2 className="text-2xl font-bold leading-tight" style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}>Keeping the lights on</h2>
          </div>
          <div className="space-y-4 text-[17px] leading-[1.8]" style={{ color: '#444444' }}>
            <p>
              To keep the servers running and fund continued development, we display non-intrusive Google AdSense advertisements. We comply fully with all relevant privacy regulations and are committed to a clean, family-safe browsing experience.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: '#E8E7E3' }} />

        {/* CTA */}
        <section className="text-center space-y-4">
          <p className="text-sm" style={{ color: '#888888' }}>Have feedback, suggestions, or just want to talk movies?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md px-7 py-3 text-sm font-semibold text-white transition-all hover:translate-y-[-1px]"
            style={{ background: '#D4291A' }}
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
