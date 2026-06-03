// Shared skeleton for app/about/loading.tsx AND app/contact/loading.tsx
// Copy this file into both locations.
export default function StaticPageLoading() {
  return (
    <main className="min-h-screen animate-pulse" style={{ background: '#07070f' }}>
      {/* Hero */}
      <div className="relative overflow-hidden pt-20 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="h-6 w-24 rounded-full mb-5" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-11 w-3/4 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-11 w-1/2 rounded-xl mb-5" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-4 w-full rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-4 w-3/4 rounded mt-2" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-24 space-y-12">
        <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid md:grid-cols-[1fr_2fr] gap-8">
            <div className="space-y-2">
              <div className="h-2.5 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-6 w-32 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-4 w-5/6 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <div className="h-4 w-4/5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}