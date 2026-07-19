"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit3, Trash2, Star, Cpu, Brain, Globe, Bot, Loader2, Box, X } from "lucide-react"

interface AIModel {
  id: string
  provider_id: string
  display_name: string
  model_name: string
  provider_model_id: string
  is_enabled: boolean
  is_default: boolean
  cost_input: number
  cost_output: number
  max_tokens: number
  config: Record<string, any>
  created_at: string
  updated_at: string
  providers: { name: string; slug: string } | null
}

const providerColors: Record<string, string> = {
  openai: "from-emerald-500 to-teal-600",
  google: "from-blue-500 to-cyan-600",
  anthropic: "from-purple-500 to-pink-600",
  deepseek: "from-orange-500 to-red-600",
  "self-hosted": "from-zinc-500 to-zinc-600",
}

const providerIcons: Record<string, any> = {
  openai: Bot, google: Globe, anthropic: Brain, deepseek: Cpu, "self-hosted": Cpu,
}

export default function ModelsPage() {
  const [models, setModels] = useState<AIModel[]>([])
  const [filterType, setFilterType] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<AIModel | null>(null)
  const [formName, setFormName] = useState("")
  const [formProvider, setFormProvider] = useState("openai")
  const [formModelId, setFormModelId] = useState("")
  const [formEnabled, setFormEnabled] = useState(true)
  const [formDefault, setFormDefault] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [actionError, setActionError] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchModels = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/models")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setModels(Array.isArray(json) ? json : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchModels() }, [fetchModels])

  const allTypes = useMemo(() => Array.from(new Set(models.map(m => m.providers?.slug || "unknown"))), [models])

  const filtered = filterType === "all" ? models : models.filter(m => (m.providers?.slug || "unknown") === filterType)

  const openCreate = () => {
    setEditingModel(null)
    setFormName("")
    setFormProvider("openai")
    setFormModelId("")
    setFormEnabled(true)
    setFormDefault(false)
    setSaveError("")
    setModalOpen(true)
  }

  const openEdit = (m: AIModel) => {
    setEditingModel(m)
    setFormName(m.display_name)
    setFormProvider(m.providers?.slug || "openai")
    setFormModelId(m.model_name)
    setFormEnabled(m.is_enabled)
    setFormDefault(m.is_default)
    setSaveError("")
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    try {
      if (editingModel) {
        const res = await fetch(`/api/admin/models/${editingModel.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_name: formName,
            provider_id: editingModel.provider_id,
            model_name: formModelId,
            is_enabled: formEnabled,
            is_default: formDefault,
          }),
        })
        if (!res.ok) throw new Error("Failed to update model")
      } else {
        const res = await fetch("/api/admin/models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_name: formName,
            provider_id: formProvider,
            model_name: formModelId,
            is_enabled: formEnabled,
            is_default: formDefault,
          }),
        })
        if (!res.ok) throw new Error("Failed to create model")
      }
      setModalOpen(false)
      await fetchModels()
    } catch (err: any) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStar = async (m: AIModel) => {
    setActionError("")
    try {
      const res = await fetch(`/api/admin/models/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: true }),
      })
      if (!res.ok) throw new Error("Failed to set default")
      await fetchModels()
    } catch (e: any) { setActionError(e.message) }
  }

  const handleDelete = async (id: string) => {
    setActionError("")
    try {
      const res = await fetch(`/api/admin/models/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setDeleteId(null)
      await fetchModels()
    } catch (e: any) { setActionError(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Models</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage AI models, parameters, and costs</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Add Model
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilterType("all")}
          className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${filterType === "all" ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>All</button>
        {allTypes.map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${filterType === t ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>{t}</button>
        ))}
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
            <span className="ml-3 text-sm text-[#A7B0C0]">Loading models...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center mb-3">
              <Box className="w-6 h-6 text-[#EF4444]" />
            </div>
            <p className="text-sm text-[#EF4444] font-medium">Failed to load models</p>
            <p className="text-xs text-[#A7B0C0] mt-1">{error}</p>
            <button onClick={fetchModels} className="mt-3 px-4 py-1.5 rounded-xl bg-[#6D5EF5]/10 text-[#6D5EF5] text-xs font-medium hover:bg-[#6D5EF5]/20 transition-colors">
              Retry
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-[#A7B0C0]">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Provider</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Box className="w-10 h-10 text-[#A7B0C0]/30 mx-auto mb-3" />
                    <p className="text-sm text-[#A7B0C0]">No models found</p>
                  </td>
                </tr>
              ) : filtered.map((m, i) => {
                const providerSlug = m.providers?.slug || "unknown"
                const Icon = providerIcons[providerSlug] || Cpu
                return (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${providerColors[providerSlug] || "from-[#6D5EF5] to-[#8B5CF6]"}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{m.display_name}</p>
                          <p className="text-[10px] text-[#A7B0C0] font-mono">{m.model_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-white">{m.providers?.name || "Unknown"}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#151C2E] border border-white/[0.06] text-[#A7B0C0]">{providerSlug}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        m.is_enabled ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.is_enabled ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
                        {m.is_enabled ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(m)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                        {!m.is_default && <button onClick={() => handleStar(m)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-[#F59E0B] transition-all"><Star className="w-3.5 h-3.5" /></button>}
                        <button onClick={() => setDeleteId(m.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#151C2E] border border-white/[0.06] rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">{editingModel ? "Edit Model" : "Add Model"}</h3>
                <button onClick={() => setModalOpen(false)} className="text-[#A7B0C0] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C0] mb-1.5">Display Name</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. GPT-4o"
                    className="w-full h-10 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm outline-none focus:border-[#6D5EF5] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C0] mb-1.5">Provider</label>
                  <select value={formProvider} onChange={(e) => setFormProvider(e.target.value)} disabled={!!editingModel}
                    className="w-full h-10 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm outline-none focus:border-[#6D5EF5] transition-colors disabled:opacity-50">
                    <option value="openai">OpenAI</option>
                    <option value="google">Google</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="self-hosted">Self-Hosted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C0] mb-1.5">Model ID</label>
                  <input value={formModelId} onChange={(e) => setFormModelId(e.target.value)} placeholder="e.g. gpt-4o"
                    className="w-full h-10 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm outline-none focus:border-[#6D5EF5] transition-colors font-mono" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formEnabled} onChange={(e) => setFormEnabled(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#090B16] border border-white/[0.06] text-[#6D5EF5] focus:ring-[#6D5EF5]" />
                    <span className="text-xs text-white">Enabled</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formDefault} onChange={(e) => setFormDefault(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#090B16] border border-white/[0.06] text-[#6D5EF5] focus:ring-[#6D5EF5]" />
                    <span className="text-xs text-white">Default</span>
                  </label>
                </div>
                {saveError && <p className="text-xs text-[#EF4444]">{saveError}</p>}
              </div>
              <div className="flex items-center justify-end gap-2 mt-6">
                <button onClick={() => setModalOpen(false)} className="h-9 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving || !formName || !formModelId} className="h-9 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingModel ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#151C2E] border border-white/[0.06] rounded-xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-[#EF4444]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Delete Model</h3>
                  <p className="text-xs text-[#A7B0C0]">This action cannot be undone</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setDeleteId(null)} className="h-9 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="h-9 px-4 rounded-xl bg-[#EF4444] text-white text-xs font-medium hover:bg-[#EF4444]/80 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {actionError && (
        <div className="fixed bottom-4 right-4 bg-[#EF4444]/90 backdrop-blur-xl text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50">
          {actionError}
        </div>
      )}
    </div>
  )
}
