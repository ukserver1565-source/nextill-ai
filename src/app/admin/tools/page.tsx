"use client"

import { useState } from "react"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import { AdminModal } from "@/components/admin/admin-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ToggleLeft, Edit3, Wrench, PenSquare, UserCheck, SearchCheck, FileSearch, Heading, FileText, Search, Shield, TrendingUp, Share2 } from "lucide-react"

const toolIcons: Record<string, React.ElementType> = {
  ai_writer: PenSquare, ai_humanizer: UserCheck, ai_detector: SearchCheck,
  plagiarism_checker: FileSearch, seo_title_generator: Heading,
  meta_description_generator: FileText, keyword_research: Search,
  website_audit: Shield, rank_tracker: TrendingUp, backlink_analyzer: Share2,
}

export default function ToolsPage() {
  const {data: tools, loading, error, refetch} = useData(() => adminApi.tools())
  const [editTool, setEditTool] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [form, setForm] = useState({
    default_model: "",
    credits_cost: 0,
    guest_daily_limit: 0,
    free_daily_limit: 0,
    premium_daily_limit: 0,
    prompt_template: "",
  })

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const openEdit = (tool: any) => {
    setEditTool(tool)
    setForm({
      default_model: tool.default_model || "",
      credits_cost: tool.credits_cost || 0,
      guest_daily_limit: tool.guest_daily_limit || 0,
      free_daily_limit: tool.free_daily_limit || 0,
      premium_daily_limit: tool.premium_daily_limit || 0,
      prompt_template: tool.prompt_template || "",
    })
    setShowEditModal(true)
  }

  const handleEdit = async () => {
    if (!editTool) return
    try {
      await adminApi.updateTool(editTool.id, form)
      setShowEditModal(false)
      setEditTool(null)
      refetch()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Tools</h1><p className="text-sm text-muted mt-1">Manage all AI tools and their settings</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(tools || []).map((tool) => {
          const Icon = toolIcons[tool.tool_slug] || Wrench
          return (
            <div key={tool.id} className="glass-card rounded-xl p-4 hover:glass-card-hover transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br", tool.is_enabled ? "from-primary to-accent" : "from-muted to-muted")}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{tool.tool_name}</h3>
                    <Badge variant={tool.is_enabled ? "success" : "ghost"} size="sm">{tool.is_enabled ? "Enabled" : "Disabled"}</Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted">Model</span><span className="font-medium">{tool.default_model}</span></div>
                <div className="flex justify-between"><span className="text-muted">Credits Cost</span><span className="font-medium">{tool.credits_cost}</span></div>
                <div className="flex justify-between"><span className="text-muted">Guest Limit</span><span>{tool.guest_daily_limit}/day</span></div>
                <div className="flex justify-between"><span className="text-muted">Free Limit</span><span>{tool.free_daily_limit}/day</span></div>
                <div className="flex justify-between"><span className="text-muted">Premium Limit</span><span>{tool.premium_daily_limit}/day</span></div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[10px] mb-1"><span className="text-muted">Usage</span><span className="font-medium">{tool.usage_count?.toLocaleString() || 0}</span></div>
                <Progress value={Math.min(((tool.usage_count || 0) / 50000) * 100, 100)} variant="gradient" size="sm" />
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <Button variant="outline" size="sm" className="rounded-lg flex-1 gap-1.5" onClick={() => openEdit(tool)}><Edit3 className="w-3.5 h-3.5" /> Edit</Button>
                <Button variant="ghost" size="sm" className="rounded-lg gap-1.5" onClick={async () => {
                  try { await adminApi.updateTool(tool.id, { is_enabled: !tool.is_enabled }); refetch() } catch (e) { console.error(e) }
                }}><ToggleLeft className="w-3.5 h-3.5" /> {tool.is_enabled ? "Disable" : "Enable"}</Button>
              </div>
            </div>
          )
        })}
      </div>

      <AdminModal open={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit: ${editTool?.tool_name || "Tool"}`} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Default Model</label>
              <Input value={form.default_model} onChange={(e) => setForm(f => ({ ...f, default_model: e.target.value }))} className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Credits Cost</label>
              <Input type="number" value={form.credits_cost} onChange={(e) => setForm(f => ({ ...f, credits_cost: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Guest Daily Limit</label>
              <Input type="number" value={form.guest_daily_limit} onChange={(e) => setForm(f => ({ ...f, guest_daily_limit: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Free Daily Limit</label>
              <Input type="number" value={form.free_daily_limit} onChange={(e) => setForm(f => ({ ...f, free_daily_limit: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Premium Daily Limit</label>
              <Input type="number" value={form.premium_daily_limit} onChange={(e) => setForm(f => ({ ...f, premium_daily_limit: Number(e.target.value) }))} className="bg-card border-border text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Prompt Template</label>
            <textarea
              value={form.prompt_template}
              onChange={(e) => setForm(f => ({ ...f, prompt_template: e.target.value }))}
              placeholder="Enter prompt template..."
              rows={3}
              className="flex w-full rounded-lg border border-border bg-card px-3 py-2 text-xs placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
