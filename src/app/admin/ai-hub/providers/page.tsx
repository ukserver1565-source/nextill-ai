"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Bot, Brain, Cpu, Globe, Search, Plus, Check, X, Settings, Zap, Trash2, Loader2, XCircle } from "lucide-react"

const providerIcons: Record<string, any> = {
  "openai": Bot, "claude": Brain, "gemini": Globe, "deepseek": Cpu,
  "perplexity": Globe, "mistral": Brain, "grok": Cpu, "openrouter": Globe,
  "groq": Cpu, "together": Cpu,
}
const providerColors: Record<string, string> = {
  "openai": "from-emerald-500 to-teal-500", "claude": "from-purple-500 to-pink-500",
  "gemini": "from-blue-500 to-cyan-500", "deepseek": "from-orange-500 to-red-500",
  "perplexity": "from-[#4CC9F0] to-blue-500", "mistral": "from-zinc-500 to-zinc-600",
  "grok": "from-rose-500 to-pink-600", "openrouter": "from-amber-500 to-yellow-600",
  "groq": "from-[#6D5EF5] to-[#8B5CF6]", "together": "from-violet-500 to-purple-600",
}

export default function AIHubProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [providersWithKeys, setProvidersWithKeys] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latency?: string } | null>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: "", slug: "openai", base_url: "", default_model: "" })
  const [expandedForms, setExpandedForms] = useState<Record<string, { base_url: string; default_model: string; status: string }>>({})
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [provRes, keysRes] = await Promise.all([
        fetch("/api/admin/ai/providers"),
        fetch("/api/admin/ai/api-keys"),
      ])
      if (provRes.ok) {
        const json = await provRes.json()
        setProviders(Array.isArray(json) ? json : json.data || [])
      }
      if (keysRes.ok) {
        const keysJson = await keysRes.json()
        const keys = Array.isArray(keysJson) ? keysJson : keysJson.data || []
        setProvidersWithKeys(new Set(keys.map((k: any) => k.provider_slug).filter(Boolean)))
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const forms: Record<string, { base_url: string; default_model: string; status: string }> = {}
    for (const p of providers) {
      forms[p.id] = { base_url: p.base_url || "", default_model: p.default_model || "", status: p.status || "" }
    }
    setExpandedForms(forms)
  }, [providers])

  const filtered = providers.filter(p =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = async (id: string) => {
    setActionError("")
    setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
    try {
      await fetch(`/api/admin/ai/providers/${id}/toggle`, { method: "POST" })
    } catch (e: any) { setActionError(e.message || "Failed to toggle provider") }
  }

  const handleTest = async (id: string) => {
    setTesting(id)
    setTestResult(null)
    try {
      const res = await fetch("/api/admin/ai/providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      setTestResult({ id, success: json.success ?? res.ok, latency: json.latency_ms ? `${json.latency_ms}ms` : undefined })
    } catch {
      setTestResult({ id, success: false })
    } finally {
      setTesting(null)
    }
  }

  const handleDelete = async (id: string) => {
    setActionError("")
    try {
      await fetch(`/api/admin/ai/providers/${id}`, { method: "DELETE" })
      setProviders(prev => prev.filter(p => p.id !== id))
    } catch (e: any) { setActionError(e.message || "Failed to delete provider") }
  }

  const handleAdd = async () => {
    setActionError("")
    setSaving(true)
    try {
      const res = await fetch("/api/admin/ai/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          slug: addForm.slug,
          base_url: addForm.base_url || null,
          default_model: addForm.default_model || null,
          enabled: true,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setShowAddModal(false)
      fetchData()
    } catch (e: any) { setActionError(e.message || "Failed to add provider") }
    setSaving(false)
  }

  const handleSaveProvider = async (id: string) => {
    const form = expandedForms[id]
    if (!form) return
    setActionError("")
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/ai/providers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_url: form.base_url,
          default_model: form.default_model,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      fetchData()
    } catch (e: any) { setActionError(e.message || "Failed to save provider") }
    setSaving(false)
  }

  const updateExpandedForm = (id: string, field: string, value: string) => {
    setExpandedForms(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const getIcon = (slug: string) => providerIcons[slug?.toLowerCase()] || Bot
  const getColor = (slug: string) => providerColors[slug?.toLowerCase()] || "from-[#6D5EF5] to-[#8B5CF6]"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Providers</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage provider connections, base URLs, and test connectivity</p>
        </div>
        <button
          onClick={() => { setAddForm({ name: "", slug: "openai", base_url: "", default_model: "" }); setShowAddModal(true) }}
          className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20"
        >
          <Plus className="w-4 h-4" /> Add Provider
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
        <input
          type="text"
          placeholder="Search providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
        />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#6D5EF5] animate-spin mb-4" />
          <p className="text-sm text-[#A7B0C0]">Loading providers...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20">
          <X className="w-12 h-12 text-[#EF4444] mb-4" />
          <p className="text-sm font-medium text-[#EF4444] mb-1">Failed to load providers</p>
          <p className="text-xs text-[#A7B0C0]">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <Bot className="w-12 h-12 text-[#A7B0C0] mb-4" />
              <p className="text-sm font-medium text-[#A7B0C0] mb-1">No providers found</p>
              <p className="text-xs text-[#A7B0C0]">{providers.length === 0 ? "Add a provider to get started" : "Try a different search term"}</p>
            </div>
          )}
          {filtered.map((p: any, i: number) => {
            const Icon = getIcon(p.slug)
            const color = getColor(p.slug)
            const isExpanded = expanded === p.id
            const latency = p.latency_ms ? `${p.latency_ms}ms` : "—"
            const usage = p.usage_count ?? 0
            const ef = expandedForms[p.id] || { base_url: "", default_model: "", status: "" }
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                        <span className="text-[10px] text-[#A7B0C0]">Model: {p.default_model || "—"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(p.id)}
                      className={`relative w-10 h-5 rounded-full transition-all ${p.enabled ? "bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6]" : "bg-white/[0.06]"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${p.enabled ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {p.enabled && providersWithKeys.has(p.slug) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                        Connected
                      </span>
                    ) : p.enabled && !providersWithKeys.has(p.slug) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                        No API Key
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A7B0C0]" />
                        Disabled
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      latency !== "—" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                    }`}>
                      {latency !== "—" ? latency : "N/A"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#A7B0C0]">Usage</span>
                      <span className="text-white font-medium">{usage.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6]"
                        style={{ width: `${Math.min(100, (usage / 50000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : p.id)}
                      className="flex-1 h-8 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Settings className="w-3.5 h-3.5" /> Configure
                    </button>
                    <button
                      onClick={() => handleTest(p.id)}
                      disabled={testing === p.id}
                      className="h-8 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {testing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      Test
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="h-8 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {testResult?.id === p.id && (() => {
                    const tr = testResult!
                    return (
                      <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${tr.success ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                        {tr.success ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {tr.success ? `Connected! Latency: ${tr.latency}` : "Connection failed"}
                      </div>
                    )
                  })()}
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-white/[0.06] p-5 space-y-4 bg-white/[0.02]"
                  >
                    <div>
                      <label className="block text-xs text-[#A7B0C0] mb-1">Base URL</label>
                      <input
                        type="text"
                        value={ef.base_url}
                        onChange={(e) => updateExpandedForm(p.id, "base_url", e.target.value)}
                        className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#A7B0C0] mb-1">Default Model</label>
                        <input
                          type="text"
                          value={ef.default_model}
                          onChange={(e) => updateExpandedForm(p.id, "default_model", e.target.value)}
                          className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#A7B0C0] mb-1">Status</label>
                        <input
                          type="text"
                          value={ef.status}
                          readOnly
                          className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none transition-colors opacity-60"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer">
                        <input type="checkbox" checked={p.enabled} readOnly className="rounded border-white/[0.06] bg-[#090B16]" />
                        Enabled
                      </label>
                      <button
                        onClick={() => handleSaveProvider(p.id)}
                        disabled={saving}
                        className="h-9 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151C2E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-white mb-1">Add Provider</h2>
            <p className="text-xs text-[#A7B0C0] mb-5">Connect a new AI provider</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Name</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="My Provider" className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Slug</label>
                <select value={addForm.slug} onChange={(e) => setAddForm(f => ({ ...f, slug: e.target.value }))} className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors">
                  {Object.keys(providerIcons).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Base URL</label>
                <input type="text" value={addForm.base_url} onChange={(e) => setAddForm(f => ({ ...f, base_url: e.target.value }))} placeholder="https://api.openai.com/v1" className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Default Model</label>
                <input type="text" value={addForm.default_model} onChange={(e) => setAddForm(f => ({ ...f, default_model: e.target.value }))} placeholder="gpt-4o" className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => setShowAddModal(false)} className="h-10 px-4 rounded-xl border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors">Cancel</button>
                <button onClick={handleAdd} disabled={saving || !addForm.name} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Add Provider
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {actionError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#EF4444]/10 border border-[#EF4444]/20 backdrop-blur-xl text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          {actionError}
          <button onClick={() => setActionError("")} className="text-[#A7B0C0] hover:text-white">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
