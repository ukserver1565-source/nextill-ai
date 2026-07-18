"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Bell, Sparkles, ChevronDown, LogOut, Settings, Menu, ArrowLeft } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/AuthProvider"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { profile, signOut, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const showBackButton = pathname !== "/dashboard"
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchFocused(true)
      }
      if (e.key === "Escape") {
        setSearchFocused(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U"

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/dashboard")
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="h-16 border-b border-white/[0.04] flex items-center justify-between px-3 sm:px-4 lg:px-6 bg-[#090B16]/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
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
        <div className="relative hidden sm:block shrink-0" ref={searchRef}>
          <div className="flex items-center gap-2 w-full max-w-[200px] lg:max-w-md h-10 px-3 lg:px-4 rounded-lg bg-[#151C2E] border border-white/[0.06] hover:border-white/[0.12] transition-all">
            <Search className="w-4 h-4 text-[#A7B0C0] shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent text-xs lg:text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none min-w-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/dashboard/history?search=${encodeURIComponent(searchQuery.trim())}`)
                  setSearchFocused(false)
                  setSearchQuery("")
                }
              }}
            />
            {!searchFocused && (
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#A7B0C0] bg-[#090B16] rounded border border-white/[0.06] shrink-0">
                ⌘K
              </kbd>
            )}
          </div>
          {searchFocused && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#111827]/95 backdrop-blur-xl border border-white/[0.06] rounded-lg shadow-2xl z-50 overflow-hidden">
              <button
                onClick={() => {
                  router.push(`/dashboard/history?search=${encodeURIComponent(searchQuery.trim())}`)
                  setSearchFocused(false)
                  setSearchQuery("")
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] transition-colors text-left"
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Search for &ldquo;{searchQuery.trim()}&rdquo;</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
        {/* Credits */}
        <div className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#6D5EF5]" />
          <span className="text-xs font-medium text-[#6D5EF5]">{profile?.credits ?? 0}</span>
          <span className="hidden lg:inline text-[10px] text-[#6D5EF5]/60">Credits</span>
        </div>

        {/* Notifications */}
        <div className="relative shrink-0" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#111827]/95 backdrop-blur-xl border border-white/[0.06] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-semibold text-white">Notifications</p>
              </div>
              <div className="p-6 text-center text-sm text-[#A7B0C0]">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No new notifications</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Ready badge - hidden on mobile */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/20 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[10px] font-medium text-[#22C55E]">AI Ready</span>
        </div>

        {/* Profile */}
        <div className="relative shrink-0" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 border-l border-white/[0.06] hover:bg-[#151C2E] rounded-lg pr-2 py-1 transition-colors"
          >
            <Avatar fallback={initials} size="sm" />
            <div className="hidden xl:block text-left">
              <p className="text-xs font-medium text-white leading-tight whitespace-nowrap">{profile?.full_name || "User"}</p>
              <p className="text-[10px] text-[#A7B0C0] leading-tight capitalize whitespace-nowrap">{profile?.plan || "Free"} Plan</p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#A7B0C0] hidden xl:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#111827]/95 backdrop-blur-xl border border-white/[0.06] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-medium text-white">{profile?.full_name || "User"}</p>
                <p className="text-xs text-[#A7B0C0]">{profile?.email || user?.email || ""}</p>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/20 capitalize">
                    {profile?.plan || "Free"}
                  </span>
                </div>
              </div>
              <div className="p-1">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] rounded-lg transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
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
