"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { FileText, FileSpreadsheet, Download, Users, DollarSign, BarChart3, Cpu, Loader2, Inbox, XCircle } from "lucide-react"

const reportTypes = [
  { icon: Users, label: "User Reports", desc: "User registration, activity, and plan distribution", color: "from-[#6D5EF5] to-[#8B5CF6]" },
  { icon: DollarSign, label: "Payment Reports", desc: "Revenue, transactions, and refund summaries", color: "from-[#22C55E] to-[#4CC9F0]" },
  { icon: BarChart3, label: "Tool Usage Reports", desc: "Usage statistics per tool and per user", color: "from-[#4CC9F0] to-[#6D5EF5]" },
  { icon: Cpu, label: "AI Cost Reports", desc: "API costs, usage per model, and projections", color: "from-[#F59E0B] to-[#EF4444]" },
]

function downloadCSV(filename: string, headers: string[], rows: any[][]) {
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statsError, setStatsError] = useState("")
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 })
  const [userRows, setUserRows] = useState<any[]>([])
  const [paymentRows, setPaymentRows] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/reports")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setReports(Array.isArray(json) ? json : json.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    loadStats()
  }, [fetchData])

  async function loadStats() {
    setStatsError("")
    try {
      const [reportsRes, usersRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/reports"),
        fetch("/api/admin/users?limit=1000"),
        fetch("/api/admin/payments?limit=1000"),
      ])

      if (reportsRes.ok) {
        const reportData = await reportsRes.json()
        setStats({ total: reportData.users?.total || 0, thisMonth: 0 })
      }

      if (usersRes.ok) {
        const usersJson = await usersRes.json()
        const users = usersJson.data || []
        setUserRows(users)
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const monthUsers = users.filter((u: any) => u.created_at >= monthStart).length
        setStats(prev => ({ ...prev, thisMonth: monthUsers }))
      }

      if (paymentsRes.ok) {
        const paymentsJson = await paymentsRes.json()
        setPaymentRows(paymentsJson.data || [])
      }
    } catch (err: any) {
      setStatsError(err.message || "Failed to load stats")
    }
  }

  const handleExportCSV = (type: string) => {
    const ts = new Date().toISOString().slice(0, 10)
    if (type === "User Reports") {
      downloadCSV(`user_reports_${ts}.csv`,
        ["ID", "Email", "Name", "Plan", "Status", "Joined"],
        userRows.map((u: any) => [u.id, u.email || "", u.name || "", u.plan_id || "free", u.status || "", u.created_at ? new Date(u.created_at).toLocaleDateString() : ""])
      )
    } else if (type === "Payment Reports") {
      downloadCSV(`payment_reports_${ts}.csv`,
        ["ID", "Amount", "Status", "Plan", "Date"],
        paymentRows.map((p: any) => [p.id, p.amount, p.status, p.plan_slug || "", p.created_at ? new Date(p.created_at).toLocaleDateString() : ""])
      )
    } else if (type === "Tool Usage Reports") {
      const toolReports = reports.filter((r: any) => r.type === "tool_usage")
      downloadCSV(`tool_usage_reports_${ts}.csv`,
        ["Name", "Type", "Status", "Generated"],
        toolReports.map((r: any) => [r.name, r.type, r.status, r.generated || r.created_at || ""])
      )
    } else if (type === "AI Cost Reports") {
      const aiReports = reports.filter((r: any) => r.type === "ai_cost")
      downloadCSV(`ai_cost_reports_${ts}.csv`,
        ["Name", "Type", "Status", "Generated"],
        aiReports.map((r: any) => [r.name, r.type, r.status, r.generated || r.created_at || ""])
      )
    }
  }

  const handleDownloadReport = (report: any) => {
    const ts = new Date().toISOString().slice(0, 10)
    downloadCSV(`${report.name || "report"}_${ts}.csv`,
      ["Name", "Type", "Status", "Generated"],
      [[report.name, report.type, report.status, report.generated || report.created_at || ""]]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Generate and export admin reports</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: loading ? "—" : String(stats.total) },
          { label: "New This Month", value: loading ? "—" : String(stats.thisMonth) },
          { label: "Total Reports", value: loading ? "—" : String(reports.length) },
          { label: "Generated", value: loading ? "—" : String(reports.filter((r: any) => r.status === "ready" || r.status === "completed").length) },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-[11px] text-[#A7B0C0]">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {statsError && (
        <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-2.5 text-xs text-[#EF4444]">
          <XCircle className="w-3.5 h-3.5" />
          <span>Stats load error: {statsError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {reportTypes.map((r, i) => {
          const Icon = r.icon
          return (
            <motion.div key={r.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{r.label}</h3>
              <p className="text-xs text-[#A7B0C0] mb-3">{r.desc}</p>
              <button onClick={() => handleExportCSV(r.label)} className="w-full h-9 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center justify-center gap-1.5 transition-all">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </motion.div>
          )
        })}
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white">Recent Reports</h3>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#6D5EF5] animate-spin mb-4" />
            <p className="text-sm text-[#A7B0C0]">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm font-medium text-[#EF4444] mb-1">Failed to load reports</p>
            <p className="text-xs text-[#A7B0C0]">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Inbox className="w-10 h-10 text-[#A7B0C0] mb-3" />
            <p className="text-sm font-medium text-[#A7B0C0] mb-1">No reports generated yet</p>
            <p className="text-xs text-[#A7B0C0]">Generated reports will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Name</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Generated</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r: any, i: number) => (
                  <motion.tr key={r.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm text-white">{r.name}</td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{r.type}</td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{r.generated || r.created_at}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                        r.status === "ready" || r.status === "completed" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                      }`}>{r.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDownloadReport(r)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
