"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Cpu, Brain, Key, Shield, Settings as SettingsIcon,
  CreditCard, DollarSign, Users, FolderKanban, FileText, BarChart3,
  FileSpreadsheet, MessageSquare, FileEdit, TicketPercent, HeartPulse,
  ChevronDown, ChevronRight, Sparkles,
  PanelLeftClose, PanelLeft, Mail, Terminal, Database, Zap,
  Link as LinkIcon, Workflow, Search, Wrench,
} from "lucide-react"
import { ThemeToggle } from "@/components/shared/theme-toggle"

const menuSections = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/zain-nextill-ansari" },
    ],
  },
  {
    section: "AI Hub",
    items: [
      { label: "AI Hub", icon: Cpu, href: "/zain-nextill-ansari/ai-hub" },
      { label: "Providers", icon: Brain, href: "/zain-nextill-ansari/ai-hub/providers" },
      { label: "API Keys", icon: Key, href: "/zain-nextill-ansari/ai-hub/api-keys" },
      { label: "Models", icon: Zap, href: "/zain-nextill-ansari/ai-hub/models" },
      { label: "Prompts", icon: FileText, href: "/zain-nextill-ansari/ai-hub/prompts" },
    ],
  },
  {
    section: "Business",
    items: [
      { label: "Plans", icon: CreditCard, href: "/zain-nextill-ansari/plans" },
      { label: "Credits", icon: DollarSign, href: "/zain-nextill-ansari/credits" },
      { label: "Users", icon: Users, href: "/zain-nextill-ansari/users" },
      { label: "Payments", icon: DollarSign, href: "/zain-nextill-ansari/payments" },
      { label: "Pending Approvals", icon: HeartPulse, href: "/zain-nextill-ansari/payments/pending" },
      { label: "Coupons", icon: TicketPercent, href: "/zain-nextill-ansari/coupons" },
    ],
  },
  {
    section: "Tools",
    items: [
      { label: "Tools", icon: Wrench, href: "/zain-nextill-ansari/tools" },
      { label: "Workflows", icon: Workflow, href: "/zain-nextill-ansari/workflows" },
    ],
  },
  {
    section: "Settings",
    items: [
      { label: "Site Settings", icon: SettingsIcon, href: "/zain-nextill-ansari/settings" },
      { label: "Security", icon: Shield, href: "/zain-nextill-ansari/security" },
      { label: "Performance", icon: Zap, href: "/zain-nextill-ansari/performance" },
      { label: "Integrations", icon: LinkIcon, href: "/zain-nextill-ansari/integrations" },
      { label: "SEO", icon: Search, href: "/zain-nextill-ansari/seo" },
      { label: "Email", icon: Mail, href: "/zain-nextill-ansari/email" },
      { label: "Backups", icon: Database, href: "/zain-nextill-ansari/backups" },
      { label: "Maintenance", icon: Wrench, href: "/zain-nextill-ansari/maintenance" },
    ],
  },
  {
    section: "Monitoring",
    items: [
      { label: "Analytics", icon: BarChart3, href: "/zain-nextill-ansari/analytics" },
      { label: "Logs", icon: Terminal, href: "/zain-nextill-ansari/logs" },
      { label: "Reports", icon: FileSpreadsheet, href: "/zain-nextill-ansari/reports" },
    ],
  },
  {
    section: "Content",
    items: [
      { label: "Documents", icon: FileText, href: "/zain-nextill-ansari/documents" },
      { label: "Projects", icon: FolderKanban, href: "/zain-nextill-ansari/projects" },
      { label: "Blog", icon: FileEdit, href: "/zain-nextill-ansari/blog" },
      { label: "Contact", icon: MessageSquare, href: "/zain-nextill-ansari/contact" },
    ],
  },
  {
    section: "System",
    items: [
      { label: "System Health", icon: HeartPulse, href: "/zain-nextill-ansari/system-health" },
    ],
  },
]

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(menuSections.map(s => s.section))
  )

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const allItems = menuSections.flatMap(s => s.items)

  return (
    <aside className={cn(
      "h-full bg-[#0C1125]/80 backdrop-blur-xl border-r border-white/[0.04] flex flex-col transition-all duration-300 shrink-0",
      collapsed ? "w-[72px]" : "w-[280px]"
    )}>
      <div className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-white/[0.04]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center shrink-0 shadow-lg shadow-[#6D5EF5]/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-sm font-bold tracking-tight text-white">
              Nextill<span className="text-[#6D5EF5]"> AI</span>
            </span>
            <span className="block text-[9px] text-[#A7B0C0] font-medium tracking-widest uppercase">Admin Panel</span>
          </div>
        )}
      </div>

      <div className="px-2 py-2 border-b border-white/[0.04]">
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] transition-colors text-xs",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {collapsed ? (
          <div className="space-y-0.5">
            {allItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center justify-center w-full p-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#6D5EF5]/10 text-[#6D5EF5]"
                      : "text-[#A7B0C0] hover:text-white hover:bg-[#151C2E]"
                  )}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-[#111827]/90 backdrop-blur-xl border border-white/[0.06] rounded-lg shadow-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          menuSections.map((section) => {
            const isExpanded = expandedSections.has(section.section)
            return (
              <div key={section.section} className="mb-0.5">
                <button
                  onClick={() => toggleSection(section.section)}
                  className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#A7B0C0] hover:text-white transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  <span>{section.section}</span>
                </button>
                {isExpanded && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group relative",
                            isActive
                              ? "bg-[#6D5EF5]/10 text-[#6D5EF5]"
                              : "text-[#A7B0C0] hover:text-white hover:bg-[#151C2E]"
                          )}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#6D5EF5] rounded-r-full" />
                          )}
                          <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-[#6D5EF5]")} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/[0.04]">
        <ThemeToggle className={collapsed ? "justify-center px-2" : ""} />
        <div className={cn("flex items-center gap-2 mt-2", collapsed ? "justify-center" : "px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]")}>
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shadow-lg shadow-[#22C55E]/30" />
          {!collapsed && (
            <>
              <span className="text-xs text-[#A7B0C0]">System</span>
              <span className="text-[11px] font-medium text-[#22C55E] ml-auto">All Systems Operational</span>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
