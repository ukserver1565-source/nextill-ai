"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/AuthProvider"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, LogOut, Settings } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/tools", label: "Tools" },
  { href: "/pricing", label: "Pricing" },
]

export function PublicHeader() {
  const { profile, user, signOut } = useAuth()
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const isLoggedIn = !!user

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U"

  const handleSignOut = async () => {
    setProfileOpen(false)
    await signOut()
    router.push("/login")
  }

  return (
    <header className="glass-topbar sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="gradient-primary-text">Nextill AI</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-lg hover:bg-[#151C2E] transition-colors border-l border-white/[0.06]"
              >
                <Avatar fallback={initials} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-white leading-tight whitespace-nowrap">{profile?.full_name || "User"}</p>
                  <p className="text-[10px] text-[#A7B0C0] leading-tight capitalize whitespace-nowrap">{profile?.plan || "Free"} Plan</p>
                </div>
                <ChevronDown className="w-3 h-3 text-[#A7B0C0] hidden sm:block" />
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
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] rounded-lg transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      Dashboard
                    </Link>
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
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
