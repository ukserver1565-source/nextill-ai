"use client"

import { useAuth } from "@/lib/auth/AuthProvider"
import { supabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderKanban, Plus, Loader2, ExternalLink, Trash2, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardProjects() {
  const { profile } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newDomain, setNewDomain] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!profile) return
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", profile.user_id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setProjects(data || []); setLoading(false) })
  }, [profile])

  const createProject = async () => {
    if (!newName.trim() || !profile) return
    setCreating(true)
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: profile.user_id, name: newName.trim(), domain: newDomain.trim() || null })
      .select()
      .single()
    if (!error && data) {
      setProjects([data, ...projects])
      setNewName("")
      setNewDomain("")
    }
    setCreating(false)
  }

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return
    await supabase.from("projects").delete().eq("id", id)
    setProjects(projects.filter((p) => p.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted mt-1">{projects.length} total projects</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">New Project</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Project name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input placeholder="Domain (optional)" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} />
          <Button variant="gradient" size="sm" className="gap-1.5 shrink-0" onClick={createProject} disabled={creating || !newName.trim()}>
            <Plus className="w-4 h-4" /> Create
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="glass-card rounded-xl p-5 hover:glass-card-hover transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-primary-light" />
              </div>
              <button onClick={() => deleteProject(project.id)} className="p-1 rounded text-muted hover:text-danger">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-sm font-semibold mb-1">{project.name}</h3>
            {project.domain && <p className="text-xs text-muted mb-3">{project.domain}</p>}
            <div className="flex items-center gap-3 text-[10px] text-muted">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-xs text-muted col-span-full text-center py-10">No projects yet. Create one above.</p>}
      </div>
    </div>
  )
}
