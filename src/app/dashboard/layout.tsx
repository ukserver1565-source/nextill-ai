"use client"

import { useAuth } from "@/lib/auth/AuthProvider"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, profile } = useAuth()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login")
    }
    if (!loading && session && profile && (profile.role === "admin" || profile.role === "super_admin")) {
      router.push("/zain-nextill-ansari")
    }
  }, [session, loading, profile, router])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [children])

  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", mobileSidebarOpen)
    return () => document.body.classList.remove("mobile-nav-open")
  }, [mobileSidebarOpen])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 sidebar-overlay lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar: mobile = fixed drawer, desktop = static inline */}
        <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:inset-y-auto lg:relative lg:z-auto lg:transition-none ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => {
              setSidebarCollapsed(!sidebarCollapsed)
              if (window.innerWidth < 1024) setMobileSidebarOpen(false)
            }}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <TopBar onMenuClick={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
