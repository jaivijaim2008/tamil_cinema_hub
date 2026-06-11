export default function LoadingGrid({ count = 8, aspect = 'aspect-[2/3]' }: { count?: number; aspect?: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className={`${aspect} rounded-xl bg-bg-card`} />
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-bg-card rounded w-3/4" />
            <div className="h-3 bg-bg-card rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
