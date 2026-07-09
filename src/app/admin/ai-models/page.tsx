"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Cpu, Bot, Brain, Globe, Edit3, Key, Star, CheckCircle } from "lucide-react"

const providerColors: Record<string, string> = {
  OpenAI: "from-emerald-500 to-teal-600",
  Google: "from-blue-500 to-cyan-600",
  Anthropic: "from-purple-500 to-pink-600",
  DeepSeek: "from-orange-500 to-red-600",
  "Self-Hosted": "from-zinc-500 to-zinc-600",
}

const providerIcons: Record<string, any> = {
  OpenAI: Bot, Google: Globe, Anthropic: Brain, DeepSeek: Cpu, "Self-Hosted": Cpu,
}

const sampleModels = [
  { id: 1, name: "GPT-4o", provider: "OpenAI", model_id: "gpt-4o", enabled: true, cost: 0.0025, usage: 15230, default_for: ["writer", "outline"], fallback: false, placeholder: "sk-..." },
  { id: 2, name: "GPT-4o Mini", provider: "OpenAI", model_id: "gpt-4o-mini", enabled: true, cost: 0.00015, usage: 28400, default_for: ["humanizer"], fallback: true, placeholder: "sk-..." },
  { id: 3, name: "Claude 3 Opus", provider: "Anthropic", model_id: "claude-3-opus", enabled: true, cost: 0.015, usage: 5200, default_for: ["final-optimization"], fallback: false, placeholder: "sk-ant-..." },
  { id: 4, name: "Gemini Pro", provider: "Google", model_id: "gemini-pro", enabled: true, cost: 0.0005, usage: 8900, default_for: ["keyword-analysis"], fallback: false, placeholder: "AIza..." },
  { id: 5, name: "DeepSeek Chat", provider: "DeepSeek", model_id: "deepseek-chat", enabled: false, cost: 0.0001, usage: 0, default_for: [], fallback: false, placeholder: "sk-ds-..." },
]

export default function AiModelsPage() {
  const [models] = useState(sampleModels)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Models</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage AI provider models and API keys</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {models.map((m, i) => {
          const Icon = providerIcons[m.provider] || Cpu
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${providerColors[m.provider] || "from-[#6D5EF5] to-[#8B5CF6]"}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{m.name}</h3>
                    <p className="text-[10px] text-[#A7B0C0]">{m.provider}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  m.enabled ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.enabled ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
                  {m.enabled ? "Active" : "Disabled"}
                </span>
              </div>

              <div className="border-t border-white/[0.06] pt-4 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-[#A7B0C0]">Model ID</span><span className="font-medium text-white font-mono">{m.model_id}</span></div>
                <div className="flex justify-between"><span className="text-[#A7B0C0]">Cost/Request</span><span className="font-medium text-white">${m.cost.toFixed(4)}</span></div>
                <div className="flex justify-between"><span className="text-[#A7B0C0]">Usage</span><span className="font-medium text-white">{m.usage.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-[#A7B0C0]">API Key</span><span className="font-mono text-[10px] text-[#A7B0C0]">{m.placeholder}••••</span></div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A7B0C0] mb-1">Default For</p>
                <div className="flex flex-wrap gap-1">
                  {m.default_for.length > 0 ? m.default_for.map((tool: string) => (
                    <span key={tool} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/20">{tool.replace(/_/g, " ")}</span>
                  )) : <span className="text-[10px] text-[#A7B0C0]">None</span>}
                </div>
              </div>

              {m.fallback && (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-[#F59E0B]">
                  <CheckCircle className="w-3 h-3" /> Fallback model
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                <button className="flex-1 h-8 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center justify-center gap-1.5 transition-all">
                  <Key className="w-3.5 h-3.5" /> API Key
                </button>
                <button className="flex-1 h-8 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center justify-center gap-1.5 transition-all">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
