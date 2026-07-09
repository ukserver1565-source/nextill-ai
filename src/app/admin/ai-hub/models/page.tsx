"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, Brain, Cpu, Globe, Search, Plus, Star, Edit3, Trash2, Check, X } from "lucide-react"

const providerColors: Record<string, string> = {
  "OpenAI": "from-emerald-500 to-teal-500", "Claude": "from-purple-500 to-pink-500",
  "Gemini": "from-blue-500 to-cyan-500", "DeepSeek": "from-orange-500 to-red-500",
  "Perplexity": "from-[#4CC9F0] to-blue-500", "Mistral": "from-zinc-500 to-zinc-600",
  "Grok": "from-rose-500 to-pink-600", "OpenRouter": "from-amber-500 to-yellow-600",
  "Groq": "from-[#6D5EF5] to-[#8B5CF6]", "Together AI": "from-violet-500 to-purple-600",
}

const providerIcons: Record<string, any> = {
  "OpenAI": Bot, "Claude": Brain, "Gemini": Globe, "DeepSeek": Cpu,
  "Perplexity": Globe, "Mistral": Brain, "Grok": Cpu, "OpenRouter": Globe,
  "Groq": Cpu, "Together AI": Cpu,
}

const sampleModels = [
  { id: 1, name: "GPT-4o", provider: "OpenAI", isDefault: true, temperature: 0.7, maxTokens: 4096, streaming: true, priority: 1, status: "active" },
  { id: 2, name: "GPT-4o Mini", provider: "OpenAI", isDefault: false, temperature: 0.7, maxTokens: 16384, streaming: true, priority: 2, status: "active" },
  { id: 3, name: "GPT-3.5 Turbo", provider: "OpenAI", isDefault: false, temperature: 0.7, maxTokens: 4096, streaming: true, priority: 3, status: "active" },
  { id: 4, name: "Claude 3 Opus", provider: "Claude", isDefault: true, temperature: 0.5, maxTokens: 4096, streaming: true, priority: 1, status: "active" },
  { id: 5, name: "Claude 3 Sonnet", provider: "Claude", isDefault: false, temperature: 0.7, maxTokens: 4096, streaming: true, priority: 2, status: "active" },
  { id: 6, name: "Claude 3 Haiku", provider: "Claude", isDefault: false, temperature: 0.6, maxTokens: 8192, streaming: true, priority: 3, status: "inactive" },
  { id: 7, name: "Gemini Pro", provider: "Gemini", isDefault: true, temperature: 0.7, maxTokens: 8192, streaming: true, priority: 1, status: "active" },
  { id: 8, name: "Gemini Pro Vision", provider: "Gemini", isDefault: false, temperature: 0.6, maxTokens: 16384, streaming: false, priority: 2, status: "active" },
  { id: 9, name: "DeepSeek Chat", provider: "DeepSeek", isDefault: true, temperature: 0.7, maxTokens: 4096, streaming: true, priority: 1, status: "active" },
  { id: 10, name: "DeepSeek Coder", provider: "DeepSeek", isDefault: false, temperature: 0.2, maxTokens: 8192, streaming: true, priority: 2, status: "active" },
  { id: 11, name: "Sonar Pro", provider: "Perplexity", isDefault: true, temperature: 0.7, maxTokens: 4096, streaming: true, priority: 1, status: "active" },
  { id: 12, name: "Grok-1", provider: "Grok", isDefault: true, temperature: 0.8, maxTokens: 8192, streaming: true, priority: 1, status: "active" },
  { id: 13, name: "OpenRouter Auto", provider: "OpenRouter", isDefault: true, temperature: 0.7, maxTokens: 4096, streaming: true, priority: 1, status: "active" },
  { id: 14, name: "Llama-3-70B", provider: "Groq", isDefault: true, temperature: 0.7, maxTokens: 8192, streaming: true, priority: 1, status: "active" },
  { id: 15, name: "Mixtral-8x7B", provider: "Together AI", isDefault: true, temperature: 0.7, maxTokens: 4096, streaming: true, priority: 1, status: "active" },
]

const allProviders = Array.from(new Set(sampleModels.map(m => m.provider)))

export default function AIHubModelsPage() {
  const [models, setModels] = useState(sampleModels)
  const [search, setSearch] = useState("")
  const [filterProvider, setFilterProvider] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ name: "", provider: "OpenAI", temperature: 0.7, maxTokens: 4096, streaming: true, enabled: true })

  const filtered = models.filter(m => {
    if (filterProvider !== "All" && m.provider !== filterProvider) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSetDefault = (id: number) => {
    setModels(prev => prev.map(m => ({ ...m, isDefault: m.id === id })))
  }

  const handleToggle = (id: number) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m))
  }

  const handleDelete = (id: number) => {
    setModels(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Models</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Configure AI models, parameters, defaults, and streaming settings</p>
        </div>
        <button
          onClick={() => { setForm({ name: "", provider: "OpenAI", temperature: 0.7, maxTokens: 4096, streaming: true, enabled: true }); setShowAddModal(true) }}
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

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-[#A7B0C0]">
                <th className="text-left p-4 font-medium">Model Name</th>
                <th className="text-left p-4 font-medium">Provider</th>
                <th className="text-left p-4 font-medium">Default</th>
                <th className="text-left p-4 font-medium">Temp</th>
                <th className="text-left p-4 font-medium">Max Tokens</th>
                <th className="text-left p-4 font-medium">Streaming</th>
                <th className="text-left p-4 font-medium">Priority</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <Brain className="w-12 h-12 text-[#A7B0C0] mx-auto mb-4" />
                    <p className="text-sm font-medium text-[#A7B0C0] mb-1">No models found</p>
                    <p className="text-xs text-[#A7B0C0]">Add your first model or change the filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map((m, i) => {
                  const Icon = providerIcons[m.provider] || Cpu
                  const color = providerColors[m.provider] || "from-[#6D5EF5] to-[#8B5CF6]"
                  return (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-sm font-medium text-white">{m.name}</span>
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
                        {m.isDefault ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                            <Star className="w-3 h-3" /> Default
                          </span>
                        ) : (
                          <span className="text-[#A7B0C0] text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-white">{m.temperature}</td>
                      <td className="p-4 text-xs text-white">{m.maxTokens.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          m.streaming ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                        }`}>
                          {m.streaming ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                          {m.streaming ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-white">{m.priority}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          m.status === "active" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.status === "active" ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
                          {m.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!m.isDefault && (
                            <button onClick={() => handleSetDefault(m.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-[#F59E0B] transition-all">
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => handleToggle(m.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all">
                            {m.status === "active" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
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
                    {allProviders.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A7B0C0] mb-1.5">Temperature (0-2)</label>
                  <input type="number" step="0.01" min="0" max="2" value={form.temperature} onChange={(e) => setForm(f => ({ ...f, temperature: Number(e.target.value) }))} className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-[#A7B0C0] mb-1.5">Max Tokens</label>
                  <input type="number" value={form.maxTokens} onChange={(e) => setForm(f => ({ ...f, maxTokens: Number(e.target.value) }))} className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer">
                  <input type="checkbox" checked={form.streaming} onChange={(e) => setForm(f => ({ ...f, streaming: e.target.checked }))} className="rounded border-white/[0.06] bg-[#090B16]" />
                  Supports Streaming
                </label>
                <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer">
                  <input type="checkbox" checked={form.enabled} onChange={(e) => setForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded border-white/[0.06] bg-[#090B16]" />
                  Enabled
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => setShowAddModal(false)} className="h-10 px-4 rounded-xl border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors">Cancel</button>
                <button onClick={() => { setModels(prev => [...prev, { id: Date.now(), name: form.name, provider: form.provider, isDefault: false, temperature: form.temperature, maxTokens: form.maxTokens, streaming: form.streaming, priority: prev.length + 1, status: form.enabled ? "active" : "inactive" }]); setShowAddModal(false) }} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">Add Model</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
