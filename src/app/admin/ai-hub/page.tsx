"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, Brain, Cpu, Globe, Activity, Plus, Key, Layers, FileText, ArrowRight, CheckCircle, XCircle, Zap } from "lucide-react"

const stats = [
  { label: "Active Providers", value: "8", icon: Bot, change: "+2 this month", color: "from-[#6D5EF5] to-[#8B5CF6]" },
  { label: "Total Models", value: "24", icon: Brain, change: "+5 this month", color: "from-[#4CC9F0] to-[#3B82F6]" },
  { label: "API Keys", value: "12", icon: Key, change: "3 expiring soon", color: "from-[#22C55E] to-[#16A34A]" },
  { label: "Total Prompts", value: "15", icon: FileText, change: "2 drafts", color: "from-[#F59E0B] to-[#D97706]" },
]

const providers = [
  { name: "Gemini", icon: Globe, enabled: true, latency: "180ms", usage: "8.9K", color: "from-blue-500 to-cyan-500" },
  { name: "OpenAI", icon: Bot, enabled: true, latency: "245ms", usage: "45.2K", color: "from-emerald-500 to-teal-500" },
  { name: "Claude", icon: Brain, enabled: true, latency: "380ms", usage: "12.4K", color: "from-purple-500 to-pink-500" },
  { name: "DeepSeek", icon: Cpu, enabled: true, latency: "320ms", usage: "5.1K", color: "from-orange-500 to-red-500" },
  { name: "Perplexity", icon: Globe, enabled: true, latency: "290ms", usage: "3.7K", color: "from-[#4CC9F0] to-blue-500" },
  { name: "Mistral", icon: Brain, enabled: false, latency: "—", usage: "0", color: "from-zinc-500 to-zinc-600" },
  { name: "Grok", icon: Cpu, enabled: true, latency: "410ms", usage: "1.2K", color: "from-rose-500 to-pink-600" },
  { name: "OpenRouter", icon: Globe, enabled: true, latency: "265ms", usage: "6.8K", color: "from-amber-500 to-yellow-600" },
]

const quickActions = [
  { label: "Add Provider", icon: Plus, color: "from-[#6D5EF5] to-[#8B5CF6]", desc: "Connect a new AI provider" },
  { label: "Add API Key", icon: Key, color: "from-[#22C55E] to-[#16A34A]", desc: "Configure a new API key" },
  { label: "Add Model", icon: Layers, color: "from-[#4CC9F0] to-[#3B82F6]", desc: "Register a new AI model" },
  { label: "View Logs", icon: Activity, color: "from-[#F59E0B] to-[#D97706]", desc: "Check recent AI activity" },
]

const recentActivity = [
  { action: "API Key rotated", target: "OpenAI Production", time: "2 min ago", status: "success" },
  { action: "Model added", target: "claude-3-opus", time: "15 min ago", status: "success" },
  { action: "Provider test", target: "DeepSeek", time: "1 hour ago", status: "failed" },
  { action: "Prompt updated", target: "Keyword Analysis v3", time: "3 hours ago", status: "success" },
  { action: "Provider disabled", target: "Mistral AI", time: "5 hours ago", status: "warning" },
  { action: "Model set as default", target: "GPT-4o", time: "1 day ago", status: "success" },
]

export default function AIHubPage() {
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
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-[#A7B0C0] mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Provider Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {providers.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${p.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {p.enabled ? (
                        <CheckCircle className="w-3 h-3 text-[#22C55E]" />
                      ) : (
                        <XCircle className="w-3 h-3 text-[#A7B0C0]" />
                      )}
                      <span className={`text-[10px] ${p.enabled ? "text-[#22C55E]" : "text-[#A7B0C0]"}`}>
                        {p.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-white/[0.06]">
                  <span className="text-[#A7B0C0]">Latency: <span className="text-white font-medium">{p.latency}</span></span>
                  <span className="text-[#A7B0C0]">Usage: <span className="text-white font-medium">{p.usage}</span></span>
                </div>
              </motion.div>
            )
          })}
        </div>
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
                {recentActivity.map((item, i) => (
                  <tr key={i} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm text-white font-medium">{item.action}</td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{item.target}</td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{item.time}</td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        item.status === "success" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" :
                        item.status === "failed" ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" :
                        "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                      }`}>
                        {item.status === "success" && <CheckCircle className="w-2.5 h-2.5" />}
                        {item.status === "failed" && <XCircle className="w-2.5 h-2.5" />}
                        {item.status === "warning" && <Zap className="w-2.5 h-2.5" />}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
