"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Key, Plus, RefreshCw, Trash2, Eye, EyeOff, Edit3, Zap, Check, X, Loader2, XCircle } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  key_preview: string
  provider: string
  status: string
  last_used_at: string | null
  created_at: string
}

function maskKey(preview: string): string {
  if (!preview) return "sk-...XXXX"
  if (preview.length <= 12) return preview.slice(0, 6) + "..." + preview.slice(-4)
  return preview.slice(0, 8) + "..." + preview.slice(-4)
}

function formatDate(d: string | null): string {
  if (!d) return "Never"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const [testStatus, setTestStatus] = useState<Record<string, "testing" | "success" | "error">>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [formName, setFormName] = useState("")
  const [formProvider, setFormProvider] = useState("openai")
  const [formApiKey, setFormApiKey] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [actionError, setActionError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/api-keys")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setKeys(Array.isArray(json) ? json : json.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleVisible = (id: string) => {
    const s = new Set(visible)
    if (s.has(id)) s.delete(id); else s.add(id)
    setVisible(s)
  }

  const handleTest = async (id: string) => {
    setTestStatus(s => ({ ...s, [id]: "testing" }))
    try {
      const res = await fetch(`/api/admin/api-keys/${id}/test`, { method: "POST" })
      setTestStatus(s => ({ ...s, [id]: res.ok ? "success" : "error" }))
    } catch {
      setTestStatus(s => ({ ...s, [id]: "error" }))
    }
    setTimeout(() => {
      setTestStatus(s => { const n = { ...s }; delete n[id]; return n })
    }, 3500)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" })
      setKeys(prev => prev.filter(k => k.id !== id))
    } catch (e: any) { setActionError(e.message || "Failed to delete API key") }
  }

  const handleRotate = async (id: string) => {
    if (!window.confirm("Are you sure you want to rotate this API key? The current key will be replaced.")) return
    try {
      const res = await fetch(`/api/admin/api-keys/${id}/rotate`, { method: "POST" })
      if (!res.ok) throw new Error("Failed")
      fetchData()
    } catch (e: any) { setActionError(e.message || "Failed to rotate API key") }
  }

  const openCreate = () => {
    setEditingKey(null)
    setFormName("")
    setFormProvider("openai")
    setFormApiKey("")
    setSaveError("")
    setModalOpen(true)
  }

  const openEdit = (k: ApiKey) => {
    setEditingKey(k)
    setFormName(k.name)
    setFormProvider(k.provider)
    setFormApiKey("")
    setSaveError("")
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    try {
      if (editingKey) {
        const body: any = { name: formName, provider: formProvider }
        if (formApiKey) body.api_key = formApiKey
        const res = await fetch(`/api/admin/api-keys/${editingKey.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error("Failed to update API key")
      } else {
        const res = await fetch("/api/admin/api-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName, provider: formProvider, api_key: formApiKey }),
        })
        if (!res.ok) throw new Error("Failed to create API key")
      }
      setModalOpen(false)
      await fetchData()
    } catch (err: any) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage API keys for AI provider integrations</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Add Key
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-6 text-center">
          <p className="text-sm text-[#EF4444]">{error}</p>
          <button onClick={fetchData} className="mt-3 text-xs text-[#EF4444] underline hover:no-underline">Retry</button>
        </div>
      ) : keys.length === 0 ? (
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-12 text-center">
          <Key className="w-10 h-10 text-[#A7B0C0] mx-auto mb-3" />
          <p className="text-sm text-[#A7B0C0]">No API keys configured yet</p>
          <p className="text-xs text-[#A7B0C0]/60 mt-1">Add a key to get started with AI providers</p>
        </div>
      ) : (
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-[#A7B0C0]">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Key</th>
                <th className="text-left p-4 font-medium">Provider</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Last Used</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k, i) => (
                <motion.tr key={k.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center">
                        <Key className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">{k.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <code className="text-[11px] text-[#A7B0C0] font-mono bg-[#090B16] px-2 py-1 rounded-lg border border-white/[0.06]">
                        {visible.has(k.id) ? k.key_preview : maskKey(k.key_preview)}
                      </code>
                      <button onClick={() => toggleVisible(k.id)} className="text-[#A7B0C0] hover:text-white transition-colors">
                        {visible.has(k.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-white">{k.provider}</td>
                  <td className="p-4">
                    {testStatus[k.id] === "testing" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                        <Loader2 className="w-3 h-3 animate-spin" /> Testing
                      </span>
                    ) : testStatus[k.id] === "success" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">
                        <Check className="w-3 h-3" /> OK
                      </span>
                    ) : testStatus[k.id] === "error" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">
                        <X className="w-3 h-3" /> Failed
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        k.status === "active" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : k.status === "error" ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${k.status === "active" ? "bg-[#22C55E]" : k.status === "error" ? "bg-[#EF4444]" : "bg-[#A7B0C0]"}`} />
                        {k.status === "active" ? "Active" : k.status === "error" ? "Error" : "Inactive"}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{formatDate(k.last_used_at)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(k)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleTest(k.id)} disabled={testStatus[k.id] === "testing"} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all disabled:opacity-50">
                        {testStatus[k.id] === "testing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleRotate(k.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"><RefreshCw className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(k.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
                <h3 className="text-base font-semibold text-white">{editingKey ? "Edit API Key" : "Add API Key"}</h3>
                <button onClick={() => setModalOpen(false)} className="text-[#A7B0C0] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C0] mb-1.5">Name</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Production OpenAI"
                    className="w-full h-10 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm outline-none focus:border-[#6D5EF5] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C0] mb-1.5">Provider</label>
                  <select value={formProvider} onChange={(e) => setFormProvider(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm outline-none focus:border-[#6D5EF5] transition-colors">
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                    <option value="deepseek">DeepSeek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C0] mb-1.5">{editingKey ? "API Key (leave blank to keep current)" : "API Key"}</label>
                  <input type="password" value={formApiKey} onChange={(e) => setFormApiKey(e.target.value)} placeholder={editingKey ? "••••••••" : "sk-..."}
                    className="w-full h-10 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm outline-none focus:border-[#6D5EF5] transition-colors" />
                </div>
                {saveError && <p className="text-xs text-[#EF4444]">{saveError}</p>}
              </div>
              <div className="flex items-center justify-end gap-2 mt-6">
                <button onClick={() => setModalOpen(false)} className="h-9 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving || !formName || (!editingKey && !formApiKey)} className="h-9 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingKey ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {actionError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg backdrop-blur-xl">
          <p className="text-xs text-[#EF4444]">{actionError}</p>
          <button onClick={() => setActionError("")} className="text-[#EF4444] hover:text-white transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
