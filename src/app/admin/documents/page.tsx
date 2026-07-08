"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminModal } from "@/components/admin/admin-modal"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import { FileText, Plus, Clock, FileIcon } from "lucide-react"

export default function AdminDocumentsPage() {
  const {data, loading, error, refetch} = useData(() => adminApi.documents())
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: "", user_id: "", content: "" })

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const docs = data?.data || []

  const handleCreate = async () => {
    if (!form.title) return
    try {
      await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, user_id: form.user_id || undefined, content: form.content }),
      })
      setShowModal(false)
      setForm({ title: "", user_id: "", content: "" })
      refetch()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Documents</h1><p className="text-sm text-muted mt-1">All documents created across the platform</p></div>
        <Button variant="gradient" size="sm" className="gap-1.5 rounded-lg" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> New Document</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {docs.slice(0, 8).map((doc: any) => (
          <div key={doc.id} className="glass-card rounded-xl p-4 hover:glass-card-hover transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <FileIcon className="w-5 h-5 text-primary-light" />
            </div>
            <p className="text-sm font-semibold mb-1 line-clamp-1">{doc.title}</p>
            <p className="text-xs text-muted">by {doc.full_name || doc.email || "Unknown"}</p>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted">
              <Clock className="w-3 h-3" /> {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : "N/A"}
            </div>
          </div>
        ))}
      </div>

      <AdminModal open={showModal} onClose={() => setShowModal(false)} title="New Document" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">Title</label>
            <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Document title" className="bg-card border-border text-xs" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">User ID (optional)</label>
            <Input value={form.user_id} onChange={(e) => setForm(f => ({ ...f, user_id: e.target.value }))} placeholder="uuid..." className="bg-card border-border text-xs font-mono" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} rows={4} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-xs outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleCreate}>Create Document</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
