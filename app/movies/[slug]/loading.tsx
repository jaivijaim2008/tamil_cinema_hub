// app/movies/[slug]/loading.tsx — Movie detail skeleton
export default function MovieDetailLoading() {
  return (
    <main className="min-h-screen animate-pulse" style={{ background: '#07070f' }}>
      {/* Backdrop hero */}
      <div className="relative overflow-hidden" style={{ minHeight: 'clamp(320px, 52vw, 580px)', background: 'rgba(255,255,255,0.025)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #07070f 100%)' }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-end h-full pb-10 pt-24">
          {/* Poster */}
          <div className="hidden md:block shrink-0 w-44 lg:w-52 rounded-2xl overflow-hidden mr-8" style={{ background: 'rgba(255,255,255,0.06)', aspectRatio: '2/3' }} />
          {/* Title block */}
          <div className="flex-1 space-y-3">
            <div className="h-3 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-10 w-3/4 rounded-xl" style={{ background: 'rgba(255,255,255,0.09)' }} />
            <div className="h-10 w-1/2 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="flex gap-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-7 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[2fr_1fr] gap-10">
        {/* Left: synopsis + cast */}
        <div className="space-y-10">
          <div className="space-y-3">
            <div className="h-5 w-32 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-4 w-full rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-4 w-5/6 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-4 w-4/5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-4 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
          {/* Cast grid */}
          <div>
            <div className="h-5 w-24 rounded mb-4" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-14 w-14 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="h-2.5 w-12 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: info panel */}
        <div className="rounded-2xl p-6 space-y-4 h-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3.5 w-20 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-3.5 w-24 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}