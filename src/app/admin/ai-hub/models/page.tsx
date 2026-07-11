"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Bot, Brain, Cpu, Globe, Search, Plus, Star, Edit3, Trash2, Check, X, Loader2 } from "lucide-react"

const providerColors: Record<string, string> = {
  "openai": "from-emerald-500 to-teal-500", "claude": "from-purple-500 to-pink-500",
  "gemini": "from-blue-500 to-cyan-500", "deepseek": "from-orange-500 to-red-500",
  "perplexity": "from-[#4CC9F0] to-blue-500", "mistral": "from-zinc-500 to-zinc-600",
  "grok": "from-rose-500 to-pink-600", "openrouter": "from-amber-500 to-yellow-600",
  "groq": "from-[#6D5EF5] to-[#8B5CF6]", "together": "from-violet-500 to-purple-600",
}

const providerIcons: Record<string, any> = {
  "openai": Bot, "claude": Brain, "gemini": Globe, "deepseek": Cpu,
  "perplexity": Globe, "mistral": Brain, "grok": Cpu, "openrouter": Globe,
  "groq": Cpu, "together": Cpu,
}

export default function AIHubModelsPage() {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filterProvider, setFilterProvider] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ name: "", provider: "openai", temperature: 0.7, maxTokens: 4096, streaming: true, enabled: true })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/ai/models")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setModels(Array.isArray(json) ? json : json.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const allProviders = useMemo(() => Array.from(new Set(models.map((m: any) => m.provider))), [models])

  const filtered = models.filter((m: any) => {
    if (filterProvider !== "All" && m.provider !== filterProvider) return false
    if (search && !(m.model_name || m.display_name || "").toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSetDefault = async (id: string) => {
    try {
      await fetch("/api/admin/ai/models/set-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setModels(prev => prev.map((m: any) => ({ ...m, is_default: m.id === id })))
    } catch (e) { console.error("[ai-models] error:", e) }


  const handleToggle = async (id: string) => {
    setModels(prev => prev.map((m: any) => m.id === id ? { ...m, is_enabled: !m.is_enabled } : m))
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/ai/models/${id}`, { method: "DELETE" })
      setModels(prev => prev.filter((m: any) => m.id !== id))
    } catch (e) { console.error("[ai-models] error:", e) }


  const openEdit = (m: any) => {
    setEditItem(m)
    setForm({
      name: m.display_name || m.model_name || "",
      provider: m.provider || "openai",
      temperature: m.temperature ?? 0.7,
      maxTokens: m.max_tokens ?? 4096,
      streaming: m.streaming ?? true,
      enabled: m.is_enabled ?? true,
    })
    setShowEditModal(true)
  }

  const handleAdd = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: form.name,
          model_name: form.name,
          provider: form.provider,
          is_enabled: form.enabled,
          max_tokens: form.maxTokens,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setShowAddModal(false)
      fetchData()
    } catch {}
    setSaving(false)
  }

  const handleEditSave = async () => {
    if (!editItem) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editItem.id,
          display_name: form.name,
          model_name: form.name,
          provider: form.provider,
          is_enabled: form.enabled,
          max_tokens: form.maxTokens,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setShowEditModal(false)
      fetchData()
    } catch {}
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Models</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Configure AI models, parameters, defaults, and streaming settings</p>
        </div>
        <button
          onClick={() => { setForm({ name: "", provider: "openai", temperature: 0.7, maxTokens: 4096, streaming: true, enabled: true }); setShowAddModal(true) }}
          className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20"
        >
          <Plus className="w-4 h-4" /> Add Model
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
          <input
            type="text" placeholder="Search models..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterProvider("All")}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${filterProvider === "All" ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}
          >All</button>
          {allProviders.map(p => (
            <button
              key={p}
              onClick={() => setFilterProvider(p)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${filterProvider === p ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}
            >{p}</button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#6D5EF5] animate-spin mb-4" />
          <p className="text-sm text-[#A7B0C0]">Loading models...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm font-medium text-[#EF4444] mb-1">Failed to load models</p>
          <p className="text-xs text-[#A7B0C0]">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs text-[#A7B0C0]">
                  <th className="text-left p-4 font-medium">Model Name</th>
                  <th className="text-left p-4 font-medium">Provider</th>
                  <th className="text-left p-4 font-medium">Default</th>
                  <th className="text-left p-4 font-medium">Enabled</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Brain className="w-12 h-12 text-[#A7B0C0] mx-auto mb-4" />
                      <p className="text-sm font-medium text-[#A7B0C0] mb-1">No models found</p>
                      <p className="text-xs text-[#A7B0C0]">Add your first model or change the filter</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((m: any, i: number) => {
                    const Icon = providerIcons[m.provider?.toLowerCase()] || Cpu
                    const color = providerColors[m.provider?.toLowerCase()] || "from-[#6D5EF5] to-[#8B5CF6]"
                    return (
                      <motion.tr
                        key={m.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4">
                          <span className="text-sm font-medium text-white">{m.display_name || m.model_name}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${color}`}>
                              <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs text-white">{m.provider}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {m.is_default ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                              <Star className="w-3 h-3" /> Default
                            </span>
                          ) : (
                            <span className="text-[#A7B0C0] text-xs">—</span>
                          )}
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
                            <button onClick={() => openEdit(m)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {!m.is_default && (
                              <button onClick={() => handleSetDefault(m.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-[#F59E0B] transition-all">
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={() => handleToggle(m.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all">
                              {m.is_enabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => handleDelete(m.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151C2E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-white mb-1">Add Model</h2>
            <p className="text-xs text-[#A7B0C0] mb-5">Register a new AI model</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A7B0C0] mb-1.5">Model Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="GPT-4o" className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-[#A7B0C0] mb-1.5">Provider</label>
                  <select value={form.provider} onChange={(e) => setForm(f => ({ ...f, provider: e.target.value }))} className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors">
                    {allProviders.length > 0 ? allProviders.map(p => <option key={p} value={p}>{p}</option>) : <option value="openai">openai</option>}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer">
                  <input type="checkbox" checked={form.enabled} onChange={(e) => setForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded border-white/[0.06] bg-[#090B16]" />
                  Enabled
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => setShowAddModal(false)} className="h-10 px-4 rounded-xl border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors">Cancel</button>
                <button onClick={handleAdd} disabled={saving || !form.name} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Add Model
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151C2E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-white mb-1">Edit: {editItem?.display_name || editItem?.model_name}</h2>
            <p className="text-xs text-[#A7B0C0] mb-5">Update model configuration</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A7B0C0] mb-1.5">Model Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-[#A7B0C0] mb-1.5">Provider</label>
                  <select value={form.provider} onChange={(e) => setForm(f => ({ ...f, provider: e.target.value }))} className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors">
                    {allProviders.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer">
                  <input type="checkbox" checked={form.enabled} onChange={(e) => setForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded border-white/[0.06] bg-[#090B16]" />
                  Enabled
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => setShowEditModal(false)} className="h-10 px-4 rounded-xl border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors">Cancel</button>
                <button onClick={handleEditSave} disabled={saving || !form.name} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
