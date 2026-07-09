"use client"

export function WriterSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-border/50 rounded-lg w-3/4" />
      <div className="h-4 bg-border/50 rounded w-1/2" />
      <div className="h-4 bg-border/50 rounded w-1/3" />
      <div className="space-y-2 mt-6">
        <div className="h-6 bg-border/50 rounded w-1/4" />
        <div className="h-3 bg-border/50 rounded w-full" />
        <div className="h-3 bg-border/50 rounded w-full" />
        <div className="h-3 bg-border/50 rounded w-5/6" />
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-6 bg-border/50 rounded w-1/4" />
        <div className="h-3 bg-border/50 rounded w-full" />
        <div className="h-3 bg-border/50 rounded w-full" />
        <div className="h-3 bg-border/50 rounded w-4/5" />
        <div className="h-3 bg-border/50 rounded w-full" />
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-6 bg-border/50 rounded w-1/4" />
        <div className="h-3 bg-border/50 rounded w-3/4" />
        <div className="h-3 bg-border/50 rounded w-full" />
        <div className="h-3 bg-border/50 rounded w-5/6" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-border/50 rounded w-16" />
        <div className="h-8 bg-border/50 rounded w-16" />
        <div className="h-8 bg-border/50 rounded w-16" />
      </div>
    </div>
  )
}
