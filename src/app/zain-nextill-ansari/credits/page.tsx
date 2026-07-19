"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Coins, TrendingUp, Sparkles, Users, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

const PAGE_SIZE = 8

export default function CreditsPage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

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
        <h1 className="text-2xl font-bold text-white">Credits</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Monitor and manage AI credit usage</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4">
              <Icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-[11px] text-[#A7B0C0]">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search transactions..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
        </div>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Amount</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Type</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Description</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin mx-auto" /></td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-[#EF4444]">{error}</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-[#A7B0C0]">No transactions found</td></tr>
              ) : (
                data.map((t, i) => (
                  <motion.tr key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <p className="text-sm text-white">{t.profiles?.full_name || "—"}</p>
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
                    <td className="p-4 text-xs text-[#A7B0C0] max-w-[200px] truncate">{t.description || t.tool || "—"}</td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#A7B0C0]">{total === 0 ? "No results" : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? "bg-[#6D5EF5] text-white" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}
