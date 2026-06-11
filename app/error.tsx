'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-playfair text-4xl text-text-primary mb-4">Something went wrong</h1>
      <p className="text-text-secondary text-sm max-w-md mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-accent-gold text-text-inverse font-semibold px-8 py-3 rounded-xl hover:bg-accent-gold-dim transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
