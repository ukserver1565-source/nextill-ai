"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, Brain, Cpu, Globe, Search, Plus, Check, X, Settings, Zap, Edit3, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

const sampleProviders = [
  { id: 1, name: "Gemini", slug: "gemini", icon: Globe, enabled: true, priority: 1, models: 3, latency: "180ms", usage: 8900, color: "from-blue-500 to-cyan-500", baseUrl: "https://generativelanguage.googleapis.com", defaultModel: "gemini-pro" },
  { id: 2, name: "OpenAI", slug: "openai", icon: Bot, enabled: true, priority: 2, models: 5, latency: "245ms", usage: 45230, color: "from-emerald-500 to-teal-500", baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o" },
  { id: 3, name: "Claude", slug: "anthropic", icon: Brain, enabled: true, priority: 3, models: 3, latency: "380ms", usage: 12400, color: "from-purple-500 to-pink-500", baseUrl: "https://api.anthropic.com/v1", defaultModel: "claude-3-opus" },
  { id: 4, name: "DeepSeek", slug: "deepseek", icon: Cpu, enabled: true, priority: 4, models: 2, latency: "320ms", usage: 5100, color: "from-orange-500 to-red-500", baseUrl: "https://api.deepseek.com/v1", defaultModel: "deepseek-chat" },
  { id: 5, name: "Perplexity", slug: "perplexity", icon: Globe, enabled: true, priority: 5, models: 2, latency: "290ms", usage: 3700, color: "from-[#4CC9F0] to-blue-500", baseUrl: "https://api.perplexity.ai", defaultModel: "sonar-pro" },
  { id: 6, name: "Mistral", slug: "mistral", icon: Brain, enabled: false, priority: 6, models: 2, latency: "—", usage: 0, color: "from-zinc-500 to-zinc-600", baseUrl: "https://api.mistral.ai/v1", defaultModel: "mistral-large" },
  { id: 7, name: "Grok", slug: "grok", icon: Cpu, enabled: true, priority: 7, models: 1, latency: "410ms", usage: 1200, color: "from-rose-500 to-pink-600", baseUrl: "https://api.x.ai/v1", defaultModel: "grok-1" },
  { id: 8, name: "OpenRouter", slug: "openrouter", icon: Globe, enabled: true, priority: 8, models: 10, latency: "265ms", usage: 6800, color: "from-amber-500 to-yellow-600", baseUrl: "https://openrouter.ai/api/v1", defaultModel: "openrouter/auto" },
  { id: 9, name: "Together AI", slug: "together", icon: Cpu, enabled: true, priority: 9, models: 4, latency: "310ms", usage: 2900, color: "from-violet-500 to-purple-600", baseUrl: "https://api.together.xyz/v1", defaultModel: "mistralai/Mixtral-8x7B-Instruct-v0.1" },
  { id: 10, name: "Groq", slug: "groq", icon: Zap, enabled: true, priority: 10, models: 3, latency: "150ms", usage: 4500, color: "from-[#6D5EF5] to-[#8B5CF6]", baseUrl: "https://api.groq.com/openai/v1", defaultModel: "llama3-70b-8192" },
  { id: 11, name: "Cohere", slug: "cohere", icon: Brain, enabled: false, priority: 11, models: 2, latency: "—", usage: 0, color: "from-sky-500 to-indigo-600", baseUrl: "https://api.cohere.ai/v1", defaultModel: "command-r" },
  { id: 12, name: "Custom LLM", slug: "custom", icon: Settings, enabled: true, priority: 12, models: 1, latency: "—", usage: 0, color: "from-zinc-400 to-zinc-600", baseUrl: "http://localhost:11434/v1", defaultModel: "custom-model" },
]

export default function AIHubProvidersPage() {
  const [providers, setProviders] = useState(sampleProviders)
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<number | null>(null)
  const [testResult, setTestResult] = useState<{ id: number; success: boolean; latency?: string } | null>(null)
  const [testing, setTesting] = useState<number | null>(null)

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (id: number) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
  }

  const handleTest = (id: number) => {
    setTesting(id)
    setTestResult(null)
    setTimeout(() => {
      const success = Math.random() > 0.3
      setTestResult({ id, success, latency: success ? `${Math.floor(100 + Math.random() * 400)}ms` : undefined })
      setTesting(null)
    }, 1500)
  }

  const updateProvider = (id: number, updates: Partial<typeof sampleProviders[0]>) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Providers</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage provider connections, base URLs, and test connectivity</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <Bot className="w-12 h-12 text-[#A7B0C0] mb-4" />
            <p className="text-sm font-medium text-[#A7B0C0] mb-1">No providers found</p>
            <p className="text-xs text-[#A7B0C0]">Try a different search term</p>
          </div>
        )}
        {filtered.map((p, i) => {
          const Icon = p.icon
          const isExpanded = expanded === p.id
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${p.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                      <span className="text-[10px] text-[#A7B0C0]">Priority: {p.priority} · {p.models} models</span>
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
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    p.enabled ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.enabled ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
                    {p.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    p.latency !== "—" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                  }`}>
                    {p.latency !== "—" ? `${p.latency}` : "N/A"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A7B0C0]">Usage</span>
                    <span className="text-white font-medium">{p.usage.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6]"
                      style={{ width: `${Math.min(100, (p.usage / 50000) * 100)}%` }}
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
                  <button className="h-8 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {testResult?.id === p.id && (
                  <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${testResult.success ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {testResult.success ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {testResult.success ? `Connected! Latency: ${testResult.latency}` : "Connection failed"}
                  </div>
                )}
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
                      defaultValue={p.baseUrl}
                      className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#A7B0C0] mb-1">Default Model</label>
                      <select
                        defaultValue={p.defaultModel}
                        className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                      >
                        <option value={p.defaultModel}>{p.defaultModel}</option>
                        <option value="gpt-4">gpt-4</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#A7B0C0] mb-1">Priority</label>
                      <input
                        type="number"
                        defaultValue={p.priority}
                        className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer">
                      <input type="checkbox" defaultChecked={p.enabled} className="rounded border-white/[0.06] bg-[#090B16]" />
                      Enabled
                    </label>
                    <button className="h-9 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
