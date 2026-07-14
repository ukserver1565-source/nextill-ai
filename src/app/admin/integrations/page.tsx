"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Settings, CheckCircle, XCircle, Loader2, Link, X, Save } from "lucide-react"

interface IntegrationSetting {
  id: string
  provider_slug: string
  provider_name: string
  is_enabled: boolean
  is_connected: boolean
  last_synced_at: string | null
}

const providerIcons: Record<string, string> = {
  stripe: "💳",
  slack: "💬",
  sendgrid: "📧",
  google_analytics: "📊",
  zapier: "⚡",
  webhooks: "🔗",
}

function formatDate(d: string | null): string {
  if (!d) return "Never"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [settingsItem, setSettingsItem] = useState<IntegrationSetting | null>(null)
  const [settingsEnabled, setSettingsEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const openSettings = (item: IntegrationSetting) => {
    setSettingsItem(item)
    setSettingsEnabled(item.is_enabled)
    setSaveError("")
  }

  const handleSaveSettings = async () => {
    if (!settingsItem) return
    setSaving(true)
    setSaveError("")
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: settingsItem.provider_slug, enabled: settingsEnabled }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setIntegrations(prev => prev.map(i =>
        i.provider_slug === settingsItem.provider_slug ? { ...i, is_enabled: settingsEnabled } : i
      ))
      setSettingsItem(null)
    } catch (err: any) {
      setSaveError(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/integrations")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setIntegrations(Array.isArray(json) ? json : json.data || [])
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
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage third-party service connections</p>
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
      ) : integrations.length === 0 ? (
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-12 text-center">
          <Link className="w-10 h-10 text-[#A7B0C0] mx-auto mb-3" />
          <p className="text-sm text-[#A7B0C0]">No integrations configured</p>
          <p className="text-xs text-[#A7B0C0]/60 mt-1">Connect third-party services to extend functionality</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {integrations.map((int, i) => (
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
                    {providerIcons[int.provider_slug] || "🔗"}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{int.provider_name}</h3>
                    <p className="text-[10px] text-[#A7B0C0]">{int.provider_slug}</p>
                  </div>
                </div>
                {int.is_connected ? (
                  <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#A7B0C0]" />
                )}
              </div>
              {int.last_synced_at && (
                <p className="text-[10px] text-[#A7B0C0] mb-3">Last synced: {formatDate(int.last_synced_at)}</p>
              )}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                  int.is_connected
                    ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                    : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                }`}>
                  {int.is_connected ? "Connected" : "Disconnected"}
                </span>
                <button onClick={() => setSettingsItem(int)} className="ml-auto p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all">
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {settingsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151C2E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-white">{settingsItem.provider_name}</h2>
              <button onClick={() => setSettingsItem(null)} className="p-1 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#A7B0C0] mb-5">Integration configuration details</p>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/[0.06]">
                <span className="text-[#A7B0C0]">Provider</span>
                <span className="text-white font-medium">{settingsItem.provider_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.06]">
                <span className="text-[#A7B0C0]">Slug</span>
                <span className="text-white font-medium font-mono">{settingsItem.provider_slug}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.06]">
                <span className="text-[#A7B0C0]">Status</span>
                <span className={`font-medium ${settingsItem.is_connected ? "text-[#22C55E]" : "text-[#A7B0C0]"}`}>{settingsItem.is_connected ? "Connected" : "Disconnected"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.06]">
                <span className="text-[#A7B0C0]">Enabled</span>
                <span className={`font-medium ${settingsItem.is_enabled ? "text-[#22C55E]" : "text-[#A7B0C0]"}`}>{settingsItem.is_enabled ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#A7B0C0]">Last Synced</span>
                <span className="text-white font-medium">{formatDate(settingsItem.last_synced_at)}</span>
              </div>
            </div>
            <div className="flex justify-end pt-5">
              <button onClick={() => setSettingsItem(null)} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
