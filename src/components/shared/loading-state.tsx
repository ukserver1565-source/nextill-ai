export function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-card" />
      <div className="h-4 w-72 rounded-lg bg-card" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-card" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-card" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="w-8 h-8 rounded-full bg-card" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-card" />
            <div className="h-2 w-1/4 rounded bg-card" />
          </div>
          <div className="h-3 w-16 rounded bg-card" />
          <div className="h-3 w-12 rounded bg-card" />
        </div>
      ))}
    </div>
  )
}
