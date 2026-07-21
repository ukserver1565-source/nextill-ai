"use client"

import { ShieldAlert, ArrowLeft, Loader2, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/AuthProvider"

export default function UnauthorizedPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Give auth a moment to hydrate
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin"
  const isLoggedIn = !!user

  const primaryHref = !isLoggedIn ? "/login" : isAdmin ? "/zain-nextill-ansari" : "/dashboard"
  const primaryLabel = !isLoggedIn ? "Sign In" : isAdmin ? "Go to Admin Panel" : "Go to Dashboard"

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20">
            <ShieldAlert className="w-8 h-8 text-[#EF4444]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-sm text-muted leading-relaxed">
              You don&apos;t have permission to access this page.
            </p>
            {!isLoggedIn && (
              <p className="text-xs text-muted mt-2">
                Please sign in with an authorized account to continue.
              </p>
            )}
          </div>

          {loading || authLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted" />
              <span className="text-xs text-muted">Checking your session...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <Link href={primaryHref}>
                <Button variant="gradient" className="w-full h-11">
                  {primaryLabel}
                </Button>
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
                <Home className="w-4 h-4" /> Back to Home
              </Link>
              {isLoggedIn && (
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    window.location.href = "/login"
                  }}
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-[#EF4444] transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
