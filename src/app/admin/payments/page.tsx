"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, DollarSign, TrendingUp, CheckCircle, XCircle, ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react"

const samplePayments = [
  { id: "PAY-001", user: "Sarah Johnson", email: "sarah@example.com", amount: 99, plan: "Pro", status: "completed", date: "2024-07-15", method: "Stripe" },
  { id: "PAY-002", user: "Michael Chen", email: "michael@example.com", amount: 299, plan: "Enterprise", status: "completed", date: "2024-07-14", method: "Stripe" },
  { id: "PAY-003", user: "Emily Davis", email: "emily@example.com", amount: 0, plan: "Free", status: "completed", date: "2024-07-14", method: "-" },
  { id: "PAY-004", user: "James Wilson", email: "james@example.com", amount: 99, plan: "Pro", status: "pending", date: "2024-07-13", method: "PayPal" },
  { id: "PAY-005", user: "Lisa Thompson", email: "lisa@example.com", amount: 49, plan: "Starter", status: "completed", date: "2024-07-12", method: "Stripe" },
  { id: "PAY-006", user: "David Martinez", email: "david@example.com", amount: 99, plan: "Pro", status: "failed", date: "2024-07-11", method: "Stripe" },
  { id: "PAY-007", user: "Anna Kim", email: "anna@example.com", amount: 0, plan: "Free", status: "completed", date: "2024-07-10", method: "-" },
  { id: "PAY-008", user: "Robert Taylor", email: "robert@example.com", amount: 299, plan: "Enterprise", status: "completed", date: "2024-07-09", method: "PayPal" },
  { id: "PAY-009", user: "Sophie Brown", email: "sophie@example.com", amount: 49, plan: "Starter", status: "pending", date: "2024-07-08", method: "Stripe" },
  { id: "PAY-010", user: "Daniel Lee", email: "daniel@example.com", amount: 99, plan: "Pro", status: "completed", date: "2024-07-07", method: "Stripe" },
]

const metrics = [
  { icon: DollarSign, label: "Total Revenue", value: "$994", change: "+18.7%", up: true, color: "#22C55E" },
  { icon: TrendingUp, label: "Pending", value: "$148", change: "2 pending", up: false, color: "#F59E0B" },
  { icon: CheckCircle, label: "Successful", value: "7", change: "+5", up: true, color: "#22C55E" },
  { icon: XCircle, label: "Failed", value: "1", change: "-1", up: false, color: "#EF4444" },
]

const statusStyles: Record<string, string> = {
  completed: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  pending: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  failed: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
}

const PAGE_SIZE = 8

export default function PaymentsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = samplePayments.filter(p =>
    p.user.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Track payments, invoices, and refunds</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-4 h-4" style={{ color: m.color }} />
                <span className={`text-[10px] font-medium ${m.up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{m.change}</span>
              </div>
              <p className="text-xl font-bold text-white">{m.value}</p>
              <p className="text-[11px] text-[#A7B0C0] mt-0.5">{m.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search payments..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
        </div>
        <button className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-2 transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Invoice</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Amount</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Date</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 text-xs font-mono text-[#4CC9F0]">{p.id}</td>
                  <td className="p-4">
                    <p className="text-sm text-white">{p.user}</p>
                    <p className="text-[11px] text-[#A7B0C0]">{p.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-white">${p.amount}</span>
                    <span className="text-[10px] text-[#A7B0C0] ml-1">{p.plan}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${statusStyles[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{p.date}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Download className="w-3.5 h-3.5" /></button>
                      {p.status === "completed" && p.amount > 0 && (
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#F59E0B] hover:text-[#F59E0B] transition-all"><RotateCcw className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-[#A7B0C0]">No payments found</td></tr>
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
