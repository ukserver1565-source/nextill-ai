"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Copy, Edit3, Trash2, ChevronLeft, ChevronRight, Tag, Loader2, X } from "lucide-react"

const PAGE_SIZE = 8

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null)
  const [formState, setFormState] = useState({ code: "", type: "percentage", value: 0, expiry_date: "", usage_limit: 0, active: true })
  const [saving, setSaving] = useState(false)

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/coupons")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setCoupons(Array.isArray(json) ? json : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const filtered = coupons.filter(c => c.code?.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openCreate = () => {
    setEditingCoupon(null)
    setFormState({ code: "", type: "percentage", value: 0, expiry_date: "", usage_limit: 0, active: true })
    setShowModal(true)
  }

  const openEdit = (coupon: any) => {
    setEditingCoupon(coupon)
    setFormState({
      code: coupon.code || "", type: coupon.type || "percentage", value: coupon.value || 0,
      expiry_date: coupon.expiry_date ? coupon.expiry_date.slice(0, 10) : "",
      usage_limit: coupon.usage_limit || 0, active: coupon.active ?? true,
    })
    setShowModal(true)
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formState),
      })
      if (!res.ok) throw new Error("Failed to create coupon")
      setShowModal(false)
      fetchCoupons()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingCoupon) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formState),
      })
      if (!res.ok) throw new Error("Failed to update coupon")
      setShowModal(false)
      setEditingCoupon(null)
      fetchCoupons()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete coupon")
      fetchCoupons()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-8 text-center max-w-sm">
          <p className="text-sm text-[#EF4444] mb-3">Failed to load coupons</p>
          <p className="text-xs text-[#A7B0C0] mb-4">{error}</p>
          <button onClick={fetchCoupons} className="h-9 px-4 rounded-xl bg-[#6D5EF5] text-white text-xs font-medium hover:opacity-90 transition-opacity">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage discount coupons and promotions</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search coupons..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Code</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Discount</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Uses</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Expires</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c: any, i: number) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#6D5EF5]" />
                      <code className="px-2.5 py-1 rounded-lg bg-[#090B16] border border-white/[0.06] text-xs font-mono font-bold text-white">{c.code}</code>
                      <button onClick={() => navigator.clipboard.writeText(c.code)} className="p-1 rounded hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Copy className="w-3 h-3" /></button>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-white">{c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{c.usage_count ?? 0}/{c.usage_limit ?? "∞"}</td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : "Never"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${c.active ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-[#A7B0C0]">No coupons found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 && (
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
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-[#090B16] border border-white/[0.06] rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingCoupon ? "Edit Coupon" : "Create Coupon"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#A7B0C0] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Code</label>
                <input value={formState.code} onChange={e => setFormState(f => ({ ...f, code: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Type</label>
                  <select value={formState.type} onChange={e => setFormState(f => ({ ...f, type: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Value</label>
                  <input type="number" value={formState.value} onChange={e => setFormState(f => ({ ...f, value: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Expiry Date</label>
                  <input type="date" value={formState.expiry_date} onChange={e => setFormState(f => ({ ...f, expiry_date: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Usage Limit</label>
                  <input type="number" value={formState.usage_limit} onChange={e => setFormState(f => ({ ...f, usage_limit: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <label className="text-xs font-medium text-[#A7B0C0]">Active</label>
                <button onClick={() => setFormState(f => ({ ...f, active: !f.active }))} className={`relative w-11 h-6 rounded-full transition-colors ${formState.active ? "bg-[#22C55E]" : "bg-white/[0.06]"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${formState.active ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
              <button onClick={editingCoupon ? handleUpdate : handleCreate} disabled={saving} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingCoupon ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
