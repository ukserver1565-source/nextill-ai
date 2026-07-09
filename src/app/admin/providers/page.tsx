"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit3, Trash2, Play, ToggleLeft, Cpu, Bot, Brain, Globe } from "lucide-react"

const providerIcons: Record<string, any> = {
  OpenAI: Bot, Anthropic: Brain, "Google AI": Globe, DeepSeek: Cpu,
}

const providerColors: Record<string, string> = {
  OpenAI: "from-emerald-500 to-teal-600",
  Anthropic: "from-purple-500 to-pink-600",
  "Google AI": "from-blue-500 to-cyan-600",
  DeepSeek: "from-orange-500 to-red-500",
}

const sampleProviders = [
  { id: 1, name: "openai", display_name: "OpenAI", icon: Bot, is_enabled: true, priority: 1, model_count: 5, latency: 245, usage_count: 45230 },
  { id: 2, name: "anthropic", display_name: "Anthropic", icon: Brain, is_enabled: true, priority: 2, model_count: 3, latency: 380, usage_count: 12400 },
  { id: 3, name: "google", display_name: "Google AI", icon: Globe, is_enabled: true, priority: 3, model_count: 2, latency: 180, usage_count: 8900 },
  { id: 4, name: "deepseek", display_name: "DeepSeek", icon: Cpu, is_enabled: false, priority: 4, model_count: 2, latency: null, usage_count: 0 },
]

export default function ProvidersPage() {
  const [providers, setProviders] = useState(sampleProviders)

  const handleToggle = (id: number) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, is_enabled: !p.is_enabled } : p))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Providers</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage AI provider connections and API keys</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Add Provider
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {providers.map((p, i) => {
          const Icon = p.icon
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.is_enabled ? `bg-gradient-to-br ${providerColors[p.display_name] || "from-[#6D5EF5] to-[#8B5CF6]"}` : "bg-[#090B16] border border-white/[0.06]"}`}>
                    <Icon className={`w-5 h-5 ${p.is_enabled ? "text-white" : "text-[#A7B0C0]"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{p.display_name}</h3>
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
                <div className="flex justify-between"><span className="text-[#A7B0C0]">Name</span><span className="font-medium text-white">{p.name}</span></div>
                <div className="flex justify-between"><span className="text-[#A7B0C0]">Priority</span><span className="font-medium text-white">{p.priority}</span></div>
                <div className="flex justify-between"><span className="text-[#A7B0C0]">Models</span><span className="font-medium text-white">{p.model_count}</span></div>
                <div className="flex justify-between"><span className="text-[#A7B0C0]">Latency</span><span className="font-medium text-white">{p.latency ? `${p.latency}ms` : "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-[#A7B0C0]">Usage</span><span className="font-medium text-white">{(p.usage_count || 0).toLocaleString()}</span></div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06] flex-wrap">
                <button className="flex-1 h-8 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center justify-center gap-1.5 transition-all">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button className="h-8 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-1.5 transition-all">
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleToggle(p.id)} className="h-8 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-1.5 transition-all">
                  <ToggleLeft className="w-3.5 h-3.5" />
                </button>
                <button className="h-8 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
