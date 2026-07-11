"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Bell, Sparkles, ChevronDown, LogOut, Settings, Menu, Globe, Zap } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/AuthProvider"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const { profile, signOut, user } = useAuth()
  const router = useRouter()
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) setWorkspaceOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape") {
        setSearchOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U"

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="h-16 border-b border-white/[0.04] flex items-center justify-between px-3 sm:px-4 lg:px-6 bg-[#090B16]/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] transition-colors -ml-1 shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-3 w-full max-w-md h-10 px-4 rounded-lg bg-[#151C2E] border border-white/[0.06] hover:border-white/[0.12] transition-all group cursor-pointer"
        >
          <Search className="w-4 h-4 text-[#A7B0C0] shrink-0" />
          <span className="text-sm text-[#A7B0C0] flex-1 text-left">
            Search tools, projects, commands...
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#A7B0C0] bg-[#090B16] rounded border border-white/[0.06]">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#6D5EF5]/10 border border-[#6D5EF5]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#6D5EF5]" />
          <span className="text-xs font-medium text-[#6D5EF5]">{profile?.credits ?? 0}</span>
          <span className="text-[10px] text-[#6D5EF5]/60">Credits</span>
        </div>

        <div className="relative" ref={notifRef}>
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

        <div className="relative" ref={workspaceRef}>
          <button
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] border border-transparent hover:border-white/[0.06] transition-all text-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-medium">{profile?.full_name?.split(" ")[0] || "My"}'s Workspace</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[10px] font-medium text-[#22C55E]">AI Ready</span>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 border-l border-white/[0.06] hover:bg-[#151C2E] rounded-lg pr-2 py-1 transition-colors"
          >
            <Avatar fallback={initials} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-white leading-tight">{profile?.full_name || "User"}</p>
              <p className="text-[10px] text-[#A7B0C0] leading-tight capitalize">{profile?.plan || "Free"} Plan</p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#A7B0C0] hidden lg:block" />
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

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setSearchQuery("") }} />
          <div className="relative w-[calc(100%-2rem)] sm:w-full max-w-lg bg-[#111827]/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden animate-in">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-[#A7B0C0] shrink-0" />
              <input
                autoFocus
                placeholder="Search tools, commands, documents..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    router.push(`/dashboard/history?search=${encodeURIComponent(searchQuery.trim())}`)
                    setSearchOpen(false)
                    setSearchQuery("")
                  }
                }}
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#A7B0C0] bg-[#090B16] rounded border border-white/[0.06]">
                ESC
              </kbd>
            </div>
            <div className="p-6 text-center text-sm text-[#A7B0C0]">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p>Type to search tools and commands</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
