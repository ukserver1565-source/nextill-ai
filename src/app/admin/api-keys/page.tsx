"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminModal } from "@/components/admin/admin-modal"
import { Badge } from "@/components/ui/badge"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function ApiKeysPage() {
  const {data: keys, loading, error, refetch} = useData(() => adminApi.apiKeys())
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: "", key_value: "" })

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const handleCreate = async () => {
    if (!form.name) return
    try {
      await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, key_value: form.key_value || undefined }),
      })
      setShowModal(false)
      setForm({ name: "", key_value: "" })
      refetch()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">API Keys</h1><p className="text-sm text-muted mt-1">Manage API keys for external integrations</p></div>
        <Button variant="gradient" size="sm" className="gap-1.5 rounded-lg" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Create Key</Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {(keys || []).map((apiKey: any, i: number) => (
          <div key={apiKey.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-card/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-primary-light" />
              </div>
              <div>
                <p className="text-sm font-medium">{apiKey.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-[11px] text-muted font-mono">
                    {visible.has(apiKey.id) ? apiKey.key_hash : apiKey.key_hash.slice(0, 8) + "••••••••"}
                  </code>
                  <button onClick={() => {
                    const v = new Set(visible)
                    if (v.has(apiKey.id)) v.delete(apiKey.id); else v.add(apiKey.id)
                    setVisible(v)
                  }}>
                    {visible.has(apiKey.id) ? <EyeOff className="w-3 h-3 text-muted" /> : <Eye className="w-3 h-3 text-muted" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted mt-1">by {apiKey.profiles?.full_name || apiKey.profiles?.email || "Unknown"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-muted">Last used: {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : "Never"}</p>
              </div>
              <Badge variant="success" size="sm">active</Badge>
              <button className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-card" onClick={() => navigator.clipboard.writeText(apiKey.key_hash).catch(() => {})}><Copy className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger/10" onClick={async () => { if (confirm(`Delete API key "${apiKey.name}"?`)) { try { await adminApi.deleteApiKey(apiKey.id); refetch() } catch { /* ignore */ } } }}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <AdminModal open={showModal} onClose={() => setShowModal(false)} title="Create API Key" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">Key Name</label>
            <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Production API Key" className="bg-card border-border text-xs" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Key Value (optional, auto-generated if empty)</label>
            <Input value={form.key_value} onChange={(e) => setForm(f => ({ ...f, key_value: e.target.value }))} placeholder="nk_..." className="bg-card border-border text-xs font-mono" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleCreate}>Create Key</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
