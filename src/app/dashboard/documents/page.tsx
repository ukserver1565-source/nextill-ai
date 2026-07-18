"use client"

import { useAuth } from "@/lib/auth/AuthProvider"
import { supabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Clock, Trash2, FileIcon } from "lucide-react"

export default function DashboardDocuments() {
  const { profile } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const refreshDocuments = async () => {
    if (!profile) return
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", profile.user_id)
      .order("updated_at", { ascending: false })
    setDocuments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    refreshDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  useEffect(() => {
    const onFocus = () => { if (profile) refreshDocuments() }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const deleteDoc = async (id: string) => {
    if (!confirm("Delete this document?")) return
    const { error } = await supabase.from("documents").delete().eq("id", id)
    if (error) {
      console.error("Failed to delete document:", error)
      return
    }
    setDocuments(documents.filter((d) => d.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm text-muted mt-1">{documents.length} total documents</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} onClick={() => router.push(`/${doc.tool_slug || "post-generator"}?docId=${doc.id}`)} className="glass-card rounded-xl p-4 hover:glass-card-hover transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FileIcon className="w-5 h-5 text-primary-light" />
              </div>
              <button onClick={() => deleteDoc(doc.id)} className="p-1 rounded text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-sm font-semibold mb-1 line-clamp-2">{doc.title}</h3>
            {doc.tool_slug && <p className="text-[10px] text-muted mb-2">via {doc.tool_slug}</p>}
            <div className="flex items-center gap-1 text-[10px] text-muted">
              <Clock className="w-3 h-3" /> {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString("en-US") : "N/A"}
            </div>
          </div>
        ))}
        {documents.length === 0 && <p className="text-xs text-muted col-span-full text-center py-10">No documents yet</p>}
      </div>
    </div>
  )
}
