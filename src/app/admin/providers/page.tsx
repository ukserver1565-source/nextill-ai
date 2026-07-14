"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus, Edit3, Trash2, Play, ToggleLeft, Cpu, Bot, Brain, Globe, Loader2, Server, Check, X, Shield } from "lucide-react"

interface AIProvider {
  id: string
  name: string
  slug: string
  provider: string
  base_url: string | null
  is_enabled: boolean
  priority: number
  model_count: number
  api_key_preview: string | null
  created_at: string
  updated_at: string
}

const providerIcons: Record<string, any> = {
  openai: Bot, anthropic: Brain, google: Globe, deepseek: Cpu,
  gemini: Globe, semrush: Globe, copyleaks: Shield, originality: Shield,
  gptzero: Brain, pagespeed: Globe, languagetool: Cpu,
}

const providerColors: Record<string, string> = {
  openai: "from-emerald-500 to-teal-600",
  anthropic: "from-purple-500 to-pink-600",
  google: "from-blue-500 to-cyan-600",
  deepseek: "from-orange-500 to-red-500",
  gemini: "from-blue-500 to-indigo-600",
  semrush: "from-orange-500 to-amber-600",
  copyleaks: "from-red-500 to-pink-600",
  originality: "from-violet-500 to-purple-600",
  gptzero: "from-teal-500 to-cyan-600",
  pagespeed: "from-green-500 to-emerald-600",
  languagetool: "from-blue-400 to-blue-600",
}

const emptyForm = { name: "", slug: "openai", provider_type: "openai", base_url: "", is_enabled: true }

export default function ProvidersPage() {
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [testStatus, setTestStatus] = useState<Record<string, "testing" | "success" | "error">>({})
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<AIProvider | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState("")

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/providers")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setProviders(Array.isArray(json) ? json : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProviders() }, [fetchProviders])

  const handleToggle = async (p: AIProvider) => {
    setActionError("")
    try {
      const res = await fetch(`/api/admin/providers/${p.id}/toggle`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to toggle")
      setProviders(prev => prev.map(prov => prov.id === p.id ? { ...prov, is_enabled: !prov.is_enabled } : prov))
    } catch (e: any) { setActionError(e.message) }
  }

  const handleTest = async (id: string) => {
    setTestStatus(s => ({ ...s, [id]: "testing" }))
    try {
      const res = await fetch(`/api/admin/providers/${id}/test`, { method: "POST" })
      setTestStatus(s => ({ ...s, [id]: res.ok ? "success" : "error" }))
    } catch {
      setTestStatus(s => ({ ...s, [id]: "error" }))
    }
    setTimeout(() => {
      setTestStatus(s => { const n = { ...s }; delete n[id]; return n })
    }, 3000)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this provider?")) return
    setActionError("")
    try {
      const res = await fetch(`/api/admin/providers/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      fetchProviders()
    } catch (e: any) { setActionError(e.message) }
  }

  const openAdd = () => {
    setEditItem(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (p: AIProvider) => {
    setEditItem(p)
    setForm({
      name: p.name,
      slug: p.slug,
      provider_type: p.provider,
      base_url: p.base_url || "",
      is_enabled: p.is_enabled,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setActionError("")
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        provider_type: form.provider_type,
        base_url: form.base_url || null,
        is_enabled: form.is_enabled,
      }
      if (editItem) {
        const res = await fetch(`/api/admin/providers/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed to save")
      } else {
        const res = await fetch("/api/admin/providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed to save")
      }
      setShowModal(false)
      fetchProviders()
    } catch (e: any) { setActionError(e.message) } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Providers</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage AI provider connections and API keys</p>
        </div>
        <button onClick={openAdd} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Add Provider
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
          <span className="ml-3 text-sm text-[#A7B0C0]">Loading providers...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center mb-3">
            <Server className="w-6 h-6 text-[#EF4444]" />
          </div>
          <p className="text-sm text-[#EF4444] font-medium">Failed to load providers</p>
          <p className="text-xs text-[#A7B0C0] mt-1">{error}</p>
          <button onClick={fetchProviders} className="mt-3 px-4 py-1.5 rounded-xl bg-[#6D5EF5]/10 text-[#6D5EF5] text-xs font-medium hover:bg-[#6D5EF5]/20 transition-colors">
            Retry
          </button>
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#6D5EF5]/10 flex items-center justify-center mb-3">
            <Server className="w-6 h-6 text-[#6D5EF5]" />
          </div>
          <p className="text-sm text-[#A7B0C0]">No providers configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {providers.map((p, i) => {
            const Icon = providerIcons[p.provider] || Cpu
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.is_enabled ? `bg-gradient-to-br ${providerColors[p.provider] || "from-[#6D5EF5] to-[#8B5CF6]"}` : "bg-[#090B16] border border-white/[0.06]"}`}>
                      <Icon className={`w-5 h-5 ${p.is_enabled ? "text-white" : "text-[#A7B0C0]"}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        p.is_enabled ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.is_enabled ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
                        {p.is_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-4 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-[#A7B0C0]">Slug</span><span className="font-medium text-white">{p.slug}</span></div>
                  <div className="flex justify-between"><span className="text-[#A7B0C0]">Priority</span><span className="font-medium text-white">{p.priority}</span></div>
                  <div className="flex justify-between"><span className="text-[#A7B0C0]">Models</span><span className="font-medium text-white">{p.model_count}</span></div>
                  <div className="flex justify-between"><span className="text-[#A7B0C0]">API Key</span><span className="font-medium text-white">{p.api_key_preview || "Not set"}</span></div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06] flex-wrap">
                  <button onClick={() => openEdit(p)} className="flex-1 h-8 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center justify-center gap-1.5 transition-all">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleTest(p.id)} disabled={testStatus[p.id] === "testing"} className="h-8 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-50">
                    {testStatus[p.id] === "testing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : testStatus[p.id] === "success" ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : testStatus[p.id] === "error" ? <X className="w-3.5 h-3.5 text-[#EF4444]" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleToggle(p)} className="h-8 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-1.5 transition-all">
                    <ToggleLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="h-8 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151C2E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-1">{editItem ? "Edit Provider" : "Add Provider"}</h2>
            <p className="text-xs text-[#A7B0C0] mb-5">{editItem ? "Update provider configuration" : "Connect a new AI provider"}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Provider" className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Slug</label>
                <select value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors">
                  <option value="openai">openai</option>
                  <option value="anthropic">anthropic</option>
                  <option value="google">google</option>
                  <option value="deepseek">deepseek</option>
                  <option value="gemini">gemini</option>
                  <option value="semrush">semrush</option>
                  <option value="copyleaks">copyleaks</option>
                  <option value="originality">originality</option>
                  <option value="gptzero">gptzero</option>
                  <option value="pagespeed">pagespeed</option>
                  <option value="languagetool">languagetool</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Provider Type</label>
                <select value={form.provider_type} onChange={(e) => setForm(f => ({ ...f, provider_type: e.target.value }))} className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors">
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="semrush">Semrush</option>
                  <option value="copyleaks">Copyleaks</option>
                  <option value="originality">Originality.ai</option>
                  <option value="gptzero">GPTZero</option>
                  <option value="pagespeed">PageSpeed Insights</option>
                  <option value="languagetool">LanguageTool</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Base URL</label>
                <input type="text" value={form.base_url} onChange={(e) => setForm(f => ({ ...f, base_url: e.target.value }))} placeholder="https://api.openai.com/v1" className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
              </div>
              <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer pt-1">
                <input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm(f => ({ ...f, is_enabled: e.target.checked }))} className="rounded border-white/[0.06] bg-[#090B16]" />
                Enabled
              </label>
              {actionError && <p className="text-xs text-[#EF4444] text-center">{actionError}</p>}
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => setShowModal(false)} className="h-10 px-4 rounded-xl border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editItem ? "Save Changes" : "Add Provider"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
