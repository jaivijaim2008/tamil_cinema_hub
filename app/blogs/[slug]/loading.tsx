export default function BlogDetailLoading() {
  return (
    <main className="min-h-screen animate-pulse" style={{ background: '#F7F7F5' }}>
      {/* Hero */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E7E3' }}>
        <div className="mx-auto max-w-4xl px-6 pt-12 pb-10">
          <div className="h-3 w-16 rounded mb-5" style={{ background: '#F2F1EE' }} />
          <div className="h-5 w-24 rounded-full mb-4" style={{ background: '#F2F1EE' }} />
          <div className="h-11 w-4/5 rounded-lg mb-2" style={{ background: '#F2F1EE' }} />
          <div className="h-11 w-3/5 rounded-lg mb-5" style={{ background: '#F2F1EE' }} />
          <div className="flex gap-4">
            <div className="h-4 w-28 rounded-full" style={{ background: '#F2F1EE' }} />
            <div className="h-4 w-28 rounded-full" style={{ background: '#F2F1EE' }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Excerpt */}
        <div className="mb-10 space-y-2">
          <div className="h-5 w-full rounded" style={{ background: '#F2F1EE' }} />
          <div className="h-5 w-4/5 rounded" style={{ background: '#F2F1EE' }} />
        </div>
        {/* Divider */}
        <div className="mb-10 h-px w-full" style={{ background: '#E8E7E3' }} />
        {/* Article body */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full rounded" style={{ background: '#F2F1EE' }} />
              <div className="h-4 w-11/12 rounded" style={{ background: '#F2F1EE' }} />
              <div className="h-4 w-4/5 rounded" style={{ background: '#F2F1EE' }} />
            </div>
          ))}
          {/* subheading break */}
          <div className="h-6 w-2/5 rounded mt-6" style={{ background: '#F2F1EE' }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full rounded" style={{ background: '#F2F1EE' }} />
              <div className="h-4 w-5/6 rounded" style={{ background: '#F2F1EE' }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
