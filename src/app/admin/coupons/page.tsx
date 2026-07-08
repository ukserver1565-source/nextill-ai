"use client"

import { useState } from "react"
import { AdminTable } from "@/components/admin/admin-table"
import { AdminModal } from "@/components/admin/admin-modal"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import type { Coupon } from "@/lib/admin-types"
import { formatDate } from "@/lib/admin-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit3, Trash2, Copy } from "lucide-react"

const defaultForm = { code: "", type: "percentage" as "percentage" | "fixed", value: 0, expiry_date: "", usage_limit: 1, active: true }

export default function CouponsPage() {
  const {data: coupons, loading, error, refetch} = useData(() => adminApi.coupons())
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [form, setForm] = useState(defaultForm)

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const handleSave = async () => {
    try {
      if (editingCoupon) {
        await adminApi.updateCoupon(editingCoupon.id, form)
      } else {
        const payload = { ...form }
        if (payload.expiry_date) {
          (payload as any).expiry_date = new Date(payload.expiry_date).toISOString()
        }
        await adminApi.createCoupon(payload as any)
      }
      setShowModal(false)
      setEditingCoupon(null)
      setForm(defaultForm)
      refetch()
    } catch (e) { console.error(e) }
  }

  const openEdit = (c: any) => {
    setEditingCoupon(c)
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      expiry_date: c.expiry_date ? c.expiry_date.split("T")[0] : "",
      usage_limit: c.usage_limit,
      active: c.active,
    })
    setShowModal(true)
  }

  const openNew = () => {
    setEditingCoupon(null)
    setForm(defaultForm)
    setShowModal(true)
  }

  const columns = [
    { key: "code", label: "Code", render: (c: Coupon) => (
      <div className="flex items-center gap-2">
        <code className="px-2 py-0.5 rounded bg-card border border-border text-xs font-mono font-bold">{c.code}</code>
        <button className="p-0.5 text-muted hover:text-foreground" onClick={() => navigator.clipboard.writeText(c.code)}><Copy className="w-3 h-3" /></button>
      </div>
    )},
    { key: "type", label: "Type", render: (c: Coupon) => (
      <span className="text-xs capitalize">{c.type}</span>
    )},
    { key: "value", label: "Value", render: (c: Coupon) => (
      <span className="text-xs font-bold">{c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</span>
    )},
    { key: "usage", label: "Usage", render: (c: any) => (
      <span className="text-xs">{c.usage_count}/{c.usage_limit}</span>
    )},
    { key: "expiry", label: "Expires", render: (c: any) => (
      <span className="text-[11px] text-muted">{formatDate(c.expiry_date)}</span>
    )},
    { key: "active", label: "Status", render: (c: Coupon) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.active ? "bg-success/10 text-success border-success/20" : "bg-muted/10 text-muted border-muted/20"}`}>
        {c.active ? "Active" : "Inactive"}
      </span>
    )},
    { key: "actions", label: "", className: "text-right", render: (c: Coupon) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}><Edit3 className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="text-danger" onClick={async () => {
          if (confirm(`Delete coupon ${c.code}?`)) { try { await adminApi.deleteCoupon(c.id); refetch() } catch (e) { console.error(e) } }
        }}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Coupons</h1><p className="text-sm text-muted mt-1">Manage discount coupons and promotions</p></div>
        <Button variant="gradient" size="sm" className="gap-1.5 rounded-lg" onClick={openNew}><Plus className="w-4 h-4" /> Create Coupon</Button>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <AdminTable columns={columns} data={coupons || []} keyField="id" />
      </div>

      <AdminModal open={showModal} onClose={() => setShowModal(false)} title={editingCoupon ? "Edit Coupon" : "Create Coupon"} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Code</label>
              <Input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" className="bg-card border-border text-xs font-mono uppercase" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as "percentage" | "fixed" }))} className="w-full h-10 px-3 rounded-lg bg-card border border-border text-xs outline-none">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Value</label>
              <Input type="number" value={form.value} onChange={(e) => setForm(f => ({ ...f, value: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Usage Limit</label>
              <Input type="number" value={form.usage_limit} onChange={(e) => setForm(f => ({ ...f, usage_limit: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Expiry Date</label>
            <Input type="date" value={form.expiry_date} onChange={(e) => setForm(f => ({ ...f, expiry_date: e.target.value }))} className="bg-card border-border text-xs" />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded border-border" />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleSave}>{editingCoupon ? "Save Changes" : "Create Coupon"}</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
