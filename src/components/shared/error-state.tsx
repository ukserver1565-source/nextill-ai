"use client"

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <span className="text-danger text-2xl font-bold">!</span>
      </div>
      <h3 className="text-base font-semibold mb-1">Something went wrong</h3>
      <p className="text-sm text-muted mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
