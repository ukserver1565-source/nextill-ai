"use client"

import { useState } from "react"
import { AdminTable } from "@/components/admin/admin-table"
import { AdminSearch } from "@/components/admin/admin-search"
import { AdminMetricCard } from "@/components/admin/admin-metric-card"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import type { Payment } from "@/lib/admin-types"
import { formatCurrency, statusColors, formatDate } from "@/lib/admin-utils"
import { DollarSign, TrendingUp, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminModal } from "@/components/admin/admin-modal"
import { Input } from "@/components/ui/input"
import { Download, RotateCcw } from "lucide-react"

export default function PaymentsPage() {
  const {data, loading, error, refetch} = useData(() => adminApi.payments())
  const [search, setSearch] = useState("")
  const [refundPayment, setRefundPayment] = useState<Payment | null>(null)
  const [showRefundModal, setShowRefundModal] = useState(false)

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const payments = data?.data || []
  const completedPayments = payments.filter((p: Payment) => p.status === "completed")
  const totalRevenue = completedPayments.reduce((s: number, p: Payment) => s + p.amount, 0)
  const pendingAmount = payments.filter((p: Payment) => p.status === "pending").reduce((s: number, p: Payment) => s + p.amount, 0)

  const filtered = payments.filter((p: Payment) =>
    p.userName.toLowerCase().includes(search.toLowerCase()) || p.userEmail.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: "user", label: "User", render: (p: Payment) => (
      <div><p className="text-xs font-medium">{p.userName}</p><p className="text-[10px] text-muted">{p.userEmail}</p></div>
    )},
    { key: "amount", label: "Amount", render: (p: Payment) => (
      <span className="text-xs font-bold">{formatCurrency(p.amount, p.currency)}</span>
    )},
    { key: "plan", label: "Plan", render: (p: Payment) => (
      <span className="text-[11px] capitalize">{p.plan}</span>
    )},
    { key: "status", label: "Status", render: (p: Payment) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[p.status]}`}>{p.status}</span>
    )},
    { key: "method", label: "Method", render: (p: Payment) => (
      <span className="text-[11px] text-muted">{p.method}</span>
    )},
    { key: "date", label: "Date", render: (p: Payment) => (
      <span className="text-[11px] text-muted">{formatDate(p.date)}</span>
    )},
    { key: "actions", label: "", render: (p: Payment) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" className="rounded-md" onClick={() => {
          const csv = [["User","Email","Amount","Currency","Plan","Status","Method","Date"], [p.userName,p.userEmail,p.amount,p.currency||"USD",p.plan,p.status,p.method,formatDate(p.date)]].map(r => r.join(",")).join("\n")
          const blob = new Blob([csv], { type: "text/csv" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a"); a.href = url; a.download = `invoice-${p.id}.csv`; a.click()
          URL.revokeObjectURL(url)
        }}><Download className="w-3.5 h-3.5" /></Button>
        {p.status === "completed" && (
          <Button variant="ghost" size="icon-sm" className="rounded-md text-warning" onClick={() => { setRefundPayment(p); setShowRefundModal(true) }}><RotateCcw className="w-3.5 h-3.5" /></Button>
        )}
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Payments</h1><p className="text-sm text-muted mt-1">Track payments, invoices, and refunds</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <AdminMetricCard icon={DollarSign} label="Total Revenue" value={formatCurrency(totalRevenue)} change="+18%" up index={0} color="text-green-400" />
        <AdminMetricCard icon={TrendingUp} label="Transactions" value={completedPayments.length} change="+3" up index={1} color="text-blue-400" />
        <AdminMetricCard icon={CheckCircle} label="Completed" value={completedPayments.length} change="+15%" up index={2} color="text-emerald-400" />
        <AdminMetricCard icon={XCircle} label="Pending/Failed" value={payments.filter((p: Payment) => p.status !== "completed").length} change="-1" up={false} index={3} color="text-red-400" />
      </div>

      <div className="flex items-center justify-between">
        <div className="w-full max-w-xs"><AdminSearch value={search} onChange={setSearch} placeholder="Search by user..." /></div>
        <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={() => {
          const csv = [["User","Email","Amount","Currency","Plan","Status","Method","Date"], ...filtered.map((p: Payment) => [p.userName,p.userEmail,p.amount,p.currency||"USD",p.plan,p.status,p.method,formatDate(p.date)])].map(r => r.join(",")).join("\n")
          const blob = new Blob([csv], { type: "text/csv" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a"); a.href = url; a.download = "payments.csv"; a.click()
          URL.revokeObjectURL(url)
        }}><Download className="w-3.5 h-3.5" /> Export CSV</Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <AdminTable columns={columns} data={filtered} keyField="id" />
      </div>
      <AdminModal open={showRefundModal} onClose={() => setShowRefundModal(false)} title={`Refund: ${refundPayment?.userName || ""}`} size="sm">
        <div className="space-y-4 text-sm">
          {refundPayment && (
            <>
              <div className="rounded-lg bg-card/50 p-3 border border-border text-xs">
                <p><span className="text-muted">Amount:</span> <span className="font-medium">${refundPayment.amount}</span></p>
                <p><span className="text-muted">Plan:</span> <span className="font-medium capitalize">{refundPayment.plan}</span></p>
                <p><span className="text-muted">Date:</span> <span className="font-medium">{formatDate(refundPayment.date)}</span></p>
              </div>
              <p className="text-xs text-muted">Refund processing will be available once a payment gateway is integrated.</p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowRefundModal(false)}>Close</Button>
              </div>
            </>
          )}
        </div>
      </AdminModal>
    </div>
  )
}
