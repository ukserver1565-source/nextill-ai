"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Calendar, ChevronLeft, ChevronRight, Loader2, XCircle, Inbox } from "lucide-react"

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/logs?type=system&page=${p}&perPage=${PAGE_SIZE}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setLogs(Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [])
      setTotal(json.total ?? 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs(page) }, [page, fetchLogs])

  const filtered = logs.filter(log => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (log.message || "").toLowerCase().includes(q) ||
      (log.source || "").toLowerCase().includes(q) ||
      (log.level || "").toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-sm text-muted mt-1">System activity and audit trail</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text" placeholder="Search logs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-[#6D5EF5]/50 focus:ring-1 focus:ring-[#6D5EF5]/30 transition-all"
          />
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#6D5EF5] animate-spin mb-4" />
          <p className="text-sm text-muted">Loading logs...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20">
          <XCircle className="w-12 h-12 text-[#EF4444] mb-4" />
          <p className="text-sm font-medium text-[#EF4444] mb-1">Failed to load logs</p>
          <p className="text-xs text-muted">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-b from-[#151C2E]/40 to-transparent backdrop-blur-xl border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-medium text-muted uppercase tracking-wider">Timestamp</th>
                  <th className="text-left p-4 text-xs font-medium text-muted uppercase tracking-wider">Level</th>
                  <th className="text-left p-4 text-xs font-medium text-muted uppercase tracking-wider">Message</th>
                  <th className="text-left p-4 text-xs font-medium text-muted uppercase tracking-wider">Source</th>
                  <th className="text-left p-4 text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Inbox className="w-10 h-10 text-muted mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted">No logs found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((log: any) => (
                    <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted" />
                          <span className="text-xs text-muted">{log.created_at ? new Date(log.created_at).toLocaleString() : "—"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-foreground capitalize">{log.level}</td>
                      <td className="p-4 text-sm text-muted max-w-xs truncate">{log.message}</td>
                      <td className="p-4 text-xs text-muted">{log.source || "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          log.level === "error" ? "bg-[#EF4444]/10 text-[#EF4444]"
                          : log.level === "warn" ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                          : "bg-[#22C55E]/10 text-[#22C55E]"
                        }`}>{log.level}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="h-8 px-3 rounded-xl bg-background border border-border text-xs text-muted hover:text-foreground disabled:opacity-40 transition-all">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="h-8 px-3 rounded-xl bg-background border border-border text-xs text-muted hover:text-foreground disabled:opacity-40 transition-all">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
