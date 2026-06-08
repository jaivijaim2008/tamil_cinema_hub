import Link from 'next/link'

export const metadata = {
  title: 'About Us — TamilCinemaHub',
  description: 'Learn about TamilCinemaHub, our mission to celebrate Tamil cinema, and the AI-powered tools we built for movie lovers.',
  openGraph: {
    title: 'About Us — TamilCinemaHub',
    description: 'Learn about TamilCinemaHub, our mission to celebrate Tamil cinema, and the AI-powered tools we built for movie lovers.',
    type: 'website',
    url: 'https://tamilcinemahub.xyz/about',
    images: [{ url: 'https://tamilcinemahub.xyz/opengraph-image', width: 1200, height: 630, alt: 'About TamilCinemaHub' }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'About Us — TamilCinemaHub',
    description: 'Learn about TamilCinemaHub, our mission to celebrate Tamil cinema, and the AI-powered tools we built for movie lovers.',
    images: ['https://tamilcinemahub.xyz/opengraph-image'],
  },
  alternates: { canonical: 'https://tamilcinemahub.xyz/about' },
}

export default function AboutPage() {
  return (
    <main style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 0 48px' }}>
        <div style={{ maxWidth: 768, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>
            About Us
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, color: 'rgba(255,255,255,0.92)' }}>
            Tamil Cinema,<br />One Hub.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 520, margin: '0 auto', color: 'rgba(255,255,255,0.4)' }}>
            A passion project built for Tamil movie lovers — curated reviews, deep catalogues, and an AI companion that actually knows Kollywood.
          </p>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: 768, margin: '0 auto', padding: '64px 24px', display: 'flex', flexDirection: 'column', gap: 64 }}>
        {/* Mission */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>Our Mission</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, lineHeight: 1.2, color: 'rgba(255,255,255,0.92)' }}>Why we built this</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 17, lineHeight: 1.8, color: 'rgba(255,255,255,0.5)' }}>
            <p>
              Most movie databases treat Tamil cinema as an afterthought — a footnote in a sea of Hollywood content. We think that&apos;s wrong. Kollywood has produced some of the most inventive, emotionally powerful films in the world, and it deserves a home built specifically for it.
            </p>
            <p>
              TamilCinemaHub is that home. A hand-curated catalogue spanning 2000–2026, honest reviews, and an AI chatbot that can discuss plot arcs, recommend hidden gems, and debate director filmographies — without needing a Google search in between.
            </p>
          </div>
        </section>

        <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.06)' }} />

        {/* Tech */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>Under the Hood</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, lineHeight: 1.2, color: 'rgba(255,255,255,0.92)' }}>How it works</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 17, lineHeight: 1.8, color: 'rgba(255,255,255,0.5)' }}>
            <p>
              The site is built on Next.js with content managed through Sanity CMS, giving editors a fast and flexible workflow. The recommendation engine uses TF-IDF vectorisation and cosine similarity to surface genuinely related titles — not just movies from the same year.
            </p>
            <p>
              The AI chatbot is powered by a large language model fine-tuned on Tamil cinema context, so it can discuss cast, crew, OTT availability, ratings, and plot details fluently — in plain English.
            </p>
          </div>
        </section>

        <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.06)' }} />

        {/* Operations */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>Operations</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, lineHeight: 1.2, color: 'rgba(255,255,255,0.92)' }}>Keeping the lights on</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 17, lineHeight: 1.8, color: 'rgba(255,255,255,0.5)' }}>
            <p>
              To keep the servers running and fund continued development, we display non-intrusive Google AdSense advertisements. We comply fully with all relevant privacy regulations and are committed to a clean, family-safe browsing experience.
            </p>
          </div>
        </section>

        <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.06)' }} />

        {/* CTA */}
        <section style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>Have feedback, suggestions, or just want to talk movies?</p>
          <Link
            href="/contact"
            className="btn-hero-primary"
          >
            Get in Touch →
          </Link>
        </section>
      </div>
    </main>
  )
}
