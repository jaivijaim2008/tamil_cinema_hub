export default function BlogDetailLoading() {
  const shimmer = 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)'
  const shimmerBg = { backgroundImage: shimmer, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--ink)' }} className="animate-pulse">
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {/* Cover image */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ borderRadius: 16, aspectRatio: '21/9', ...shimmerBg }} />
      </div>

      {/* Hero header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 768, margin: '0 auto', padding: '32px 24px 40px' }}>
          {/* Back link */}
          <div style={{ height: 14, width: 96, borderRadius: 4, marginBottom: 24, ...shimmerBg }} />

          {/* Category pill */}
          <div style={{ height: 24, width: 72, borderRadius: 6, marginBottom: 16, ...shimmerBg }} />

          {/* Title */}
          <div style={{ height: 40, width: '85%', borderRadius: 8, marginBottom: 8, ...shimmerBg }} />
          <div style={{ height: 40, width: '55%', borderRadius: 8, marginBottom: 20, ...shimmerBg }} />

          {/* Author & date */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ height: 16, width: 120, borderRadius: 100, ...shimmerBg }} />
            <div style={{ height: 16, width: 128, borderRadius: 100, ...shimmerBg }} />
            <div style={{ height: 16, width: 96, borderRadius: 100, ...shimmerBg }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 768, margin: '0 auto', padding: '40px 24px' }}>
        {/* Excerpt */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ height: 18, width: '100%', borderRadius: 4, marginBottom: 8, ...shimmerBg }} />
          <div style={{ height: 18, width: '75%', borderRadius: 4, ...shimmerBg }} />
        </div>

        <div style={{ height: 1, width: '100%', marginBottom: 40, background: 'rgba(255,255,255,0.06)' }} />

        {/* Article body lines */}
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} style={{ marginBottom: 20 }}>
            {i === 1 && <div style={{ height: 24, width: '60%', borderRadius: 4, marginBottom: 12, ...shimmerBg }} />}
            <div style={{ height: 14, width: `${100 - (i % 3) * 8}%`, borderRadius: 4, marginBottom: 6, ...shimmerBg }} />
            <div style={{ height: 14, width: `${92 - (i % 4) * 6}%`, borderRadius: 4, marginBottom: 6, ...shimmerBg }} />
            <div style={{ height: 14, width: `${80 - (i % 5) * 5}%`, borderRadius: 4, ...shimmerBg }} />
          </div>
        ))}

        {/* Reactions bar */}
        <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 40, width: 80, borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
        </div>

        {/* Tags */}
        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 28, width: 64, borderRadius: 6, ...shimmerBg }} />
          ))}
        </div>

        {/* Comments section */}
        <div style={{ marginTop: 60, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 40 }}>
          <div style={{ height: 20, width: 144, borderRadius: 4, marginBottom: 24, ...shimmerBg }} />
          {[1,2].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, ...shimmerBg }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, width: 96, borderRadius: 4, marginBottom: 8, ...shimmerBg }} />
                <div style={{ height: 14, width: '90%', borderRadius: 4, marginBottom: 4, ...shimmerBg }} />
                <div style={{ height: 14, width: '60%', borderRadius: 4, ...shimmerBg }} />
              </div>
            </div>
          ))}
        </div>

        {/* Related articles */}
        <div style={{ marginTop: 80 }}>
          <div style={{ height: 10, width: 96, borderRadius: 100, marginBottom: 8, ...shimmerBg }} />
          <div style={{ height: 24, width: 120, borderRadius: 4, marginBottom: 32, ...shimmerBg }} />
          <div className="related-blog-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ aspectRatio: '16/9', ...shimmerBg }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 10, width: '30%', borderRadius: 100, ...shimmerBg }} />
                  <div style={{ height: 14, width: '90%', borderRadius: 4, ...shimmerBg }} />
                  <div style={{ height: 14, width: '60%', borderRadius: 4, ...shimmerBg }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
