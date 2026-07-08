"use client"

import { Clock } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthProvider"

export default function DashboardHistoryPage() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted mt-1">Your recent activity and usage history.</p>
      </div>
      <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <Clock className="w-12 h-12 text-muted mb-4" />
        <h3 className="text-lg font-semibold mb-1">No History Yet</h3>
        <p className="text-sm text-muted max-w-md">
          Your AI tool usage and activity history will appear here.
        </p>
      </div>
    </div>
  )
}
