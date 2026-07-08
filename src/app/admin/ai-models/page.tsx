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
import { formatCurrency } from "@/lib/admin-utils"
import { Cpu, Edit3, Key, CheckCircle } from "lucide-react"

const providerColors: Record<string, string> = {
  OpenAI: "from-emerald-500 to-teal-600",
  Google: "from-blue-500 to-cyan-600",
  Anthropic: "from-purple-500 to-pink-600",
  DeepSeek: "from-orange-500 to-red-600",
  "Self-Hosted": "from-zinc-500 to-zinc-600",
}

export default function AiModelsPage() {
  const {data: models, loading, error, refetch} = useData(() => adminApi.models())
  const [editModel, setEditModel] = useState<any>(null)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [keyValue, setKeyValue] = useState("")
  const [editForm, setEditForm] = useState({ api_key_placeholder: "", enabled: true, fallback: false })

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const handleSaveKey = async () => {
    if (!editModel || !keyValue) return
    try {
      await adminApi.updateModel(editModel.id, { api_key_placeholder: keyValue })
      setShowKeyModal(false)
      setKeyValue("")
      setEditModel(null)
      refetch()
    } catch (e) { console.error(e) }
  }

  const handleSaveEdit = async () => {
    if (!editModel) return
    try {
      await adminApi.updateModel(editModel.id, editForm)
      setShowEditModal(false)
      setEditModel(null)
      refetch()
    } catch (e) { console.error(e) }
  }

  const openApiKey = (model: any) => {
    setEditModel(model)
    setKeyValue(model.api_key_placeholder || "")
    setShowKeyModal(true)
  }

  const openEdit = (model: any) => {
    setEditModel(model)
    setEditForm({ api_key_placeholder: model.api_key_placeholder || "", enabled: model.enabled, fallback: model.fallback || false })
    setShowEditModal(true)
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">AI Models</h1><p className="text-sm text-muted mt-1">Manage AI provider models and API keys</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(models || []).map((model: any) => (
          <div key={model.id} className="glass-card rounded-xl p-4 hover:glass-card-hover transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br", providerColors[model.provider] || "from-primary to-accent")}>
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{model.name}</h3>
                  <p className="text-[10px] text-muted">{model.provider}</p>
                </div>
              </div>
              <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", model.enabled ? "bg-success/10 text-success border-success/20" : "bg-muted/10 text-muted border-muted/20")}>
                {model.enabled ? "Active" : "Disabled"}
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted">API Key</span><span className="font-mono text-[10px]">{model.api_key_placeholder}••••</span></div>
              <div className="flex justify-between"><span className="text-muted">Cost/Request</span><span className="font-medium">{formatCurrency(model.cost_per_request)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Monthly Cost</span><span className="font-medium">{formatCurrency(model.monthly_cost)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Usage</span><span className="font-medium">{model.usage_count.toLocaleString()}</span></div>
            </div>

            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Default For</p>
              <div className="flex flex-wrap gap-1">
                {model.default_for.length > 0 ? model.default_for.map((tool: any) => (
                  <Badge key={tool} variant="info" size="sm">{tool.replace(/_/g, " ")}</Badge>
                )) : <span className="text-[10px] text-muted">None</span>}
              </div>
            </div>

            {model.fallback && (
              <div className="flex items-center gap-1 mt-2 text-[10px] text-warning">
                <CheckCircle className="w-3 h-3" /> Fallback model
              </div>
            )}

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <Button variant="outline" size="sm" className="rounded-lg flex-1 gap-1.5" onClick={() => openApiKey(model)}><Key className="w-3.5 h-3.5" /> API Key</Button>
              <Button variant="outline" size="sm" className="rounded-lg flex-1 gap-1.5" onClick={() => openEdit(model)}><Edit3 className="w-3.5 h-3.5" /> Edit</Button>
            </div>
          </div>
        ))}
      </div>

      <AdminModal open={showKeyModal} onClose={() => setShowKeyModal(false)} title={`API Key: ${editModel?.name || ""}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">API Key Value</label>
            <Input value={keyValue} onChange={(e) => setKeyValue(e.target.value)} placeholder="sk-..." className="bg-card border-border text-xs font-mono" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowKeyModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleSaveKey}>Save Key</Button>
          </div>
        </div>
      </AdminModal>

      <AdminModal open={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit: ${editModel?.name || "Model"}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">API Key Placeholder</label>
            <Input value={editForm.api_key_placeholder} onChange={(e) => setEditForm(f => ({ ...f, api_key_placeholder: e.target.value }))} className="bg-card border-border text-xs" />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input type="checkbox" checked={editForm.enabled} onChange={(e) => setEditForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded border-border" />
              Enabled
            </label>
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input type="checkbox" checked={editForm.fallback} onChange={(e) => setEditForm(f => ({ ...f, fallback: e.target.checked }))} className="rounded border-border" />
              Fallback
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
