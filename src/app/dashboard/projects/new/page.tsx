"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthProvider"
import { supabase } from "@/lib/supabase/client"
import { FolderKanban, Loader2, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    if (!name.trim() || !profile) return
    setCreating(true)
    setError("")
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: profile.user_id, name: name.trim(), domain: domain.trim() || null, description: description.trim() || null })
      .select()
      .single()
    setCreating(false)
    if (error) {
      setError(error.message || "Failed to create project. Please try again.")
    } else if (data) {
      router.push(`/dashboard/projects`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted hover:text-foreground transition-colors">
        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        Back to Projects
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Project</h1>
        <p className="text-sm text-muted mt-1">Create a project to organize your content</p>
      </div>
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mx-auto">
          <FolderKanban className="w-7 h-7 text-primary-light" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Project Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Project" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Domain (optional)</label>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-black/40 border border-muted/20 rounded-lg text-sm focus:outline-none focus:border-primary-light/40 resize-none" />
        </div>
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}
        <Button variant="gradient" className="w-full" onClick={handleCreate} disabled={creating || !name.trim()}>
          {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Project"}
        </Button>
      </div>
    </div>
  )
}
