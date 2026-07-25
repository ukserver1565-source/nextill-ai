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
    <header className="h-14 sm:h-16 border-b border-white/[0.06] flex items-center justify-between px-3 sm:px-4 lg:px-6 liquid-glass sticky top-0 z-30 gap-2">
      {/* Left section — mobile menu + back + admin badge + search */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all text-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Back</span>
          </button>
        )}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 shrink-0">
          <Shield className="w-3 h-3 text-[#6D5EF5]" />
          <span className="text-[10px] font-semibold text-[#6D5EF5]">Admin</span>
        </div>

        {/* Search bar — flex-1, no overlap */}
        <button
          onClick={onSearch}
          className="flex items-center gap-2 flex-1 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.06] transition-all group cursor-pointer min-w-0"
        >
          <Search className="w-4 h-4 text-[#A7B0C0] shrink-0" />
          <span className="text-xs text-[#A7B0C0] truncate hidden sm:inline">Search admin panel...</span>
          <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#A7B0C0]/60 bg-white/[0.04] rounded border border-white/[0.06] ml-auto shrink-0">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right section — view site, bell, live, profile */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all text-xs shrink-0"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>View Site</span>
        </Link>

        <button className="relative p-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-colors shrink-0">
          <Bell className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/20 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[10px] font-medium text-[#22C55E]">Live</span>
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-white/[0.06] hover:bg-white/[0.06] rounded-lg pr-1 sm:pr-2 py-1 transition-colors shrink-0"
          >
            <Avatar fallback={userInitials} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-white leading-tight">{userName}</p>
              <p className="text-[10px] text-[#A7B0C0] leading-tight">{userEmail || "Admin"}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#A7B0C0] hidden lg:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 liquid-glass-card !rounded-xl shadow-2xl z-50 overflow-hidden p-1">
              <div className="px-3 py-2.5 border-b border-white/[0.06]">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-[#A7B0C0]">{userEmail || "Admin"}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/zain-nextill-ansari/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
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
