"use client"

import { Button } from "@/components/ui/button"
import { useData, LoadingSkeleton } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import { FileSpreadsheet, FileText, Download, Users, DollarSign, BarChart3, Cpu } from "lucide-react"
import { useState, useCallback } from "react"
import { AdminModal } from "@/components/admin/admin-modal"

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function useCsvExport(fetcher: () => Promise<any>, filename: string, headers: string[], mapper: (item: any) => string[]) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const exportCsv = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await fetcher()
      const items = Array.isArray(data) ? data : data.data || data
      downloadCsv(filename, headers, items.map(mapper))
    } catch (e: any) {
      setError(e.message || "Export failed")
    } finally {
      setLoading(false)
    }
  }, [])
  return { exportCsv, loading, error, clearError: () => setError("") }
}

const reportTypes = [
  { icon: Users, label: "User Reports", desc: "User registration, activity, and plan distribution", color: "from-blue-500 to-purple-600" },
  { icon: DollarSign, label: "Payment Reports", desc: "Revenue, transactions, and refund summaries", color: "from-emerald-500 to-teal-600" },
  { icon: BarChart3, label: "Tool Usage Reports", desc: "Usage statistics per tool and per user", color: "from-cyan-500 to-blue-600" },
  { icon: Cpu, label: "AI Cost Reports", desc: "API costs, usage per model, and projections", color: "from-purple-500 to-pink-600" },
]

export default function ReportsPage() {
  const [pdfLabel, setPdfLabel] = useState("")
  const [showPdfModal, setShowPdfModal] = useState(false)
  const usersCsv = useCsvExport(() => adminApi.users(), "users-report.csv", ["Name", "Email", "Role", "Plan", "Status", "Credits"], (u: any) => [u.full_name || u.name, u.email, u.role, u.plan, u.status, String(u.credits)])
  const paymentsCsv = useCsvExport(() => adminApi.payments(), "payments-report.csv", ["User", "Email", "Amount", "Currency", "Plan", "Status", "Date"], (p: any) => [p.profiles?.full_name || p.user_name, p.profiles?.email || p.user_email, String(p.amount), p.currency, p.plan_slug || p.plan, p.status, p.created_at?.slice(0, 10)])
  const toolsCsv = useCsvExport(() => adminApi.tools(), "tool-usage-report.csv", ["Tool", "Usage Count", "Credits Cost", "Model"], (t: any) => [t.tool_name || t.name, String(t.usage_count || 0), String(t.credits_cost), t.default_model || t.model])
  const modelsCsv = useCsvExport(() => adminApi.models(), "ai-cost-report.csv", ["Model", "Provider", "Cost Input", "Cost Output"], (m: any) => [m.model_name || m.name, m.provider, String(m.cost_input || 0), String(m.cost_output || 0)])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Reports</h1><p className="text-sm text-muted mt-1">Generate and export admin reports</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { ...reportTypes[0], csv: usersCsv },
          { ...reportTypes[1], csv: paymentsCsv },
          { ...reportTypes[2], csv: toolsCsv },
          { ...reportTypes[3], csv: modelsCsv },
        ].map((report) => {
          const Icon = report.icon
          return (
            <div key={report.label} className="glass-card rounded-xl p-5 hover:glass-card-hover transition-all">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${report.color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold mb-1">{report.label}</h3>
              <p className="text-xs text-muted mb-4">{report.desc}</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5 justify-start" onClick={report.csv.exportCsv} disabled={report.csv.loading}>
                  <Download className="w-3.5 h-3.5" /> {report.csv.loading ? "Exporting..." : "Export CSV"}
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5 justify-start" onClick={() => { setPdfLabel(report.label); setShowPdfModal(true) }}>
                  <FileText className="w-3.5 h-3.5" /> Export PDF
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <AdminModal open={showPdfModal} onClose={() => setShowPdfModal(false)} title="PDF Export" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted">PDF export for &ldquo;{pdfLabel}&rdquo; will be available once a PDF generation library is integrated.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowPdfModal(false)}>Close</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
