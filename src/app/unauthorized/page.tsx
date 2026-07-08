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
      } else {
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
          })
      }
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 border border-danger/20 mb-6">
          <ShieldAlert className="w-8 h-8 text-danger" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-sm text-muted mb-6">
          You do not have permission to access this area.
        </p>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted mx-auto" />
        ) : (
          <Link href={href}>
            <Button variant="gradient">{label}</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
