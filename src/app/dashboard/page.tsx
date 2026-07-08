"use client"

import { useAuth } from "@/lib/auth/AuthProvider"
import { supabase } from "@/lib/supabase/client"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ProjectsSection } from "@/components/dashboard/projects-section"
import { AIToolCards } from "@/components/dashboard/ai-tool-cards"
import { PulseScoreSection } from "@/components/dashboard/pulse-score"
import { TrafficChart } from "@/components/charts/traffic-chart"
import { KeywordsChart } from "@/components/charts/keywords-chart"
import { CommandCenter } from "@/components/dashboard/command-center"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart3, TrendingUp, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const { profile } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [credits, setCredits] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const uid = profile.user_id
    async function load() {
      const [projRes, docRes, credRes] = await Promise.all([
        supabase.from("projects").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
        supabase.from("documents").select("*").eq("user_id", uid).order("updated_at", { ascending: false }).limit(8),
        supabase.from("credits").select("balance").eq("user_id", uid).single(),
      ])
      setProjects(projRes.data || [])
      setDocuments(docRes.data || [])
      setCredits(credRes.data as { balance: number } | null)
      setLoading(false)
    }
    load()
  }, [profile])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    )
  }

  const userName = profile?.full_name || profile?.email || "User"
  const creditBalance = credits?.balance ?? profile?.credits ?? 0

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {userName.split(" ")[0]}</h1>
        <p className="text-sm text-muted mt-1">
          {creditBalance} AI credits remaining &middot; {projects.length} active projects
        </p>
      </div>

      <MetricCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CommandCenter />
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Keyword Growth
            </h3>
            <span className="text-xs text-success font-medium">+18.7%</span>
          </div>
          <KeywordsChart data={[]} />
        </div>
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Recent Documents
            </h3>
            <span className="text-[10px] text-muted">{documents.length} total</span>
          </div>
          <div className="space-y-2">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm truncate max-w-[200px]">{doc.title}</span>
                <span className="text-[10px] text-muted">{doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : "N/A"}</span>
              </div>
            ))}
            {documents.length === 0 && <p className="text-xs text-muted py-4 text-center">No documents yet</p>}
          </div>
        </div>
        <div>
          <PulseScoreSection />
        </div>
      </div>

      <ProjectsSection />
      <AIToolCards />
    </div>
  )
}
