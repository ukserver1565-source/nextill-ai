"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus, Edit3, Check, X, Users, CreditCard, Loader2, Zap } from "lucide-react"

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any | null>(null)
  const [formState, setFormState] = useState({
    name: "", slug: "free", price: 0, monthly_credits: 0,
    description: "", max_projects: 0, max_users: 0, tool_access: "",
  })
  const [saving, setSaving] = useState(false)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/plans")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setPlans(Array.isArray(json) ? json : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  const openCreate = () => {
    setEditingPlan(null)
    setFormState({ name: "", slug: "free", price: 0, monthly_credits: 0, description: "", max_projects: 0, max_users: 0, tool_access: "" })
    setShowModal(true)
  }

  const openEdit = (plan: any) => {
    setEditingPlan(plan)
    setFormState({
      name: plan.name || "", slug: plan.slug || "free", price: plan.price || 0,
      monthly_credits: plan.monthly_credits || 0, description: plan.description || "",
      max_projects: plan.max_projects || 0, max_users: plan.max_users || 0,
      tool_access: Array.isArray(plan.tool_access) ? plan.tool_access.join(", ") : (plan.tool_access || ""),
    })
    setShowModal(true)
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const body = { ...formState, tool_access: formState.tool_access.split(",").map(s => s.trim()).filter(Boolean) }
      const res = await fetch("/api/admin/plans", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to create plan")
      setShowModal(false)
      fetchPlans()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingPlan) return
    setSaving(true)
    try {
      const body = { ...formState, tool_access: formState.tool_access.split(",").map(s => s.trim()).filter(Boolean) }
      const res = await fetch(`/api/admin/plans/${editingPlan.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to update plan")
      setShowModal(false)
      setEditingPlan(null)
      fetchPlans()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
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
          <p className="text-sm text-[#EF4444] mb-3">Failed to load plans</p>
          <p className="text-xs text-[#A7B0C0] mb-4">{error}</p>
          <button onClick={fetchPlans} className="h-9 px-4 rounded-xl bg-[#6D5EF5] text-white text-xs font-medium hover:opacity-90 transition-opacity">
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
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage subscription plans and pricing</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {plans.length === 0 && (
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-12 text-center">
          <CreditCard className="w-8 h-8 text-[#A7B0C0] mx-auto mb-3" />
          <p className="text-sm text-[#A7B0C0]">No plans created yet</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan: any, i: number) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.12] transition-all relative overflow-hidden"
          >
            {plan.price === 0 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-medium text-[#22C55E]">
                Free
              </div>
            )}
            {!plan.enabled && plan.price > 0 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[10px] font-medium text-[#EF4444]">
                Disabled
              </div>
            )}

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center mb-4 shadow-lg">
              {plan.priority === "high" ? <Zap className="w-6 h-6 text-white" /> : <CreditCard className="w-6 h-6 text-white" />}
            </div>

            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold text-white">{plan.currency === "USD" ? "$" : plan.currency}{plan.price}</span>
              <span className="text-sm text-[#A7B0C0]">/month</span>
            </div>
            <p className="text-xs text-[#A7B0C0] mt-2">{plan.description || "No description"}</p>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#A7B0C0]">
              <span className="font-medium text-white">{plan.monthly_credits}</span> credits / month
            </div>
            {plan.max_projects && (
              <div className="mt-1 text-xs text-[#A7B0C0]">
                Max <span className="font-medium text-white">{plan.max_projects}</span> projects · <span className="font-medium text-white">{plan.max_users}</span> users
              </div>
            )}

            <div className="mt-6 space-y-3">
              {(plan.tool_access || []).map((tool: string, fi: number) => (
                <div key={fi} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span className="text-xs text-[#A7B0C0]">{tool}</span>
                </div>
              ))}
              {!plan.tool_access?.length && (
                <p className="text-xs text-[#A7B0C0]/50 italic">No tool access configured</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#A7B0C0]">
                <span className={`w-2 h-2 rounded-full ${plan.enabled ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />
                {plan.enabled ? "Active" : "Disabled"}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-[#090B16] border border-white/[0.06] rounded-xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingPlan ? "Edit Plan" : "Add Plan"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#A7B0C0] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Name</label>
                <input value={formState.name} onChange={e => setFormState(f => ({ ...f, name: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Slug</label>
                  <select value={formState.slug} onChange={e => setFormState(f => ({ ...f, slug: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="agency">Agency</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Price ($)</label>
                  <input type="number" value={formState.price} onChange={e => setFormState(f => ({ ...f, price: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Monthly Credits</label>
                  <input type="number" value={formState.monthly_credits} onChange={e => setFormState(f => ({ ...f, monthly_credits: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Max Projects</label>
                  <input type="number" value={formState.max_projects} onChange={e => setFormState(f => ({ ...f, max_projects: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Max Users</label>
                  <input type="number" value={formState.max_users} onChange={e => setFormState(f => ({ ...f, max_users: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Description</label>
                <textarea value={formState.description} onChange={e => setFormState(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Tool Access (comma-separated)</label>
                <input value={formState.tool_access} onChange={e => setFormState(f => ({ ...f, tool_access: e.target.value }))} placeholder="ai_writer, keyword_research, seo_analyzer" className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
              <button onClick={editingPlan ? handleUpdate : handleCreate} disabled={saving} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingPlan ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
