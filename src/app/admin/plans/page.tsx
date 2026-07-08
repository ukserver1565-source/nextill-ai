"use client"

import { useState } from "react"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import { AdminModal } from "@/components/admin/admin-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Plus, Edit3, ToggleLeft, CreditCard } from "lucide-react"

const planColorMap: Record<string, string> = {
  free: "from-zinc-500 to-zinc-600",
  starter: "from-emerald-500 to-teal-600",
  pro: "from-blue-500 to-purple-600",
  agency: "from-purple-500 to-pink-600",
  enterprise: "from-amber-500 to-orange-600",
}

const defaultForm = { name: "", slug: "free", price: 0, description: "", monthly_credits: 0, max_projects: 1, max_users: 1, tool_access: "" }

export default function PlansPage() {
  const {data, loading, error, refetch} = useData(() => adminApi.plans())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editPlan, setEditPlan] = useState<any>(null)
  const [form, setForm] = useState(defaultForm)

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const handleCreate = async () => {
    try {
      await adminApi.createPlan({
        id: form.slug,
        name: form.name,
        slug: form.slug,
        price: form.price,
        description: form.description,
        monthly_credits: form.monthly_credits,
        max_projects: form.max_projects,
        max_users: form.max_users,
        tool_access: form.tool_access.split(",").map(s => s.trim()).filter(Boolean),
        priority: "medium",
      })
      setShowCreateModal(false)
      setForm(defaultForm)
      refetch()
    } catch (e) { console.error(e) }
  }

  const handleEdit = async () => {
    if (!editPlan) return
    try {
      await adminApi.updatePlan(editPlan.id, {
        name: form.name || editPlan.name,
        price: form.price || editPlan.price,
        description: form.description || editPlan.description,
        monthly_credits: form.monthly_credits || editPlan.monthly_credits,
        max_projects: form.max_projects || editPlan.max_projects,
        max_users: form.max_users || editPlan.max_users,
        tool_access: form.tool_access ? form.tool_access.split(",").map((s: string) => s.trim()).filter(Boolean) : editPlan.tool_access,
      })
      setShowEditModal(false)
      setEditPlan(null)
      setForm(defaultForm)
      refetch()
    } catch (e) { console.error(e) }
  }

  const openEdit = (plan: any) => {
    setEditPlan(plan)
    setForm({
      name: plan.name,
      slug: plan.slug,
      price: plan.price,
      description: plan.description || "",
      monthly_credits: plan.monthly_credits || plan.monthlyCredits || 0,
      max_projects: plan.max_projects || plan.maxProjects || 1,
      max_users: plan.max_users || plan.maxUsers || 1,
      tool_access: (plan.tool_access || plan.toolAccess || []).join(", "),
    })
    setShowEditModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
          <p className="text-sm text-muted mt-1">Manage subscription plans and pricing</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5 rounded-lg" onClick={() => { setForm(defaultForm); setShowCreateModal(true) }}>
          <Plus className="w-4 h-4" /> Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(data || []).map((plan: any) => (
          <div key={plan.id} className="glass-card rounded-xl p-5 hover:glass-card-hover transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", planColorMap[plan.slug])}>
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                plan.enabled ? "bg-success/10 text-success border-success/20" : "bg-muted/10 text-muted border-muted/20"
              )}>
                {plan.enabled ? "Active" : "Disabled"}
              </div>
            </div>
            <h3 className="text-lg font-bold">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-sm text-muted">/month</span>
            </div>
            <p className="text-xs text-muted mt-2">{plan.description}</p>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Monthly Credits</span>
                <span className="font-medium">{(plan.monthly_credits || plan.monthlyCredits || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Max Projects</span>
                <span className="font-medium">{plan.max_projects === 999 || plan.maxProjects === 999 ? "∞" : (plan.max_projects || plan.maxProjects || 0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Max Users</span>
                <span className="font-medium">{plan.max_users === 999 || plan.maxUsers === 999 ? "∞" : (plan.max_users || plan.maxUsers || 0)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Tool Access</p>
              <div className="flex flex-wrap gap-1">
                {(plan.tool_access || plan.toolAccess || []).map((tool: string) => (
                  <Badge key={tool} variant="info" size="sm">{tool.replace(/_/g, " ")}</Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="sm" className="rounded-lg flex-1 gap-1.5" onClick={() => openEdit(plan)}>
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg gap-1.5" onClick={async () => {
                try { await adminApi.updatePlan(plan.id, { enabled: !plan.enabled }); refetch() } catch (e) { console.error(e) }
              }}>
                <ToggleLeft className="w-3.5 h-3.5" /> {plan.enabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AdminModal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Plan" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Name</label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Pro" className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Slug</label>
              <select value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-card border border-border text-xs outline-none">
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="agency">Agency</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Price ($/month)</label>
              <Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Monthly Credits</label>
              <Input type="number" value={form.monthly_credits} onChange={(e) => setForm(f => ({ ...f, monthly_credits: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Max Projects</label>
              <Input type="number" value={form.max_projects} onChange={(e) => setForm(f => ({ ...f, max_projects: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Max Users</label>
              <Input type="number" value={form.max_users} onChange={(e) => setForm(f => ({ ...f, max_users: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Description</label>
            <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Best for professionals..." className="bg-card border-border text-xs" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Tool Access (comma-separated slugs)</label>
            <Input value={form.tool_access} onChange={(e) => setForm(f => ({ ...f, tool_access: e.target.value }))} placeholder="ai_writer, keyword_research" className="bg-card border-border text-xs" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleCreate}>Create Plan</Button>
          </div>
        </div>
      </AdminModal>

      <AdminModal open={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit: ${editPlan?.name || ""}`} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Name</label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Price ($/month)</label>
              <Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Monthly Credits</label>
              <Input type="number" value={form.monthly_credits} onChange={(e) => setForm(f => ({ ...f, monthly_credits: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Max Projects</label>
              <Input type="number" value={form.max_projects} onChange={(e) => setForm(f => ({ ...f, max_projects: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Description</label>
            <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="bg-card border-border text-xs" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Tool Access</label>
            <Input value={form.tool_access} onChange={(e) => setForm(f => ({ ...f, tool_access: e.target.value }))} className="bg-card border-border text-xs" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
