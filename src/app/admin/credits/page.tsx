"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Coins, TrendingUp, Sparkles, Users, ChevronLeft, ChevronRight } from "lucide-react"

const sampleTransactions = [
  { id: 1, user: "Sarah Johnson", email: "sarah@example.com", amount: 5000, type: "added", description: "Monthly credit allocation", date: "2024-07-15" },
  { id: 2, user: "Michael Chen", email: "michael@example.com", amount: 250, type: "used", description: "AI Writer - Article generation", date: "2024-07-15" },
  { id: 3, user: "Emily Davis", email: "emily@example.com", amount: 1000, type: "added", description: "Bonus credits", date: "2024-07-14" },
  { id: 4, user: "James Wilson", email: "james@example.com", amount: 150, type: "used", description: "Keyword research", date: "2024-07-14" },
  { id: 5, user: "Lisa Thompson", email: "lisa@example.com", amount: 3000, type: "added", description: "Plan upgrade bonus", date: "2024-07-13" },
  { id: 6, user: "David Martinez", email: "david@example.com", amount: 500, type: "used", description: "Post generation", date: "2024-07-13" },
  { id: 7, user: "Anna Kim", email: "anna@example.com", amount: 500, type: "added", description: "Welcome bonus", date: "2024-07-12" },
  { id: 8, user: "Robert Taylor", email: "robert@example.com", amount: 800, type: "used", description: "AI detection", date: "2024-07-12" },
  { id: 9, user: "Sophie Brown", email: "sophie@example.com", amount: 2000, type: "added", description: "Credit top-up", date: "2024-07-11" },
  { id: 10, user: "Daniel Lee", email: "daniel@example.com", amount: 120, type: "used", description: "Plagiarism check", date: "2024-07-11" },
]

const PAGE_SIZE = 8

export default function CreditsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = sampleTransactions.filter(t => t.user.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalDistributed = sampleTransactions.filter(t => t.type === "added").reduce((s, t) => s + t.amount, 0)
  const totalUsed = sampleTransactions.filter(t => t.type === "used").reduce((s, t) => s + t.amount, 0)
  const uniqueUsers = new Set(sampleTransactions.map(t => t.user)).size

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Credits</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Monitor and manage AI credit usage</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Coins, label: "Total Distributed", value: totalDistributed.toLocaleString(), change: "+12%", color: "#6D5EF5" },
          { icon: Sparkles, label: "Credits Used", value: totalUsed.toLocaleString(), change: "+8%", color: "#4CC9F0" },
          { icon: TrendingUp, label: "Avg per User", value: Math.round(totalDistributed / uniqueUsers).toLocaleString(), change: "+5%", color: "#22C55E" },
          { icon: Users, label: "Active Users", value: uniqueUsers.toString(), change: "+3", color: "#F59E0B" },
        ].map((stat, i) => {
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
              {paginated.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <p className="text-sm text-white">{t.user}</p>
                    <p className="text-[10px] text-[#A7B0C0]">{t.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-bold ${t.type === "added" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {t.type === "added" ? "+" : "-"}{t.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                      t.type === "added" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                    }`}>{t.type}</span>
                  </td>
                  <td className="p-4 text-xs text-[#A7B0C0] max-w-[200px] truncate">{t.description}</td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{t.date}</td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-[#A7B0C0]">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#A7B0C0]">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? "bg-[#6D5EF5] text-white" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}
