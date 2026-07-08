"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthProvider"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { useState } from "react"
import { Loader2, Menu } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, profile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const isPublicPage = pathname === "/admin/login"

  useEffect(() => {
    if (isPublicPage) return
    if (loading) return
    if (!session) {
      router.push("/admin/login")
      return
    }
    if (!profile) return
    const role = (profile?.role || "").toLowerCase()
    if (!role || (role !== "admin" && role !== "super_admin")) {
      router.push("/unauthorized")
    }
  }, [session, loading, profile, router, isPublicPage])

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [children])

  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", mobileSidebarOpen)
    return () => document.body.classList.remove("mobile-nav-open")
  }, [mobileSidebarOpen])

  if (isPublicPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 sidebar-overlay lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar: fixed drawer on mobile, static on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:inset-y-auto lg:relative lg:z-auto lg:transition-none ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => {
            setSidebarCollapsed(!sidebarCollapsed)
            if (window.innerWidth < 1024) setMobileSidebarOpen(false)
          }}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <AdminTopbar onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
