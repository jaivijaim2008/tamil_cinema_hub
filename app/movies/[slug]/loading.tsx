export default function MovieDetailLoading() {
  const shimmer = 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)'
  const shimmerBg = { backgroundImage: shimmer, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--ink)' }} className="animate-pulse">
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {/* Hero header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
          {/* Back link */}
          <div style={{ height: 14, width: 120, borderRadius: 4, marginBottom: 24, ...shimmerBg }} />

          <div className="movie-header-row">
            {/* Poster */}
            <div className="movie-poster-wrap">
              <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '2/3', background: 'rgba(255,255,255,0.04)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', ...shimmerBg }} />
            </div>

            {/* Title & meta */}
            <div className="movie-info-col">
              <div style={{ height: 12, width: 96, borderRadius: 100, marginBottom: 16, ...shimmerBg }} />
              <div style={{ height: 48, width: '70%', borderRadius: 8, marginBottom: 8, ...shimmerBg }} />
              <div style={{ height: 20, width: '40%', borderRadius: 8, marginBottom: 20, ...shimmerBg }} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ height: 32, width: 72, borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body — responsive grid */}
      <div className="movie-detail-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Synopsis */}
          <section>
            <div style={{ height: 12, width: 80, borderRadius: 4, marginBottom: 16, ...shimmerBg }} />
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 14, width: `${100 - i * 12}%`, borderRadius: 4, marginBottom: 12, ...shimmerBg }} />
            ))}
          </section>

          {/* Director */}
          <section>
            <div style={{ height: 12, width: 72, borderRadius: 4, marginBottom: 16, ...shimmerBg }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, borderRadius: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', ...shimmerBg }} />
              <div>
                <div style={{ height: 14, width: 100, borderRadius: 4, marginBottom: 6, ...shimmerBg }} />
                <div style={{ height: 10, width: 56, borderRadius: 4, ...shimmerBg }} />
              </div>
            </div>
          </section>

          {/* Cast */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ height: 10, width: 48, borderRadius: 4, marginBottom: 8, ...shimmerBg }} />
                <div style={{ height: 18, width: 120, borderRadius: 4, ...shimmerBg }} />
              </div>
              <div style={{ height: 24, width: 80, borderRadius: 6, ...shimmerBg }} />
            </div>
            <div className="cast-grid">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ aspectRatio: '1/1', ...shimmerBg }} />
                  <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ height: 11, width: '80%', borderRadius: 4, marginBottom: 4, ...shimmerBg }} />
                    <div style={{ height: 9, width: '50%', borderRadius: 4, ...shimmerBg }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div>
          <div style={{ borderRadius: 16, padding: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ height: 14, width: 72, borderRadius: 4, ...shimmerBg }} />
                <div style={{ height: 14, width: 96, borderRadius: 4, ...shimmerBg }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 24, width: 64, borderRadius: 6, ...shimmerBg }} />
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <section style={{ padding: '64px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ height: 10, width: 80, borderRadius: 100, marginBottom: 8, ...shimmerBg }} />
            <div style={{ height: 24, width: 144, borderRadius: 4, ...shimmerBg }} />
          </div>
          <div className="movies-grid-pill">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ aspectRatio: '2/3', ...shimmerBg }} />
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 12, width: '80%', borderRadius: 4, ...shimmerBg }} />
                  <div style={{ height: 12, width: '50%', borderRadius: 4, ...shimmerBg }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
