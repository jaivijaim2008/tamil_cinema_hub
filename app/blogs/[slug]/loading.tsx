// app/blogs/[slug]/loading.tsx — Blog detail skeleton
export default function BlogDetailLoading() {
  return (
    <main className="min-h-screen animate-pulse" style={{ background: '#07070f' }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: 'clamp(320px, 52vw, 580px)', background: 'rgba(255,255,255,0.025)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #07070f 100%)' }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 flex flex-col justify-end h-full pb-12 pt-24">
          <div className="h-3 w-16 rounded-full mb-5" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-5 w-24 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-11 w-4/5 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.09)' }} />
          <div className="h-11 w-3/5 rounded-xl mb-5" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="flex gap-4">
            <div className="h-4 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-4 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-24">
        {/* Excerpt */}
        <div className="mt-8 mb-10 space-y-2">
          <div className="h-5 w-full rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-5 w-4/5 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
        {/* Divider */}
        <div className="mb-10 h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        {/* Article body */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-4 w-11/12 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <div className="h-4 w-4/5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
          ))}
          {/* subheading break */}
          <div className="h-6 w-2/5 rounded mt-6" style={{ background: 'rgba(255,255,255,0.07)' }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-4 w-5/6 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}