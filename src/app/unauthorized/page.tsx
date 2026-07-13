"use client"

import { ShieldAlert, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function UnauthorizedPage() {
  const [href, setHref] = useState("/login")
  const [label, setLabel] = useState("Go to Login")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setHref("/login")
        setLabel("Go to Login")
        setLoading(false)
        return
      }
      supabase
        .from("profiles")
        .select("role")
        .eq("user_id", session.user.id)
        .single()
        .then(({ data }) => {
          const role = (data as { role?: string } | null)?.role
          if (role === "admin" || role === "super_admin") {
            setHref("/admin/login")
            setLabel("Go to Admin Login")
          } else {
            setHref("/dashboard")
            setLabel("Go to Dashboard")
          }
          setLoading(false)
        }, () => setLoading(false))
    }, () => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#090B16] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-8 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Access Denied</h1>
            <p className="text-[#A7B0C0] text-sm mt-1">
              You don&apos;t have permission to access this area.
            </p>
          </div>

          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#A7B0C0] mx-auto" />
          ) : (
            <div className="space-y-3">
              <Link href={href}>
                <Button variant="gradient" className="w-full">
                  {label}
                </Button>
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = "/login"
                }}
                className="text-sm text-[#A7B0C0] hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
