// app/movies/loading.tsx — Movies list skeleton
export default function MoviesLoading() {
  return (
    <main className="min-h-screen animate-pulse" style={{ background: 'var(--ink)' }}>
      {/* Hero */}
      <div className="relative h-48 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-10">
          <div className="h-3 w-16 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-9 w-48 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="h-11 flex-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }} />
        </div>
        {/* Genre pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="aspect-[2/3] w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="p-3 space-y-2">
                <div className="h-3.5 w-4/5 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="h-3 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}