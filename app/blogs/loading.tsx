// app/blogs/loading.tsx — Blogs list skeleton
export default function BlogsLoading() {
  return (
    <main className="min-h-screen animate-pulse" style={{ background: '#07070f' }}>
      {/* Hero */}
      <div className="relative h-48 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-10">
          <div className="h-3 w-16 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-9 w-48 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Search */}
        <div className="mb-6">
          <div className="h-11 w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }} />
        </div>
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>

        {/* Blog card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="aspect-[16/9] w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/4 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-4 w-full rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="h-4 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="h-3 w-full rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="h-3 w-5/6 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}