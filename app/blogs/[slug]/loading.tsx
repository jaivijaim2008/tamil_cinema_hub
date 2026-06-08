export default function BlogDetailLoading() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--ink)' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 0' }}>
        <div style={{ maxWidth: 768, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ height: 12, width: 64, borderRadius: 4, marginBottom: 20, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ height: 20, width: 96, borderRadius: 100, marginBottom: 16, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ height: 44, width: '80%', borderRadius: 8, marginBottom: 8, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ height: 44, width: '60%', borderRadius: 8, marginBottom: 20, background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ height: 16, width: 112, borderRadius: 100, background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ height: 16, width: 112, borderRadius: 100, background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 768, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ height: 20, width: '100%', borderRadius: 4, marginBottom: 8, background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ height: 20, width: '80%', borderRadius: 4, background: 'rgba(255,255,255,0.04)' }} />
        </div>
        <div style={{ height: 1, width: '100%', marginBottom: 40, background: 'rgba(255,255,255,0.06)' }} />
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ height: 16, width: '100%', borderRadius: 4, marginBottom: 6, background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ height: 16, width: '92%', borderRadius: 4, marginBottom: 6, background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ height: 16, width: '80%', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }} />
          </div>
        ))}
      </div>
    </main>
  )
}
