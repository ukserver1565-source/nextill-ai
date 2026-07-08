"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminModal } from "@/components/admin/admin-modal"
import { FolderKanban, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"

export default function AdminProjectsPage() {
  const { data, loading, error, refetch } = useData(() => adminApi.projects())
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: "", domain: "", user_id: "" })
  const projects = data?.data || []

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const handleCreate = async () => {
    if (!form.name) return
    try {
      await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, domain: form.domain || undefined, user_id: form.user_id || undefined }),
      })
      setShowModal(false)
      setForm({ name: "", domain: "", user_id: "" })
      refetch()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Projects</h1><p className="text-sm text-muted mt-1">All user projects across the platform</p></div>
        <Button variant="gradient" size="sm" className="gap-1.5 rounded-lg" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> New Project</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {projects.map((p: any) => (
          <div key={p.id} className="glass-card rounded-xl p-4 hover:glass-card-hover transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-xs">{p.name.charAt(0)}</div>
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-[10px] text-muted">{p.domain}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted">Articles</span><p className="font-medium">{p.articles}</p></div>
              <div><span className="text-muted">Keywords</span><p className="font-medium">{p.keywords.toLocaleString()}</p></div>
              <div><span className="text-muted">Traffic</span><p className="font-medium">{p.traffic}</p></div>
              <div><span className="text-muted">SEO Score</span><p className="font-medium">{p.seo_score}</p></div>
            </div>
            <div className="mt-3">
              <Progress value={p.seo_score} variant={p.seo_score >= 80 ? "success" : p.seo_score >= 60 ? "default" : "warning"} size="sm" />
            </div>
          </div>
        ))}
      </div>

      <AdminModal open={showModal} onClose={() => setShowModal(false)} title="New Project" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">Project Name</label>
            <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Website" className="bg-card border-border text-xs" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Domain</label>
            <Input value={form.domain} onChange={(e) => setForm(f => ({ ...f, domain: e.target.value }))} placeholder="example.com" className="bg-card border-border text-xs" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">User ID (optional)</label>
            <Input value={form.user_id} onChange={(e) => setForm(f => ({ ...f, user_id: e.target.value }))} placeholder="uuid..." className="bg-card border-border text-xs font-mono" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleCreate}>Create Project</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
