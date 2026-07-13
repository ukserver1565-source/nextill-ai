"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[dashboard] error:", error) }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-lg font-bold text-white mb-2">Dashboard Error</h1>
        <p className="text-sm text-[#A7B0C0] mb-6">Something went wrong in the dashboard. Please try again.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-sm font-medium hover:opacity-90 transition-all">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.06] text-[#A7B0C0] text-sm hover:text-white transition-all">
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  )
}
