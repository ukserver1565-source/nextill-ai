"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Download, Users, DollarSign, BarChart3, Cpu, XCircle } from "lucide-react"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRows, setUserRows] = useState<any[]>([])
  const [paymentRows, setPaymentRows] = useState<any[]>([])
  const [stats, setStats] = useState({ totalUsers: 0, newThisMonth: 0, totalPayments: 0, revenue: 0 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [usersRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/users?limit=10000"),
        fetch("/api/admin/payments?limit=10000"),
      ])

      const users = usersRes.ok ? ((await usersRes.json()).data || []) : []
      const payments = paymentsRes.ok ? ((await paymentsRes.json()).data || []) : []

      setUserRows(users)
      setPaymentRows(payments)

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const monthUsers = users.filter((u: any) => u.created_at >= monthStart).length
      const completedPayments = payments.filter((p: any) => p.status === "completed")
      const revenue = completedPayments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)

      setStats({
        totalUsers: users.length,
        newThisMonth: monthUsers,
        totalPayments: payments.length,
        revenue,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleExportUsers = () => {
    const ts = new Date().toISOString().slice(0, 10)
    downloadCSV(`user_reports_${ts}.csv`,
      ["ID", "Email", "Name", "Plan", "Status", "Joined"],
      userRows.map((u: any) => [u.id, u.email || "", u.full_name || "", u.plan_id || "free", u.role || "user", u.created_at ? new Date(u.created_at).toLocaleDateString() : ""])
    )
  }

  const handleExportPayments = () => {
    const ts = new Date().toISOString().slice(0, 10)
    downloadCSV(`payment_reports_${ts}.csv`,
      ["ID", "Amount", "Status", "Plan", "Provider", "Date"],
      paymentRows.map((p: any) => [p.id, p.amount || 0, p.status || "", p.plan_slug || "", p.provider || "", p.created_at ? new Date(p.created_at).toLocaleDateString() : ""])
    )
  }

  const handleExportToolUsage = () => {
    const ts = new Date().toISOString().slice(0, 10)
    downloadCSV(`tool_usage_summary_${ts}.csv`,
      ["Metric", "Value"],
      [
        ["Total Users", stats.totalUsers],
        ["New This Month", stats.newThisMonth],
        ["Total Payments", stats.totalPayments],
        ["Total Revenue", `$${stats.revenue.toLocaleString()}`],
      ]
    )
  }

  const handleExportAICosts = () => {
    const ts = new Date().toISOString().slice(0, 10)
    downloadCSV(`revenue_summary_${ts}.csv`,
      ["Status", "Count", "Total Amount"],
      (() => {
        const byStatus: Record<string, { count: number; total: number }> = {}
        paymentRows.forEach((p: any) => {
          const s = p.status || "unknown"
          if (!byStatus[s]) byStatus[s] = { count: 0, total: 0 }
          byStatus[s].count++
          byStatus[s].total += Number(p.amount) || 0
        })
        return Object.entries(byStatus).map(([status, data]) => [status, data.count, data.total])
      })()
    )
  }

  const reportTypes = [
    { icon: Users, label: "User Reports", desc: "User registration, activity, and plan distribution", color: "from-[#6D5EF5] to-[#8B5CF6]", handler: handleExportUsers },
    { icon: DollarSign, label: "Payment Reports", desc: "Revenue, transactions, and refund summaries", color: "from-[#22C55E] to-[#4CC9F0]", handler: handleExportPayments },
    { icon: BarChart3, label: "Tool Usage Reports", desc: "Usage statistics per tool and per user", color: "from-[#4CC9F0] to-[#6D5EF5]", handler: handleExportToolUsage },
    { icon: Cpu, label: "AI Cost Reports", desc: "API costs, usage per model, and projections", color: "from-[#F59E0B] to-[#EF4444]", handler: handleExportAICosts },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted mt-1">Generate and export admin reports</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-2.5 text-xs text-[#EF4444]">
          <XCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: loading ? "—" : String(stats.totalUsers) },
          { label: "New This Month", value: loading ? "—" : String(stats.newThisMonth) },
          { label: "Total Payments", value: loading ? "—" : String(stats.totalPayments) },
          { label: "Revenue", value: loading ? "—" : `$${stats.revenue.toLocaleString()}` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="liquid-glass-card border border-border rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {reportTypes.map((r, i) => {
          const Icon = r.icon
          return (
            <motion.div key={r.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="liquid-glass-card border border-border rounded-xl p-5 hover:border-white/[0.12] transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{r.label}</h3>
              <p className="text-xs text-muted mb-3">{r.desc}</p>
              <button onClick={r.handler} disabled={loading} className="w-full h-9 rounded-xl bg-background border border-border text-xs text-muted hover:text-foreground flex items-center justify-center gap-1.5 transition-all disabled:opacity-50">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
