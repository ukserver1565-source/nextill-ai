"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Cpu, Bot, Brain, Globe, Edit3, Key, Star, Loader2 } from "lucide-react"

interface AIModel {
  id: string
  provider: string
  model_name: string
  display_name: string
  is_enabled: boolean
  is_default: boolean
}

const providerColors: Record<string, string> = {
  openai: "from-emerald-500 to-teal-600",
  google: "from-blue-500 to-cyan-600",
  anthropic: "from-purple-500 to-pink-600",
  deepseek: "from-orange-500 to-red-600",
}

const providerIcons: Record<string, any> = {
  openai: Bot, google: Globe, anthropic: Brain, deepseek: Cpu,
}

export default function AiModelsPage() {
  const router = useRouter()
  const [models, setModels] = useState<AIModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/models")
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Models</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage AI provider models and API keys</p>
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
      ) : models.length === 0 ? (
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-12 text-center">
          <Cpu className="w-10 h-10 text-[#A7B0C0] mx-auto mb-3" />
          <p className="text-sm text-[#A7B0C0]">No AI models configured</p>
          <p className="text-xs text-[#A7B0C0]/60 mt-1">Add models to enable AI-powered features</p>
        </div>
      ) : (
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
                      <h3 className="text-sm font-semibold text-white">{m.display_name}</h3>
                      <p className="text-[10px] text-[#A7B0C0]">{m.provider}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    m.is_enabled ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${m.is_enabled ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
                    {m.is_enabled ? "Active" : "Disabled"}
                  </span>
                </div>

                <div className="border-t border-white/[0.06] pt-4 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-[#A7B0C0]">Model Name</span><span className="font-medium text-white font-mono text-[11px]">{m.model_name}</span></div>
                  {m.is_default && (
                    <div className="flex justify-between"><span className="text-[#A7B0C0]">Role</span><span className="font-medium text-[#6D5EF5] text-[11px] flex items-center gap-1"><Star className="w-3 h-3" /> Default</span></div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                  <button onClick={() => router.push('/admin/ai-hub/api-keys')} className="flex-1 h-8 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center justify-center gap-1.5 transition-all">
                    <Key className="w-3.5 h-3.5" /> API Key
                  </button>
                  <button onClick={() => router.push('/admin/ai-hub/models')} className="flex-1 h-8 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center justify-center gap-1.5 transition-all">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
