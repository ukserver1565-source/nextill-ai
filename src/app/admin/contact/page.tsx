"use client"

import { useState } from "react"
import { AdminTable } from "@/components/admin/admin-table"
import { AdminSearch } from "@/components/admin/admin-search"
import { AdminModal } from "@/components/admin/admin-modal"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import type { ContactMessage } from "@/lib/admin-types"
import { formatDateTime } from "@/lib/admin-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Trash2, CheckCheck, Reply } from "lucide-react"

export default function ContactPage() {
  const [search, setSearch] = useState("")
  const {data, loading, error, refetch} = useData(() => adminApi.contact())
  const [replyMsg, setReplyMsg] = useState<ContactMessage | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyText, setReplyText] = useState("")

  const filtered = (data?.data || []).filter((m: any) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const handleSendReply = async () => {
    if (!replyMsg || !replyText) return
    try {
      const res = await fetch("/api/admin/contact/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: replyMsg.id, to: replyMsg.email, message: replyText }),
      })
      if (!res.ok) throw new Error("Failed to send")
      await adminApi.markContactRead(replyMsg.id)
      setShowReplyModal(false)
      setReplyText("")
      setReplyMsg(null)
      refetch()
    } catch (e) { console.error(e) }
  }

  const columns = [
    { key: "name", label: "From", render: (m: ContactMessage) => (
      <div><p className="text-xs font-medium">{m.name}</p><p className="text-[10px] text-muted">{m.email}</p></div>
    )},
    { key: "subject", label: "Subject", render: (m: ContactMessage) => (
      <div className="flex items-center gap-2">
        {!m.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
        <span className="text-xs">{m.subject}</span>
      </div>
    )},
    { key: "message", label: "Message", render: (m: ContactMessage) => (
      <span className="text-[11px] text-muted max-w-[250px] truncate block">{m.message}</span>
    )},
    { key: "read", label: "Status", render: (m: ContactMessage) => (
      <Badge variant={m.read ? "ghost" : "info"} size="sm">{m.read ? "Read" : "New"}</Badge>
    )},
    { key: "date", label: "Date", render: (m: ContactMessage) => (
      <span className="text-[11px] text-muted">{formatDateTime((m as any).created_at)}</span>
    )},
    { key: "actions", label: "", className: "text-right", render: (m: ContactMessage) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon-sm" className="rounded-md" onClick={() => { setReplyMsg(m); setReplyText(""); setShowReplyModal(true) }}><Reply className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="rounded-md" onClick={async () => {
          try { await adminApi.markContactRead(m.id); refetch() } catch (e) { console.error(e) }
        }}><CheckCheck className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="rounded-md text-danger" onClick={async () => {
          if (confirm("Delete this message?")) { try { await adminApi.deleteContact(m.id); refetch() } catch (e) { console.error(e) } }
        }}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1><p className="text-sm text-muted mt-1">User inquiries and support messages</p></div>
        <Badge variant="danger" size="lg">
          {data?.data.filter((m: any) => !m.read).length || 0} Unread
        </Badge>
      </div>
      <div className="w-full max-w-xs"><AdminSearch value={search} onChange={setSearch} placeholder="Search messages..." /></div>
      <div className="glass-card rounded-xl overflow-hidden">
        <AdminTable columns={columns} data={filtered} keyField="id" />
      </div>

      <AdminModal open={showReplyModal} onClose={() => setShowReplyModal(false)} title={`Reply to: ${replyMsg?.name || ""}`} size="lg">
        <div className="space-y-4">
          {replyMsg && (
            <div className="rounded-lg bg-card/50 p-3 border border-border text-xs">
              <p className="font-medium text-muted mb-1">Original message:</p>
              <p className="text-muted italic">&ldquo;{replyMsg.message}&rdquo;</p>
            </div>
          )}
          <div>
            <label className="block text-xs text-muted mb-1">Reply to: {replyMsg?.email}</label>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={5} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-xs outline-none focus:ring-2 focus:ring-primary/30 resize-y" placeholder="Type your reply..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowReplyModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleSendReply}>Send Reply</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
