"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus, Edit3, Check, X, CreditCard, Loader2, Zap } from "lucide-react"

interface Plan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  credits: number
  features: string[]
  is_active: boolean
  created_at: string
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formState, setFormState] = useState({
    name: "", slug: "free", price_monthly: 0, price_yearly: 0, credits: 0, features: "", is_active: true,
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
    setFormState({ name: "", slug: "free", price_monthly: 0, price_yearly: 0, credits: 100, features: "", is_active: true })
    setShowModal(true)
  }

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormState({
      name: plan.name || "", slug: plan.slug || "free",
      price_monthly: plan.price_monthly || 0, price_yearly: plan.price_yearly || 0,
      credits: plan.credits || 0,
      features: Array.isArray(plan.features) ? plan.features.join(", ") : (plan.features as any || ""),
      is_active: plan.is_active ?? true,
    })
    setShowModal(true)
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const body = {
        ...formState,
        price_monthly: Number(formState.price_monthly),
        price_yearly: Number(formState.price_yearly) || Number(formState.price_monthly) * 10,
        credits: Number(formState.credits),
        features: formState.features.split(",").map(s => s.trim()).filter(Boolean),
      }
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
      const body = {
        ...formState,
        price_monthly: Number(formState.price_monthly),
        price_yearly: Number(formState.price_yearly),
        credits: Number(formState.credits),
        features: formState.features.split(",").map(s => s.trim()).filter(Boolean),
      }
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
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.12] transition-all relative overflow-hidden"
          >
            {plan.price_monthly === 0 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-medium text-[#22C55E]">
                Free
              </div>
            )}
            {!plan.is_active && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[10px] font-medium text-[#EF4444]">
                Disabled
              </div>
            )}

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center mb-4 shadow-lg">
              {plan.price_monthly >= 79 ? <Zap className="w-6 h-6 text-white" /> : <CreditCard className="w-6 h-6 text-white" />}
            </div>

            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold text-white">${plan.price_monthly}</span>
              <span className="text-sm text-[#A7B0C0]">/month</span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#A7B0C0]">
              <span className="font-medium text-white">{plan.credits}</span> credits / month
            </div>

            <div className="mt-6 space-y-3">
              {(plan.features || []).map((feature: string, fi: number) => (
                <div key={fi} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span className="text-xs text-[#A7B0C0]">{feature}</span>
                </div>
              ))}
              {!plan.features?.length && (
                <p className="text-xs text-[#A7B0C0]/50 italic">No features configured</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#A7B0C0]">
                <span className={`w-2 h-2 rounded-full ${plan.is_active ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />
                {plan.is_active ? "Active" : "Disabled"}
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
                    <option value="agency">Agency</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Price ($/month)</label>
                  <input type="number" value={formState.price_monthly} onChange={e => setFormState(f => ({ ...f, price_monthly: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Credits / Month</label>
                  <input type="number" value={formState.credits} onChange={e => setFormState(f => ({ ...f, credits: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Price ($/year)</label>
                  <input type="number" value={formState.price_yearly} onChange={e => setFormState(f => ({ ...f, price_yearly: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Features (comma-separated)</label>
                <textarea value={formState.features} onChange={e => setFormState(f => ({ ...f, features: e.target.value }))} rows={3} className="w-full px-4 py-2 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 resize-none" placeholder="AI Writer, Keyword Research, 10 projects" />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <label className="text-xs font-medium text-[#A7B0C0]">Active</label>
                <button onClick={() => setFormState(f => ({ ...f, is_active: !f.is_active }))} className={`relative w-11 h-6 rounded-full transition-colors ${formState.is_active ? "bg-[#22C55E]" : "bg-white/[0.06]"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${formState.is_active ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </button>
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
