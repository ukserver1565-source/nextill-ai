"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bot, Brain, Cpu, Globe, Shield, Activity, Plus, Key, Layers, FileText, ArrowRight, CheckCircle, XCircle, Loader2, Inbox } from "lucide-react"
import { useAdminFetch } from "@/lib/admin/use-admin-fetch"

export default function AIHubPage() {
  const router = useRouter()
  const { data: providersData, loading: providersLoading } = useAdminFetch<any>("/api/admin/providers")
  const { data: promptsData, loading: promptsLoading } = useAdminFetch<any>("/api/admin/ai/prompts")
  const { data: apiKeysData, loading: keysLoading } = useAdminFetch<any>("/api/admin/api-keys")
  const { data: logsData, loading: logsLoading } = useAdminFetch<any>("/api/admin/logs?type=admin_audit&limit=10")

  const providers = providersData?.data || providersData || []
  const prompts = Array.isArray(promptsData) ? promptsData : promptsData?.data || []
  const apiKeys = Array.isArray(apiKeysData) ? apiKeysData : apiKeysData?.data || []
  const activity = Array.isArray(logsData) ? logsData : logsData?.data || []

  const providerSlugsWithKeys = new Set(apiKeys.filter((k: any) => k.is_enabled !== false).map((k: any) => k.provider_slug))
  const activeProviders = Array.isArray(providers) ? providers.filter((p: any) => p.enabled && providerSlugsWithKeys.has(p.slug)).length : 0
  const totalModels = Array.isArray(providers) ? providers.reduce((sum: number, p: any) => {
    const count = p.ai_models?.[0]?.count ?? p.model_count ?? 0
    return sum + count
  }, 0) : 0

  const stats = [
    { label: "Active Providers", value: String(activeProviders), icon: Bot, change: `${Array.isArray(providers) ? providers.length : 0} total`, color: "from-[#6D5EF5] to-[#8B5CF6]" },
    { label: "Total Models", value: String(totalModels), icon: Brain, change: `${totalModels} registered`, color: "from-[#4CC9F0] to-[#3B82F6]" },
    { label: "API Keys", value: String(apiKeys.length), icon: Key, change: `${apiKeys.filter((k: any) => k.is_enabled !== false).length} active`, color: "from-[#22C55E] to-[#16A34A]" },
    { label: "Total Prompts", value: String(prompts.length), icon: FileText, change: `${prompts.filter((p: any) => p.is_active !== false).length} active`, color: "from-[#F59E0B] to-[#D97706]" },
  ]

  const quickActions = [
    { label: "Add Provider", icon: Plus, color: "from-[#6D5EF5] to-[#8B5CF6]", desc: "Connect a new AI provider", href: "/zain-nextill-ansari/ai-hub/providers" },
    { label: "Add API Key", icon: Key, color: "from-[#22C55E] to-[#16A34A]", desc: "Configure a new API key", href: "/zain-nextill-ansari/ai-hub/api-keys" },
    { label: "Add Model", icon: Layers, color: "from-[#4CC9F0] to-[#3B82F6]", desc: "Register a new AI model", href: "/zain-nextill-ansari/ai-hub/models" },
    { label: "View Logs", icon: Activity, color: "from-[#F59E0B] to-[#D97706]", desc: "Check recent AI activity", href: "/zain-nextill-ansari/logs" },
  ]

  const providerColors: Record<string, string> = {
    gemini: "from-blue-500 to-cyan-500",
    openai: "from-emerald-500 to-teal-500",
    claude: "from-purple-500 to-pink-500",
    deepseek: "from-orange-500 to-red-500",
    perplexity: "from-[#4CC9F0] to-blue-500",
    mistral: "from-zinc-500 to-zinc-600",
    grok: "from-rose-500 to-pink-600",
    openrouter: "from-amber-500 to-yellow-600",
    dataforseo: "from-teal-500 to-cyan-600",
    copyleaks: "from-green-500 to-emerald-600",
    togetherai: "from-indigo-500 to-violet-500",
    fireworks: "from-red-500 to-orange-500",
    ollama: "from-gray-500 to-slate-600",
  }

  const providerIcons: Record<string, any> = {
    gemini: Globe,
    openai: Bot,
    claude: Brain,
    deepseek: Cpu,
    perplexity: Globe,
    mistral: Brain,
    grok: Cpu,
    openrouter: Globe,
    dataforseo: Globe,
    copyleaks: Shield,
    togetherai: Brain,
    fireworks: Globe,
    ollama: Cpu,
  }

  const loading = providersLoading || promptsLoading || keysLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Hub</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage AI providers, models, prompts and API keys</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">{stat.change}</span>
              </div>
              {loading ? (
                <div className="h-7 w-20 bg-white/[0.04] rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              )}
              <p className="text-xs text-[#A7B0C0] mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Provider Overview</h2>
        {providersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" />
          </div>
        ) : Array.isArray(providers) && providers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {providers.map((p: any, i: number) => {
              const Icon = providerIcons[p.slug] || Bot
              const color = providerColors[p.slug] || "from-gray-500 to-gray-600"
              const isEnabled = p.enabled || p.status === "active"
              const latency = p.latency_ms ? `${p.latency_ms}ms` : "—"
              const usage = p.usage_count ? `${p.usage_count}` : "0"
              return (
                <motion.div
                  key={p.id || p.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isEnabled ? (
                          <CheckCircle className="w-3 h-3 text-[#22C55E]" />
                        ) : (
                          <XCircle className="w-3 h-3 text-[#A7B0C0]" />
                        )}
                        <span className={`text-[10px] ${isEnabled ? "text-[#22C55E]" : "text-[#A7B0C0]"}`}>
                          {isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-white/[0.06]">
                    <span className="text-[#A7B0C0]">Latency: <span className="text-white font-medium">{latency}</span></span>
                    <span className="text-[#A7B0C0]">Usage: <span className="text-white font-medium">{usage}</span></span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl">
            <Inbox className="w-10 h-10 text-[#A7B0C0] mb-3" />
            <p className="text-sm font-medium text-[#A7B0C0] mb-1">No providers configured</p>
            <p className="text-xs text-[#A7B0C0]">Add an AI provider to get started</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((a, i) => {
            const Icon = a.icon
            return (
              <motion.button
                key={a.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(a.href)}
                className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${a.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{a.label}</p>
                    <p className="text-[10px] text-[#A7B0C0]">{a.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#A7B0C0] group-hover:text-white transition-colors" />
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Recent Activity</h2>
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" />
            </div>
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Inbox className="w-10 h-10 text-[#A7B0C0] mb-3" />
              <p className="text-sm font-medium text-[#A7B0C0]">No recent activity</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs text-[#A7B0C0]">
                    <th className="text-left p-4 font-medium">Action</th>
                    <th className="text-left p-4 font-medium">Target</th>
                    <th className="text-left p-4 font-medium">Time</th>
                    <th className="text-right p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((item: any, i: number) => (
                    <tr key={item.id || i} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-sm text-white font-medium">{item.action || item.message || "—"}</td>
                      <td className="p-4 text-xs text-[#A7B0C0]">{item.target_type || item.target_id || "—"}</td>
                      <td className="p-4 text-xs text-[#A7B0C0]">{item.created_at ? new Date(item.created_at).toLocaleString() : "—"}</td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          item.level === "info" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" :
                          item.level === "error" ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" :
                          "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                        }`}>
                          {item.level || "info"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
