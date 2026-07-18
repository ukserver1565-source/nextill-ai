"use client"

import { useState, useEffect } from "react"
import { Wrench, Loader2 } from "lucide-react"
import Link from "next/link"

export default function MaintenancePage() {
  const [message, setMessage] = useState("We are currently performing scheduled maintenance. We'll be back shortly.")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        if (data.maintenance_message) setMessage(data.maintenance_message)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="glass-card rounded-2xl p-8 sm:p-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Under Maintenance</h1>
          {loading ? (
            <Loader2 className="w-5 h-5 text-[#A7B0C0] animate-spin mx-auto" />
          ) : (
            <p className="text-sm text-[#A7B0C0] leading-relaxed mb-6">{message}</p>
          )}
          <p className="text-xs text-[#A7B0C0]/60 mb-6">
            We apologize for the inconvenience. Please check back later.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
