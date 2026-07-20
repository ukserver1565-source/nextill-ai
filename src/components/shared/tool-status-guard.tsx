"use client"

import { useState, useEffect } from "react"
import { Clock, Wrench, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

interface ToolStatusGuardProps {
  /** The workflow slug to check status for (e.g. "post-generator") */
  toolSlug: string
  /** The tool display name */
  toolName: string
  /** The tool description */
  toolDescription: string
  /** The tool icon color */
  color?: string
  /** The actual tool content to render when status is "published" */
  children: React.ReactNode
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock; description: string }> = {
  coming_soon: {
    label: "Coming Soon",
    color: "text-[#F59E0B]",
    bgColor: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
    icon: Clock,
    description: "This tool is being configured. Check back soon!",
  },
  maintenance: {
    label: "Under Maintenance",
    color: "text-[#EF4444]",
    bgColor: "bg-[#EF4444]/10 border-[#EF4444]/20",
    icon: Wrench,
    description: "This tool is temporarily unavailable for maintenance. We'll be back soon.",
  },
  published: {
    label: "Available",
    color: "text-[#22C55E]",
    bgColor: "bg-[#22C55E]/10 border-[#22C55E]/20",
    icon: Lock,
    description: "",
  },
}

export function ToolStatusGuard({ toolSlug, toolName, toolDescription, color = "from-[#6D5EF5] to-[#8B5CF6]", children }: ToolStatusGuardProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/public/workflow-settings")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const tool = data.find((t: any) => t.workflow_slug === toolSlug)
          // Default to "published" if no status column exists yet (migration not applied)
          setStatus(tool?.status || "published")
        } else {
          setStatus("published")
        }
      })
      .catch(() => setStatus("published"))
      .finally(() => setLoading(false))
  }, [toolSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted">Loading tool...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    )
  }

  const config = statusConfig[status || "published"]
  const isAvailable = status === "published" || status === null
  const StatusIcon = config.icon

  if (isAvailable) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className={`w-16 h-16 rounded-2xl ${config.bgColor} border flex items-center justify-center mx-auto mb-6`}>
            <StatusIcon className={`w-8 h-8 ${config.color}`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{toolName}</h2>
          <p className={`font-medium mb-3 ${config.color}`}>{config.label}</p>
          <p className="text-sm text-muted mb-8 leading-relaxed">{config.description}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white hover:bg-white/[0.06] transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> View All Tools
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
