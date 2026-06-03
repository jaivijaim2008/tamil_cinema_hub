// app/loading.tsx — Home page skeleton
export default function HomeLoading() {
  return (
    <main className="min-h-screen animate-pulse" style={{ background: '#07070f' }}>
      {/* Hero skeleton */}
      <div className="relative h-[520px] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.03)' }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col justify-end h-full pb-16">
          <div className="h-3 w-24 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-12 w-2/3 rounded-xl mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-12 w-1/2 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="flex gap-4">
            <div className="h-4 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-4 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-4 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
        </div>
      </div>

      {/* Movies section skeleton */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-2.5 w-20 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-7 w-44 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
          <div className="h-4 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="aspect-[2/3] w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="p-3 space-y-2">
                <div className="h-3.5 w-4/5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-3 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blogs section skeleton */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-2.5 w-20 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-7 w-44 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
          <div className="h-4 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="aspect-[16/9] w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="h-4 w-full rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="h-4 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="h-3 w-full rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}