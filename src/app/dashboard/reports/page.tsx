"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, Loader2, Inbox, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  domain: string
  created_at: string
  updated_at: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/user/reports")
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please log in to view reports")
        } else {
          throw new Error(`HTTP ${res.status}`)
        }
        return
      }
      const data = await res.json()
      setReports(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Your saved Domain Intelligence reports</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-20">
          <p className="text-sm text-[#EF4444]">{error}</p>
          <button onClick={fetchReports} className="mt-3 text-xs text-[#6D5EF5] hover:underline">Retry</button>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="text-center py-20">
          <Inbox className="w-12 h-12 text-[#A7B0C0]/30 mx-auto mb-3" />
          <p className="text-sm text-[#A7B0C0]">No reports yet</p>
          <Link href="/domain-overview" className="inline-block mt-3 text-xs text-[#6D5EF5] hover:underline">
            Analyze a domain to create your first report
          </Link>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-xs text-[#A7B0C0] font-medium uppercase">Domain</th>
                <th className="text-left p-4 text-xs text-[#A7B0C0] font-medium uppercase">Created</th>
                <th className="text-right p-4 text-xs text-[#A7B0C0] font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="p-4 text-white font-medium">{r.domain}</td>
                  <td className="p-4 text-[#A7B0C0] text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <a href={`/domain-overview?domain=${encodeURIComponent(r.domain)}`}
                      className="inline-flex items-center gap-1 text-xs text-[#6D5EF5] hover:underline">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
