"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { sidebarMenu } from "@/lib/data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth/AuthProvider"
import {
  LayoutDashboard, PenSquare, UserCheck, SearchCheck, FileSearch,
  SpellCheck, RefreshCw, AlignLeft, Languages, Search, Heading,
  FileText, Code, Map, Bot, Link, ClipboardList, GitBranch,
  Zap, BarChart3, Shield, TrendingUp, Share2, Crosshair,
  Gauge, Unlink, FolderKanban, File, Clock, Star,
  LayoutTemplate, BookOpen, CreditCard, Key, Settings,
  LifeBuoy, ChevronDown, ChevronRight, Sparkles,
  PanelLeftClose, PanelLeft, LogOut,
} from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, PenSquare, UserCheck, SearchCheck, FileSearch,
  SpellCheck, RefreshCw, AlignLeft, Languages, Search, Heading,
  FileText, Code, Map, Bot, Link, ClipboardList, GitBranch,
  Zap, BarChart3, Shield, TrendingUp, Share2, Crosshair,
  Gauge, Unlink, FolderKanban, File, Clock, Star,
  LayoutTemplate, BookOpen, CreditCard, Key, Settings, LifeBuoy,
}

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { profile, signOut } = useAuth()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Workspace"])
  )

  const toggleSection = (name: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <aside
      className={cn(
        "h-full bg-sidebar border-r border-border flex flex-col transition-all duration-300 relative",
        collapsed ? "w-[68px]" : "w-[--sidebar-width]"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-[--topbar-height] shrink-0">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <span className="text-base font-bold tracking-tight">
                Nextill<span className="text-primary-light"> AI</span>
              </span>
              <span className="block text-[10px] text-muted font-medium tracking-widest uppercase">
                AI Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-2 mb-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors"
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>

      <ScrollArea className="flex-1 px-2 pb-4">
        <nav className="space-y-1">
          {sidebarMenu.map((section) => {
            const Icon = iconMap[section.items[0]?.icon || "LayoutDashboard"]
            const isExpanded = expandedSections.has(section.section)
            const isDashboard = section.section === "Workspace" && section.items[0]?.label === "Dashboard"

            return (
              <div key={section.section} className="space-y-0.5">
                {!collapsed && (
                  <button
                    onClick={() => !isDashboard && toggleSection(section.section)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-1.5",
                      "text-[10px] font-semibold uppercase tracking-widest text-muted",
                      "hover:text-foreground transition-colors"
                    )}
                  >
                    <span>{section.section}</span>
                    {!isDashboard && (
                      isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )
                    )}
                  </button>
                )}

                {(!collapsed && (isDashboard || isExpanded)) && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const ItemIcon = iconMap[item.icon] || LayoutDashboard
                      const isActive = item.label === "Dashboard"

                      return (
                        <a
                          key={item.label}
                          href={item.path}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                            isActive
                              ? "bg-primary/10 text-primary-light border border-primary/20"
                              : "text-muted hover:text-foreground hover:bg-card border border-transparent"
                          )}
                        >
                          <ItemIcon className={cn(
                            "w-4 h-4 shrink-0",
                            isActive && "text-primary-light"
                          )} />
                          <span className="truncate">{item.label}</span>
                          {item.label === "AI Detector" && (
                            <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold rounded bg-danger/10 text-danger border border-danger/20">
                              NEW
                            </span>
                          )}
                        </a>
                      )
                    })}
                  </div>
                )}

                {collapsed && (
                  <div className="flex flex-col items-center gap-0.5 py-1">
                    {section.items.slice(0, 1).map((item) => {
                      const ItemIcon = iconMap[item.icon] || LayoutDashboard
                      return (
                        <a
                          key={item.label}
                          href={item.path}
                          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors"
                          title={item.label}
                        >
                          <ItemIcon className="w-4 h-4" />
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-border space-y-2">
          <div className="glass-card px-3 py-3 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted">All Systems</span>
              <span className="text-success font-medium ml-auto">Online</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-2">
              <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                <span className="text-[9px] font-bold gradient-primary-text">AI</span>
              </div>
              <span className="text-muted">Credits</span>
              <span className="text-foreground font-medium ml-auto">{profile?.credits ?? 0}</span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
      {collapsed && (
        <div className="px-2 py-3 border-t border-border">
          <button
            onClick={signOut}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors mx-auto block"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  )
}
