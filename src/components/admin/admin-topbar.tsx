"use client"

import { useEffect, useState } from "react"
import { Search, Bell, LogOut, Globe, Menu } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Tooltip } from "@/components/ui/tooltip"
import { adminLogout } from "@/lib/auth/admin-actions"
import { supabase } from "@/lib/supabase/client"

export function AdminTopbar({ onSearch, onMenuClick }: { onSearch?: () => void; onMenuClick?: () => void }) {
  const [userName, setUserName] = useState("Admin")
  const [userEmail, setUserEmail] = useState("")
  const [userInitials, setUserInitials] = useState("AD")

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || "")
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin"
        setUserName(name)
        const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        setUserInitials(initials || "AD")
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await adminLogout()
  }

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-3 sm:px-4 lg:px-6 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors -ml-1 shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onSearch}
          className="hidden sm:flex items-center gap-3 w-full max-w-md h-10 px-4 rounded-lg bg-card border border-border hover:border-muted/30 transition-all group cursor-pointer"
        >
          <Search className="w-4 h-4 text-muted shrink-0" />
          <span className="text-sm text-muted flex-1 text-left">Search admin panel...</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-muted bg-background rounded border border-border">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
        <Tooltip content="View Site">
          <button onClick={() => window.open("/", "_blank")} className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors">
            <Globe className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Notifications">
          <button className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger text-[8px] font-bold text-white flex items-center justify-center">3</span>
          </button>
        </Tooltip>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-muted">Live</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <Avatar fallback={userInitials} size="sm" />
          <div className="hidden lg:block">
            <p className="text-xs font-medium leading-tight">{userName}</p>
            <p className="text-[10px] text-muted leading-tight">{userEmail || "Admin"}</p>
          </div>
        </div>

        <Tooltip content="Logout">
          <button onClick={handleLogout} className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </header>
  )
}
