"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Coins, TrendingUp, Sparkles, Users, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react"

const PAGE_SIZE = 8

export default function CreditsPage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [renewing, setRenewing] = useState(false)
  const [renewResult, setRenewResult] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: PAGE_SIZE.toString() })
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/credits?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleRenewAll = async () => {
    if (!confirm("Renew credits for ALL users based on their current plans? This cannot be undone.")) return
    setRenewing(true)
    setRenewResult(null)
    try {
      const res = await fetch("/api/cron/credits/renew", {
        method: "POST",
        headers: { "x-cron-secret": prompt("Enter cron secret:") || "" },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Renewal failed")
      setRenewResult(`✅ ${json.message}`)
      fetchData()
    } catch (err: any) {
      setRenewResult(`❌ ${err.message}`)
    } finally {
      setRenewing(false)
    }
  }

  const totalDistributed = data.reduce((s, t) => s + (t.type === "added" ? Number(t.amount) : 0), 0)
  const totalUsed = data.reduce((s, t) => s + (t.type === "used" ? Number(t.amount) : 0), 0)
  const uniqueUsers = new Set(data.map(t => t.user_id)).size
  const avgPerUser = uniqueUsers > 0 ? Math.round(totalDistributed / uniqueUsers) : 0

  const stats = [
    { icon: Coins, label: "Total Distributed", value: totalDistributed.toLocaleString(), change: `from ${data.length} records`, color: "#6D5EF5" },
    { icon: Sparkles, label: "Credits Used", value: totalUsed.toLocaleString(), change: `by ${data.filter(t => t.type === "used").length} txns`, color: "#4CC9F0" },
    { icon: TrendingUp, label: "Avg per User", value: avgPerUser.toLocaleString(), change: "avg", color: "#22C55E" },
    { icon: Users, label: "Active Users", value: uniqueUsers.toString(), change: "users", color: "#F59E0B" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Credits</h1>
        <p className="text-sm text-muted mt-1">Monitor and manage AI credit usage</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4">
              <Icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search transactions..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-card/80 border border-border text-foreground text-xs placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
        </div>
        <button onClick={handleRenewAll} disabled={renewing}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#6D5EF5] hover:bg-[#5B4BD4] text-foreground text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <RefreshCw className={`w-4 h-4 ${renewing ? "animate-spin" : ""}`} />
          {renewing ? "Renewing..." : "Renew All Credits"}
        </button>
      </div>

      {renewResult && (
        <div className={`p-3 rounded-xl text-xs ${renewResult.startsWith("✅") ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20" : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"}`}>
          {renewResult}
        </div>
      )}

      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-[11px] font-medium text-muted uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-[11px] font-medium text-muted uppercase tracking-wider">Amount</th>
                <th className="text-left p-4 text-[11px] font-medium text-muted uppercase tracking-wider">Type</th>
                <th className="text-left p-4 text-[11px] font-medium text-muted uppercase tracking-wider">Description</th>
                <th className="text-left p-4 text-[11px] font-medium text-muted uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin mx-auto" /></td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-[#EF4444]">{error}</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-muted">No transactions found</td></tr>
              ) : (
                data.map((t, i) => (
                  <motion.tr key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <p className="text-sm text-foreground">{t.profiles?.full_name || "—"}</p>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-bold ${t.type === "added" ? "text-[#22C55E]" : t.type === "used" ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>
                        {t.type === "added" ? "+" : t.type === "removed" ? "-" : "-"}{Number(t.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                        t.type === "added" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                      }`}>{t.type}</span>
                    </td>
                    <td className="p-4 text-xs text-muted max-w-[200px] truncate">{t.description || t.tool || "—"}</td>
                    <td className="p-4 text-xs text-muted">{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{total === 0 ? "No results" : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-card/80 border border-border text-foreground disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? "bg-[#6D5EF5] text-foreground" : "bg-card/80 border border-border text-muted hover:text-foreground"}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-2 rounded-lg bg-card/80 border border-border text-foreground disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}
