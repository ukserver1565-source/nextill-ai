"use client"

import { useState } from "react"
import { AdminTable } from "@/components/admin/admin-table"
import { AdminSearch } from "@/components/admin/admin-search"
import { AdminMetricCard } from "@/components/admin/admin-metric-card"
import { AdminModal } from "@/components/admin/admin-modal"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import type { CreditLog } from "@/lib/admin-types"
import { timeAgo } from "@/lib/admin-utils"
import { Input } from "@/components/ui/input"
import { DollarSign, TrendingUp, Sparkles, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CreditsPage() {
  const [search, setSearch] = useState("")
  const {data, loading, error, refetch} = useData(() => adminApi.credits())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [creditForm, setCreditForm] = useState({ userId: "", amount: 0, description: "" })

  const logs = (data?.data || []) as any[]
  const totalCredits = logs.filter((c: any) => c.type === "added").reduce((s: number, c: any) => s + c.amount, 0) - logs.filter((c: any) => c.type === "removed").reduce((s: number, c: any) => s + c.amount, 0)
  const totalUsed = logs.filter((c: any) => c.type === "used").reduce((s: number, c: any) => s + c.amount, 0)
  const dailyUsage = logs.filter((c: any) => c.type === "used" && c.createdAt.includes("T07") || c.createdAt.includes("T08")).length
  const uniqueUsers = new Set(logs.map((c: any) => c.userId)).size

  const filtered = logs.filter((c: any) => c.userName.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const handleAddCredits = async () => {
    if (!creditForm.userId || !creditForm.amount) return
    try {
      await adminApi.addCredits({ userId: creditForm.userId, amount: creditForm.amount, description: creditForm.description || "Admin adjustment" })
      setShowAddModal(false)
      setCreditForm({ userId: "", amount: 0, description: "" })
      refetch()
    } catch (e) { console.error(e) }
  }

  const handleRemoveCredits = async () => {
    if (!creditForm.userId || !creditForm.amount) return
    try {
      await adminApi.addCredits({ userId: creditForm.userId, amount: -Math.abs(creditForm.amount), description: creditForm.description || "Admin removal" })
      setShowRemoveModal(false)
      setCreditForm({ userId: "", amount: 0, description: "" })
      refetch()
    } catch (e) { console.error(e) }
  }

  const columns = [
    { key: "user", label: "User", render: (c: CreditLog) => (
      <div>
        <p className="text-xs font-medium">{c.userName}</p>
        <p className="text-[10px] text-muted">ID: {c.userId}</p>
      </div>
    )},
    { key: "amount", label: "Amount", render: (c: CreditLog) => (
      <span className={`text-xs font-bold ${c.type === "added" ? "text-success" : c.type === "removed" ? "text-danger" : "text-warning"}`}>
        {c.type === "added" ? "+" : c.type === "removed" ? "-" : "-"}{c.amount}
      </span>
    )},
    { key: "type", label: "Type", render: (c: CreditLog) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
        c.type === "added" ? "bg-success/10 text-success border-success/20" : c.type === "removed" ? "bg-danger/10 text-danger border-danger/20" : "bg-warning/10 text-warning border-warning/20"
      }`}>{c.type}</span>
    )},
    { key: "tool", label: "Tool", render: (c: CreditLog) => (
      <span className="text-[11px] text-muted">{c.tool?.replace(/_/g, " ") || "-"}</span>
    )},
    { key: "description", label: "Description", render: (c: CreditLog) => (
      <span className="text-[11px] text-muted max-w-[200px] truncate block">{c.description}</span>
    )},
    { key: "date", label: "Date", render: (c: CreditLog) => (
      <span className="text-[11px] text-muted">{timeAgo(c.createdAt)}</span>
    )},
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Credits</h1>
        <p className="text-sm text-muted mt-1">Monitor and manage AI credit usage</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <AdminMetricCard icon={DollarSign} label="Total Credits" value={totalCredits.toLocaleString()} change="+5%" up index={0} color="text-blue-400" />
        <AdminMetricCard icon={Sparkles} label="Credits Used" value={totalUsed.toLocaleString()} change="+12%" up index={1} color="text-purple-400" />
        <AdminMetricCard icon={TrendingUp} label="Daily Usage" value={dailyUsage.toLocaleString()} change="+8%" up index={2} color="text-emerald-400" />
        <AdminMetricCard icon={Plus} label="Avg per User" value={Math.round(totalCredits / (uniqueUsers || 1)).toLocaleString()} change="+3%" up index={3} color="text-cyan-400" />
      </div>

      <div className="flex items-center justify-between">
        <div className="w-full max-w-xs">
          <AdminSearch value={search} onChange={setSearch} placeholder="Search by user..." />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={() => setShowAddModal(true)}><Plus className="w-3.5 h-3.5" /> Add Credits</Button>
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={() => setShowRemoveModal(true)}><Minus className="w-3.5 h-3.5" /> Remove Credits</Button>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <AdminTable columns={columns} data={filtered} keyField="id" />
      </div>

      <AdminModal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Credits" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">User ID</label>
            <Input value={creditForm.userId} onChange={(e) => setCreditForm(f => ({ ...f, userId: e.target.value }))} placeholder="uuid..." className="bg-card border-border text-xs font-mono" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Amount</label>
            <Input type="number" value={creditForm.amount} onChange={(e) => setCreditForm(f => ({ ...f, amount: Number(e.target.value) }))} className="bg-card border-border text-xs" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Description</label>
            <Input value={creditForm.description} onChange={(e) => setCreditForm(f => ({ ...f, description: e.target.value }))} placeholder="Admin bonus" className="bg-card border-border text-xs" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleAddCredits}>Add Credits</Button>
          </div>
        </div>
      </AdminModal>

      <AdminModal open={showRemoveModal} onClose={() => setShowRemoveModal(false)} title="Remove Credits" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">User ID</label>
            <Input value={creditForm.userId} onChange={(e) => setCreditForm(f => ({ ...f, userId: e.target.value }))} placeholder="uuid..." className="bg-card border-border text-xs font-mono" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Amount to Remove</label>
            <Input type="number" value={creditForm.amount} onChange={(e) => setCreditForm(f => ({ ...f, amount: Number(e.target.value) }))} className="bg-card border-border text-xs" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Reason</label>
            <Input value={creditForm.description} onChange={(e) => setCreditForm(f => ({ ...f, description: e.target.value }))} placeholder="Refund / adjustment" className="bg-card border-border text-xs" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowRemoveModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleRemoveCredits}>Remove Credits</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
