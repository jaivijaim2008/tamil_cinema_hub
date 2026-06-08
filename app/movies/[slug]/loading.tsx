export default function MovieDetailLoading() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--ink)' }}>
      {/* Hero header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px', display: 'flex', alignItems: 'flex-end', gap: 32 }}>
          <div className="hidden md:block" style={{ flexShrink: 0, width: 208, borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', aspectRatio: '2/3' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, width: 80, borderRadius: 4, marginBottom: 12, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ height: 40, width: '75%', borderRadius: 8, marginBottom: 8, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ height: 40, width: '50%', borderRadius: 8, marginBottom: 16, background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: 28, width: 64, borderRadius: 100, background: 'rgba(255,255,255,0.05)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Body */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
        <div>
          <div style={{ height: 20, width: 128, borderRadius: 4, marginBottom: 16, background: 'rgba(255,255,255,0.06)' }} />
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: 16, width: `${100 - i*10}%`, borderRadius: 4, marginBottom: 12, background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
        <div style={{ borderRadius: 16, padding: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ height: 14, width: 80, borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ height: 14, width: 96, borderRadius: 4, background: 'rgba(255,255,255,0.04)' }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
