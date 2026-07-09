"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { sidebarMenu } from "@/lib/data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth/AuthProvider"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Search, FileText, Shield, FolderKanban,
  File, Clock, Sparkles, Layers, Settings,
  PanelLeftClose, PanelLeft, ChevronRight, Zap, HelpCircle,
} from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Search, FileText, Shield, FolderKanban,
  File, Clock, Sparkles, Layers, Settings,
}

const sectionGroups = [
  { key: "Main", items: sidebarMenu.find(s => s.section === "Main")?.items || [] },
  { key: "Workflows", title: "Workflows", items: sidebarMenu.find(s => s.section === "Workflows")?.items || [] },
  { key: "Workspace", title: "Workspace", items: sidebarMenu.find(s => s.section === "Workspace")?.items || [] },
  { key: "Account", title: "Account", items: sidebarMenu.find(s => s.section === "Account")?.items?.slice(0, 2) || [] },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(path)
  }

  return (
    <aside
      className={cn(
        "h-full bg-[#0C1125]/80 backdrop-blur-xl border-r border-white/[0.04] flex flex-col transition-all duration-300 relative z-30",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-white/[0.04]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center shrink-0 shadow-lg shadow-[#6D5EF5]/20">
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
              <span className="text-base font-bold tracking-tight text-white">
                Nextill<span className="text-[#6D5EF5]"> AI</span>
              </span>
              <span className="block text-[10px] text-[#A7B0C0] font-medium tracking-widest uppercase">
                AI Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-2 mb-1 mt-1">
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] transition-colors",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>

      <ScrollArea className="flex-1 px-2 pb-2">
        <nav className="space-y-3">
          {sectionGroups.map((section) => {
            if (section.items.length === 0) return null
            return (
              <div key={section.key} className="space-y-0.5">
                {!collapsed && section.title && (
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#A7B0C0]">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const ItemIcon = iconMap[item.icon] || LayoutDashboard
                  const active = isActive(item.path)

                  return collapsed ? (
                    <Link
                      key={item.label}
                      href={item.path}
                      className={cn(
                        "group relative flex items-center justify-center w-full p-2 rounded-lg transition-colors",
                        active
                          ? "bg-[#6D5EF5]/10 text-[#6D5EF5]"
                          : "text-[#A7B0C0] hover:text-white hover:bg-[#151C2E]"
                      )}
                      title={item.label}
                    >
                      <ItemIcon className="w-4 h-4" />
                      <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-[#111827]/90 backdrop-blur-xl border border-white/[0.06] rounded-lg shadow-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                        {item.label}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group relative",
                        active
                          ? "bg-[#6D5EF5]/10 text-[#6D5EF5]"
                          : "text-[#A7B0C0] hover:text-white hover:bg-[#151C2E]"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#6D5EF5] rounded-r-full" />
                      )}
                      <ItemIcon className={cn("w-4 h-4 shrink-0", active && "text-[#6D5EF5]")} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="px-3 py-3 border-t border-white/[0.04] space-y-2">
          <Link
            href="/pricing"
            className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-[#6D5EF5]/20 via-[#6D5EF5]/10 to-transparent border border-[#6D5EF5]/20 group block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#6D5EF5]/0 via-[#6D5EF5]/5 to-[#4CC9F0]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#4CC9F0]" />
                <span className="text-xs font-semibold text-white">Upgrade Plan</span>
              </div>
              <p className="text-[10px] text-[#A7B0C0] mb-3">Unlock premium features and more credits</p>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.08] rounded-lg text-[11px] font-medium text-white group-hover:bg-white/[0.12] transition-colors w-fit">
                <Zap className="w-3 h-3 text-[#4CC9F0]" />
                View Plans
              </div>
            </div>
          </Link>

          <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A7B0C0]">Credits</span>
              <span className="text-white font-medium">{profile?.credits ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-[#A7B0C0]">Plan</span>
              <span className="text-white font-medium capitalize">{profile?.plan || "Free"}</span>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={signOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="px-2 py-3 border-t border-white/[0.04]">
          <button
            onClick={signOut}
            className="p-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] transition-colors mx-auto block"
            title="Sign Out"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  )
}
