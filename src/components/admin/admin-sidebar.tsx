"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Users, CreditCard, DollarSign, Wrench, Cpu,
  FolderKanban, FileText, BarChart3, FileSpreadsheet, MessageSquare,
  FileEdit, TicketPercent, Key, Shield, Settings, HeartPulse,
  Wrench as WrenchIcon, ChevronDown, ChevronRight, Sparkles,
  PanelLeftClose, PanelLeft,
} from "lucide-react"

const menuItems = [
  { label: "Admin Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Plans", icon: CreditCard, href: "/admin/plans" },
  { label: "Credits", icon: DollarSign, href: "/admin/credits" },
  { label: "Payments", icon: DollarSign, href: "/admin/payments" },
  { label: "Tools", icon: Wrench, href: "/admin/tools" },
  { label: "AI Models", icon: Cpu, href: "/admin/ai-models" },
  { label: "Projects", icon: FolderKanban, href: "/admin/projects" },
  { label: "Documents", icon: FileText, href: "/admin/documents" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Reports", icon: FileSpreadsheet, href: "/admin/reports" },
  { label: "Contact", icon: MessageSquare, href: "/admin/contact" },
  { label: "Blog", icon: FileEdit, href: "/admin/blog" },
  { label: "Coupons", icon: TicketPercent, href: "/admin/coupons" },
  { label: "API Keys", icon: Key, href: "/admin/api-keys" },
  { label: "Security Logs", icon: Shield, href: "/admin/security" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
  { label: "System Health", icon: HeartPulse, href: "/admin/system-health" },
  { label: "Maintenance", icon: WrenchIcon, href: "/admin/maintenance" },
]

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      "h-full bg-sidebar border-r border-border flex flex-col transition-all duration-300 shrink-0",
      collapsed ? "w-[68px]" : "w-64"
    )}>
      <div className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-border">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-sm font-bold tracking-tight">
              Nextill<span className="text-primary-light"> AI</span>
            </span>
            <span className="block text-[9px] text-muted font-medium tracking-widest uppercase">Admin Panel</span>
          </div>
        )}
      </div>

      <div className="px-2 py-2 border-b border-border">
        <button onClick={onToggle} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors text-xs">
          {collapsed ? <PanelLeft className="w-4 h-4 mx-auto" /> : <><PanelLeftClose className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary-light border border-primary/20"
                : "text-muted hover:text-foreground hover:bg-card border border-transparent",
              collapsed && "justify-center px-2"
            )}>
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-border">
        {!collapsed && (
          <div className="glass-card px-3 py-2 rounded-lg flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted">System</span>
            <span className="text-success font-medium ml-auto">Online</span>
          </div>
        )}
      </div>
    </aside>
  )
}
