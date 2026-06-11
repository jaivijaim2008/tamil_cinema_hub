export default function SkeletonCard({ variant = 'compact' }: { variant?: 'compact' | 'featured' }) {
  if (variant === 'featured') {
    return (
      <div className="glass rounded-2xl p-4 animate-pulse">
        <div className="grid grid-cols-[120px_1fr] gap-4">
          <div className="aspect-[2/3] rounded-xl bg-bg-elevated" />
          <div className="space-y-3 py-2">
            <div className="w-16 h-4 rounded-full bg-bg-elevated" />
            <div className="w-3/4 h-6 rounded bg-bg-elevated" />
            <div className="w-1/2 h-4 rounded bg-bg-elevated" />
            <div className="w-full h-3 rounded bg-bg-elevated mt-4" />
            <div className="w-2/3 h-3 rounded bg-bg-elevated" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden bg-bg-card animate-pulse">
      <div className="aspect-[2/3] bg-bg-elevated relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer"
          style={{ backgroundSize: '200% 100%' }} />
      </div>
      <div className="p-3 space-y-2">
        <div className="flex justify-between">
          <div className="w-12 h-4 rounded-full bg-bg-elevated" />
          <div className="w-8 h-4 rounded bg-bg-elevated" />
        </div>
        <div className="w-3/4 h-4 rounded bg-bg-elevated" />
        <div className="w-1/2 h-3 rounded bg-bg-elevated" />
      </div>
    </div>
  )
}
