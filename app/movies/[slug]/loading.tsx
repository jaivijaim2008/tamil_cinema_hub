export default function MovieDetailLoading() {
  return (
    <main className="min-h-screen animate-pulse" style={{ background: '#F7F7F5' }}>
      {/* Hero header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E7E3' }}>
        <div className="mx-auto max-w-[1280px] px-6 py-12 flex items-end gap-8">
          {/* Poster */}
          <div className="hidden md:block shrink-0 w-44 lg:w-52 rounded-xl overflow-hidden" style={{ background: '#F2F1EE', aspectRatio: '2/3' }} />
          {/* Title block */}
          <div className="flex-1 space-y-3">
            <div className="h-3 w-20 rounded" style={{ background: '#F2F1EE' }} />
            <div className="h-10 w-3/4 rounded-lg" style={{ background: '#F2F1EE' }} />
            <div className="h-10 w-1/2 rounded-lg" style={{ background: '#F2F1EE' }} />
            <div className="flex gap-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-7 w-16 rounded-full" style={{ background: '#F2F1EE' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1280px] px-6 py-12 grid lg:grid-cols-[2fr_1fr] gap-10">
        {/* Left: synopsis + cast */}
        <div className="space-y-10">
          <div className="space-y-3">
            <div className="h-5 w-32 rounded" style={{ background: '#F2F1EE' }} />
            <div className="h-4 w-full rounded" style={{ background: '#F2F1EE' }} />
            <div className="h-4 w-5/6 rounded" style={{ background: '#F2F1EE' }} />
            <div className="h-4 w-4/5 rounded" style={{ background: '#F2F1EE' }} />
            <div className="h-4 w-3/4 rounded" style={{ background: '#F2F1EE' }} />
          </div>
          {/* Cast grid */}
          <div>
            <div className="h-5 w-24 rounded mb-4" style={{ background: '#F2F1EE' }} />
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-14 w-14 rounded-full" style={{ background: '#F2F1EE' }} />
                  <div className="h-2.5 w-12 rounded-full" style={{ background: '#F2F1EE' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: info panel */}
        <div className="rounded-xl p-6 space-y-4 h-fit" style={{ background: '#FFFFFF', border: '1px solid #E8E7E3' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3.5 w-20 rounded" style={{ background: '#F2F1EE' }} />
              <div className="h-3.5 w-24 rounded" style={{ background: '#F2F1EE' }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
