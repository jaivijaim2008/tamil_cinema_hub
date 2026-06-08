export default function HomeLoading() {
  const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }
  const bar = { background: 'rgba(255,255,255,0.06)' }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--ink)' }}>
      {/* Hero skeleton */}
      <div style={{ padding: '120px 24px 60px', maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
        <div>
          <div style={{ ...bar, height: 12, width: 128, borderRadius: 100, marginBottom: 20 }} />
          <div style={{ ...bar, height: 56, width: '75%', borderRadius: 8, marginBottom: 12 }} />
          <div style={{ ...bar, height: 56, width: '50%', borderRadius: 8, marginBottom: 12 }} />
          <div style={{ ...bar, height: 56, width: '40%', borderRadius: 8, marginBottom: 20 }} />
          <div style={{ ...bar, height: 20, width: '80%', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ ...bar, height: 20, width: '60%', borderRadius: 4, marginBottom: 32 }} />
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ ...bar, height: 48, width: 176, borderRadius: 12 }} />
            <div style={{ height: 48, width: 144, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
          <div style={{ position: 'relative', width: 288, height: 384 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 176, height: 256, borderRadius: 16, ...card, transform: 'rotate(-4deg)' }} />
            <div style={{ position: 'absolute', top: 32, left: 80, width: 176, height: 256, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', transform: 'rotate(2deg)' }} />
            <div style={{ position: 'absolute', top: 64, left: 40, width: 176, height: 256, borderRadius: 16, ...card, transform: 'rotate(6deg)' }} />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, textAlign: 'center' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ padding: '24px 16px' }}>
              <div style={{ ...bar, height: 40, width: 80, borderRadius: 8, margin: '0 auto 12px' }} />
              <div style={{ ...bar, height: 12, width: 96, borderRadius: 4, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Movies skeleton */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ ...bar, height: 10, width: 80, borderRadius: 100, marginBottom: 12 }} />
          <div style={{ ...bar, height: 28, width: 176, borderRadius: 8, marginBottom: 12 }} />
          <div style={{ height: 2, width: 60, borderRadius: 2, background: 'linear-gradient(90deg, var(--crimson), transparent)' }} />
        </div>
        <div className="movies-grid-pill">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', ...card }}>
              <div style={{ aspectRatio: '2/3', width: '100%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ ...bar, height: 12, width: '80%', borderRadius: 4 }} />
                <div style={{ ...bar, height: 12, width: '50%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blogs skeleton */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 96px' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ ...bar, height: 10, width: 80, borderRadius: 100, marginBottom: 12 }} />
          <div style={{ ...bar, height: 28, width: 176, borderRadius: 8, marginBottom: 12 }} />
          <div style={{ height: 2, width: 60, borderRadius: 2, background: 'linear-gradient(90deg, var(--teal), transparent)' }} />
        </div>
        <div className="blogs-grid-pill">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', ...card, display: 'flex', flexDirection: 'column' }}>
              <div style={{ aspectRatio: '16/9', width: '100%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ ...bar, height: 10, width: '25%', borderRadius: 100 }} />
                <div style={{ ...bar, height: 18, width: '90%', borderRadius: 4 }} />
                <div style={{ ...bar, height: 14, width: '60%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
