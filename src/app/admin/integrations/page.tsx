"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link, Settings, CheckCircle, XCircle } from "lucide-react"

const sampleIntegrations = [
  { id: 1, name: "Google Analytics", slug: "google_analytics", icon: "📊", description: "Website traffic and analytics", connected: true },
  { id: 2, name: "Resend", slug: "resend", icon: "✉️", description: "Email delivery service", connected: true },
  { id: 3, name: "Stripe", slug: "stripe", icon: "💳", description: "Payment processing", connected: true },
  { id: 4, name: "OpenAI", slug: "openai", icon: "🤖", description: "AI model provider", connected: true },
  { id: 5, name: "Anthropic", slug: "anthropic", icon: "🧠", description: "Claude AI models", connected: false },
  { id: 6, name: "Slack", slug: "slack", icon: "💬", description: "Team notifications", connected: false },
  { id: 7, name: "GitHub", slug: "github", icon: "🐙", description: "Code repository", connected: false },
  { id: 8, name: "Google Search Console", slug: "google_search_console", icon: "🔍", description: "Search performance", connected: false },
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage third-party service connections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sampleIntegrations.map((int, i) => (
          <motion.div
            key={int.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-xl">
                  {int.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{int.name}</h3>
                  <p className="text-[10px] text-[#A7B0C0]">{int.slug}</p>
                </div>
              </div>
              {int.connected ? (
                <CheckCircle className="w-5 h-5 text-[#22C55E]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#A7B0C0]" />
              )}
            </div>
            <p className="text-xs text-[#A7B0C0] mb-4">{int.description}</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                int.connected
                  ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                  : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
              }`}>
                {int.connected ? "Connected" : "Disconnected"}
              </span>
              <button className="ml-auto p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all">
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
