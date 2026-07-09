"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, Brain, Cpu, Globe, Key, Plus, RefreshCw, Trash2, Eye, EyeOff, Check, X, Loader2, Edit3, Zap } from "lucide-react"

const providerIcons: Record<string, any> = {
  "OpenAI": Bot, "Claude": Brain, "Gemini": Globe, "DeepSeek": Cpu,
  "Perplexity": Globe, "Mistral": Brain, "Grok": Cpu, "OpenRouter": Globe,
}

const providerColors: Record<string, string> = {
  "OpenAI": "from-emerald-500 to-teal-500", "Claude": "from-purple-500 to-pink-500",
  "Gemini": "from-blue-500 to-cyan-500", "DeepSeek": "from-orange-500 to-red-500",
  "Perplexity": "from-[#4CC9F0] to-blue-500", "Mistral": "from-zinc-500 to-zinc-600",
  "Grok": "from-rose-500 to-pink-600", "OpenRouter": "from-amber-500 to-yellow-600",
}

const sampleKeys = [
  { id: 1, name: "Production", provider: "OpenAI", key: "sk-proj-9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a", status: "active", lastUsed: "2026-07-09", created: "2026-01-15" },
  { id: 2, name: "Development", provider: "OpenAI", key: "sk-proj-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0", status: "active", lastUsed: "2026-07-08", created: "2026-02-20" },
  { id: 3, name: "Claude API", provider: "Claude", key: "sk-ant-3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c", status: "active", lastUsed: "2026-07-09", created: "2026-03-10" },
  { id: 4, name: "Gemini Key", provider: "Gemini", key: "AIzaSyB1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U", status: "active", lastUsed: "2026-07-07", created: "2026-01-05" },
  { id: 5, name: "DeepSeek Prod", provider: "DeepSeek", key: "sk-ds-4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d", status: "inactive", lastUsed: "2026-06-15", created: "2026-04-01" },
  { id: 6, name: "Perplexity Dev", provider: "Perplexity", key: "pplx-5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e", status: "active", lastUsed: "2026-07-09", created: "2026-05-12" },
  { id: 7, name: "Grok Beta", provider: "Grok", key: "xk-6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f", status: "active", lastUsed: "2026-07-06", created: "2026-06-01" },
  { id: 8, name: "OpenRouter Free", provider: "OpenRouter", key: "sk-or-v1-7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a", status: "inactive", lastUsed: "2026-05-20", created: "2026-04-15" },
]

function maskKey(key: string): string {
  if (!key) return "sk-...XXXX"
  if (key.length <= 12) return key.slice(0, 6) + "..." + key.slice(-4)
  return key.slice(0, 8) + "..." + key.slice(-4)
}

export default function AIHubApiKeysPage() {
  const [keys, setKeys] = useState(sampleKeys)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRotateModal, setShowRotateModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [visible, setVisible] = useState<Set<number>>(new Set())
  const [testStatus, setTestStatus] = useState<Record<number, "testing" | "success" | "error">>({})
  const [form, setForm] = useState({ name: "", provider: "OpenAI", key: "", enabled: true })

  const toggleVisible = (id: number) => {
    const s = new Set(visible)
    if (s.has(id)) s.delete(id); else s.add(id)
    setVisible(s)
  }

  const handleTest = (id: number) => {
    setTestStatus(s => ({ ...s, [id]: "testing" }))
    setTimeout(() => {
      setTestStatus(s => {
        const r = Math.random() > 0.2 ? "success" : "error"
        return { ...s, [id]: r }
      })
    }, 1200)
    setTimeout(() => {
      setTestStatus(s => { const n = { ...s }; delete n[id]; return n })
    }, 3500)
  }

  const handleDelete = (id: number) => {
    setKeys(prev => prev.filter(k => k.id !== id))
  }

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
      status === "active" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
      {status === "active" ? "Active" : "Inactive"}
    </span>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage API keys for AI providers — edit, test, rotate, or revoke</p>
        </div>
        <button
          onClick={() => { setForm({ name: "", provider: "OpenAI", key: "", enabled: true }); setShowAddModal(true) }}
          className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20"
        >
          <Plus className="w-4 h-4" /> Add API Key
        </button>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-[#A7B0C0]">
                <th className="text-left p-4 font-medium">Provider</th>
                <th className="text-left p-4 font-medium">Key Name</th>
                <th className="text-left p-4 font-medium">Key</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Last Used</th>
                <th className="text-left p-4 font-medium">Created</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Key className="w-12 h-12 text-[#A7B0C0] mx-auto mb-4" />
                    <p className="text-sm font-medium text-[#A7B0C0] mb-1">No API keys</p>
                    <p className="text-xs text-[#A7B0C0]">Add your first API key to connect to providers</p>
                  </td>
                </tr>
              ) : (
                keys.map((k, i) => {
                  const Icon = providerIcons[k.provider] || Cpu
                  const color = providerColors[k.provider] || "from-[#6D5EF5] to-[#8B5CF6]"
                  return (
                    <motion.tr
                      key={k.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${color}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-white font-medium">{k.provider}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-white font-medium">{k.name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <code className="text-[11px] text-[#A7B0C0] font-mono bg-[#090B16] px-2 py-1 rounded-lg border border-white/[0.06]">
                            {visible.has(k.id) ? k.key : maskKey(k.key)}
                          </code>
                          <button onClick={() => toggleVisible(k.id)} className="text-[#A7B0C0] hover:text-white transition-colors">
                            {visible.has(k.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
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
                          <StatusBadge status={k.status} />
                        )}
                      </td>
                      <td className="p-4 text-xs text-[#A7B0C0]">{k.lastUsed}</td>
                      <td className="p-4 text-xs text-[#A7B0C0]">{k.created}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditItem(k); setForm({ name: k.name, provider: k.provider, key: "", enabled: k.status === "active" }); setShowEditModal(true) }}
                            className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleTest(k.id)}
                            disabled={testStatus[k.id] === "testing"}
                            className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all disabled:opacity-50"
                          >
                            {testStatus[k.id] === "testing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => { setEditItem(k); setShowRotateModal(true) }}
                            className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(k.id)}
                            className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
                          >
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151C2E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-white mb-1">Add API Key</h2>
            <p className="text-xs text-[#A7B0C0] mb-5">Create a new API key for an AI provider</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Key Name</label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Production Key"
                  className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Provider</label>
                <select
                  value={form.provider}
                  onChange={(e) => setForm(f => ({ ...f, provider: e.target.value }))}
                  className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                >
                  {Object.keys(providerIcons).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">API Key</label>
                <div className="relative">
                  <input
                    type={visible.has(-1) ? "text" : "password"}
                    value={form.key}
                    onChange={(e) => setForm(f => ({ ...f, key: e.target.value }))}
                    placeholder="sk-..."
                    className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 pr-10 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                  />
                  <button onClick={() => toggleVisible(-1)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white">
                    {visible.has(-1) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer pt-1">
                <input type="checkbox" checked={form.enabled} onChange={(e) => setForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded border-white/[0.06] bg-[#090B16]" />
                Enabled
              </label>
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => setShowAddModal(false)} className="h-10 px-4 rounded-xl border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors">Cancel</button>
                <button onClick={() => { setKeys(prev => [...prev, { id: Date.now(), name: form.name, provider: form.provider, key: form.key || "sk-new...", status: form.enabled ? "active" : "inactive", lastUsed: "Never", created: new Date().toISOString().slice(0, 10) }]); setShowAddModal(false) }} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">Add Key</button>
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
            className="bg-[#151C2E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-white mb-1">Edit: {editItem?.name}</h2>
            <p className="text-xs text-[#A7B0C0] mb-5">Update API key details</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Key Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Provider</label>
                <select value={form.provider} onChange={(e) => setForm(f => ({ ...f, provider: e.target.value }))} className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors">
                  {Object.keys(providerIcons).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">New API Key (leave blank to keep)</label>
                <div className="relative">
                  <input type={visible.has(-2) ? "text" : "password"} value={form.key} onChange={(e) => setForm(f => ({ ...f, key: e.target.value }))} placeholder="Leave blank to keep current" className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 pr-10 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
                  <button onClick={() => toggleVisible(-2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white">
                    {visible.has(-2) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer pt-1">
                <input type="checkbox" checked={form.enabled} onChange={(e) => setForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded border-white/[0.06] bg-[#090B16]" />
                Enabled
              </label>
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => setShowEditModal(false)} className="h-10 px-4 rounded-xl border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors">Cancel</button>
                <button onClick={() => { setKeys(prev => prev.map(k => k.id === editItem?.id ? { ...k, name: form.name, provider: form.provider, status: form.enabled ? "active" : "inactive" } : k)); setShowEditModal(false) }} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">Save Changes</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showRotateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151C2E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-white mb-1">Rotate Key: {editItem?.name}</h2>
            <p className="text-xs text-[#A7B0C0] mb-5">This will create a new key and deactivate the current one.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">New API Key</label>
                <div className="relative">
                  <input type={visible.has(-3) ? "text" : "password"} placeholder="Enter new key..." className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 pr-10 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
                  <button onClick={() => toggleVisible(-3)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white">
                    {visible.has(-3) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => setShowRotateModal(false)} className="h-10 px-4 rounded-xl border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors">Cancel</button>
                <button onClick={() => setShowRotateModal(false)} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">Rotate Key</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
