"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { Search, Bell, LogOut, Globe, Menu, Settings, ChevronDown, Shield, ArrowLeft } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { adminLogout } from "@/lib/auth/admin-actions"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

export function AdminTopbar({ onSearch, onMenuClick }: { onSearch?: () => void; onMenuClick?: () => void }) {
  const pathname = usePathname()
  const showBackButton = pathname !== "/zain-nextill-ansari"
  const [userName, setUserName] = useState("Admin")
  const [userEmail, setUserEmail] = useState("")
  const [userInitials, setUserInitials] = useState("AD")
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

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

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/zain-nextill-ansari"
    }
  }

  return (
    <header className="h-16 border-b border-white/[0.04] flex items-center justify-between px-3 sm:px-4 lg:px-6 bg-[#090B16]/80 backdrop-blur-xl sticky top-0 z-30 overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] transition-colors -ml-1 shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] border border-white/[0.06] hover:border-white/[0.12] transition-all text-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Back</span>
          </button>
        )}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#6D5EF5]/10 border border-[#6D5EF5]/20">
          <Shield className="w-3.5 h-3.5 text-[#6D5EF5]" />
          <span className="text-[11px] font-semibold text-[#6D5EF5]">Admin</span>
        </div>
        <button
          onClick={onSearch}
          className="hidden sm:flex items-center gap-2 lg:gap-3 w-full max-w-[200px] lg:max-w-md h-10 px-3 lg:px-4 rounded-lg bg-[#151C2E] border border-white/[0.06] hover:border-white/[0.12] transition-all group cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4 text-[#A7B0C0] shrink-0" />
          <span className="text-xs lg:text-sm text-[#A7B0C0] flex-1 text-left truncate">Search admin panel...</span>
          <kbd className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#A7B0C0] bg-[#090B16] rounded border border-white/[0.06]">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] border border-transparent hover:border-white/[0.06] transition-all text-xs"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>View Site</span>
        </Link>

        <div className="relative">
          <button className="relative p-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[10px] font-medium text-[#22C55E]">Live</span>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 border-l border-white/[0.06] hover:bg-[#151C2E] rounded-lg pr-2 py-1 transition-colors"
          >
            <Avatar fallback={userInitials} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-white leading-tight">{userName}</p>
              <p className="text-[10px] text-[#A7B0C0] leading-tight">{userEmail || "Admin"}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#A7B0C0] hidden lg:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#111827]/95 backdrop-blur-xl border border-white/[0.06] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-[#A7B0C0]">{userEmail || "Admin"}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/zain-nextill-ansari/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] rounded-lg transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#A7B0C0] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
