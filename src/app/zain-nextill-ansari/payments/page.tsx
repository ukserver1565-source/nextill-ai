"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, DollarSign, TrendingUp, CheckCircle, XCircle, ChevronLeft, ChevronRight, Download, RotateCcw, Loader2 } from "lucide-react"

const statusStyles: Record<string, string> = {
  completed: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  pending: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  failed: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
}

const PAGE_SIZE = 8

export default function PaymentsPage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: PAGE_SIZE.toString() })
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/payments?${params}`)
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

  const totalRevenue = data.reduce((s, p) => s + (p.status === "completed" ? Number(p.amount) : 0), 0)
  const pendingAmount = data.reduce((s, p) => s + (p.status === "pending" ? Number(p.amount) : 0), 0)
  const successfulCount = data.filter(p => p.status === "completed").length
  const failedCount = data.filter(p => p.status === "failed").length

  const metrics = [
    { icon: DollarSign, label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, change: `from ${data.length} records`, up: true, color: "#22C55E" },
    { icon: TrendingUp, label: "Pending", value: `$${pendingAmount.toLocaleString()}`, change: `${data.filter(p => p.status === "pending").length} pending`, up: false, color: "#F59E0B" },
    { icon: CheckCircle, label: "Successful", value: successfulCount.toString(), change: "completed", up: true, color: "#22C55E" },
    { icon: XCircle, label: "Failed", value: failedCount.toString(), change: "failed", up: false, color: "#EF4444" },
  ]

  const handleExportCSV = () => {
    const headers = ["ID", "User", "Email", "Amount", "Status", "Plan", "Date"]
    const rows = data.map((p: any) => [
      p.id, p.profiles?.full_name || "", p.profiles?.email || "",
      p.amount, p.status, p.plan_slug || "",
      p.created_at ? new Date(p.created_at).toLocaleDateString() : "",
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payments_export_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPayment = (p: any) => {
    if (p.invoice_url) {
      window.open(p.invoice_url, "_blank")
      return
    }
    const receipt = [
      "PAYMENT RECEIPT",
      "=".repeat(40),
      "",
      `Payment ID: ${p.id}`,
      `Date: ${p.created_at ? new Date(p.created_at).toLocaleString() : "N/A"}`,
      `Status: ${p.status}`,
      `Amount: $${Number(p.amount).toFixed(2)}`,
      `Plan: ${p.plan_slug || "N/A"}`,
      "",
      `User: ${p.profiles?.full_name || "N/A"}`,
      `Email: ${p.profiles?.email || "N/A"}`,
      "",
      "=".repeat(40),
    ].join("\n")
    const blob = new Blob([receipt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt_${p.id?.slice(0, 8) || "payment"}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRefund = async (id: string) => {
    if (!window.confirm("Are you sure you want to refund this payment?")) return
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "refunded" }),
      })
      if (!res.ok) throw new Error("Failed")
      fetchData()
    } catch (e: any) { setActionError(e.message || "Failed to process refund") }
  }

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
        <button onClick={handleExportCSV} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-2 transition-all">
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
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin mx-auto" /></td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-[#EF4444]">{error}</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-[#A7B0C0]">No payments found</td></tr>
              ) : (
                data.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 text-xs font-mono text-[#4CC9F0]">{p.id?.slice(0, 8)}...</td>
                    <td className="p-4">
                      <p className="text-sm text-white">{p.profiles?.full_name || "—"}</p>
                      <p className="text-[11px] text-[#A7B0C0]">{p.profiles?.email || ""}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-white">${Number(p.amount).toFixed(2)}</span>
                      <span className="text-[10px] text-[#A7B0C0] ml-1">{p.plan_slug}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${statusStyles[p.status] || ""}`}>{p.status}</span>
                    </td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleDownloadPayment(p)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Download className="w-3.5 h-3.5" /></button>
                        {p.status === "completed" && Number(p.amount) > 0 && (
                          <button onClick={() => handleRefund(p.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#F59E0B] hover:text-[#F59E0B] transition-all"><RotateCcw className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </td>
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

      {actionError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg backdrop-blur-xl">
          <p className="text-xs text-[#EF4444]">{actionError}</p>
          <button onClick={() => setActionError("")} className="text-[#EF4444] hover:text-white transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
