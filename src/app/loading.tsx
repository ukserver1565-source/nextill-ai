export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-2 mb-8">
          <div className="h-4 w-24 rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="h-8 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
