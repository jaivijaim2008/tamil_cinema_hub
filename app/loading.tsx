export default function HomeLoading() {
  return (
    <main className="min-h-screen animate-pulse" style={{ background: '#F7F7F5' }}>
      {/* Hero skeleton */}
      <div className="relative overflow-hidden py-28" style={{ background: '#FFFFFF' }}>
        <div className="mx-auto max-w-[1280px] px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="h-3 w-32 rounded" style={{ background: '#F2F1EE' }} />
            <div className="h-14 w-3/4 rounded-lg" style={{ background: '#F2F1EE' }} />
            <div className="h-14 w-1/2 rounded-lg" style={{ background: '#F2F1EE' }} />
            <div className="h-5 w-full max-w-sm rounded" style={{ background: '#F2F1EE' }} />
            <div className="h-5 w-3/4 max-w-sm rounded" style={{ background: '#F2F1EE' }} />
            <div className="flex gap-3 pt-4">
              <div className="h-12 w-44 rounded-md" style={{ background: '#F2F1EE' }} />
              <div className="h-12 w-36 rounded-md" style={{ background: '#F2F1EE' }} />
            </div>
            <div className="flex gap-2 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-24 rounded-full" style={{ background: '#F2F1EE' }} />
              ))}
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-72 h-96">
              <div className="absolute top-0 left-0 w-44 h-64 rounded-xl" style={{ background: '#F2F1EE', transform: 'rotate(-4deg)' }} />
              <div className="absolute top-8 left-20 w-44 h-64 rounded-xl" style={{ background: '#E8E7E3', transform: 'rotate(2deg)' }} />
              <div className="absolute top-16 left-10 w-44 h-64 rounded-xl" style={{ background: '#FFF5F5', transform: 'rotate(6deg)' }} />
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: '#F2F1EE', borderTop: '1px solid #E8E7E3', borderBottom: '1px solid #E8E7E3' }}>
        <div className="mx-auto max-w-[1280px] px-6 py-10 flex items-center justify-center gap-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-10 w-20 mx-auto rounded" style={{ background: '#E8E7E3' }} />
              <div className="h-3 w-24 mx-auto rounded" style={{ background: '#E8E7E3' }} />
            </div>
          ))}
        </div>
      </div>
      <section className="mx-auto max-w-[1280px] px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="h-2.5 w-20 rounded mb-2" style={{ background: '#F2F1EE' }} />
            <div className="h-7 w-44 rounded-lg" style={{ background: '#F2F1EE' }} />
          </div>
          <div className="h-4 w-32 rounded" style={{ background: '#F2F1EE' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8E7E3' }}>
              <div className="aspect-[2/3] w-full" style={{ background: '#F2F1EE' }} />
              <div className="p-3 space-y-2">
                <div className="h-3.5 w-4/5 rounded" style={{ background: '#F2F1EE' }} />
                <div className="h-3 w-1/2 rounded" style={{ background: '#F2F1EE' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-[1280px] px-6 py-8 pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="h-2.5 w-20 rounded mb-2" style={{ background: '#F2F1EE' }} />
            <div className="h-7 w-44 rounded-lg" style={{ background: '#F2F1EE' }} />
          </div>
          <div className="h-4 w-32 rounded" style={{ background: '#F2F1EE' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8E7E3' }}>
              <div className="aspect-[16/9] w-full" style={{ background: '#F2F1EE' }} />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 rounded-full" style={{ background: '#F2F1EE' }} />
                <div className="h-4 w-full rounded" style={{ background: '#F2F1EE' }} />
                <div className="h-4 w-3/4 rounded" style={{ background: '#F2F1EE' }} />
                <div className="h-3 w-full rounded" style={{ background: '#F2F1EE' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
