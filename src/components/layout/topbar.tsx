"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Bell, Sun, Moon, Zap, Plus, Sparkles, LogOut, Settings, User, ChevronDown, X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/AuthProvider"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { profile, signOut, user } = useAuth()
  const router = useRouter()
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U"

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="h-[--topbar-height] border-b border-border flex items-center justify-between px-3 sm:px-4 lg:px-6 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
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
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-3 w-full max-w-md h-10 px-4 rounded-lg bg-card border border-border hover:border-muted/30 transition-all group cursor-pointer"
        >
          <Search className="w-4 h-4 text-muted shrink-0" />
          <span className="text-sm text-muted flex-1 text-left">
            Search tools, projects, commands...
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-muted bg-background rounded border border-border">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
        <Link href="/dashboard">
          <Button variant="gradient" size="icon-sm" className="rounded-lg">
            <Plus className="w-4 h-4" />
          </Button>
        </Link>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-danger" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              <div className="p-4 text-center text-sm text-muted">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No new notifications</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium">{profile?.credits ?? user?.email?.charAt(0) ?? 0}</span>
          <span className="text-[10px] text-muted">Credits</span>
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link href="/pricing">
          <Button variant="gradient" size="sm" className="rounded-lg gap-1.5 hidden md:flex">
            <Zap className="w-3.5 h-3.5" />
            Upgrade
          </Button>
        </Link>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 border-l border-border hover:bg-card rounded-lg pr-2 py-1 transition-colors"
          >
            <Avatar fallback={initials} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium leading-tight">{profile?.full_name || "User"}</p>
              <p className="text-[10px] text-muted leading-tight capitalize">{profile?.plan || "Free"} Plan</p>
            </div>
            <ChevronDown className="w-3 h-3 text-muted hidden lg:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 sm:w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                <p className="text-xs text-muted">{profile?.email || user?.email || ""}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-card rounded-lg transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted hover:text-danger hover:bg-card rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSearchOpen(false)} />
          <div className="relative w-[calc(100%-2rem)] sm:w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-muted shrink-0" />
              <input
                autoFocus
                placeholder="Search tools, commands..."
                className="flex-1 bg-transparent text-sm placeholder:text-muted focus:outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="p-1 text-muted hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 text-center text-sm text-muted">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p>Type to search tools and commands</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
