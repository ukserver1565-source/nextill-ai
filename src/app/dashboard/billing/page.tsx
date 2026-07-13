"use client"

import { useState, useEffect } from "react"
import { CreditCard, Loader2, ExternalLink } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthProvider"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

export default function DashboardBillingPage() {
  const { profile } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [recentPayment, setRecentPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const uid = profile.user_id
    async function load() {
      try {
        const [subRes, payRes] = await Promise.all([
          supabase.from("subscriptions").select("*").eq("user_id", uid).eq("status", "active").single(),
          supabase.from("payments").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).single(),
        ])
        setSubscription(subRes.data)
        setRecentPayment(payRes.data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [profile])

  const plan = profile?.plan || "free"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted mt-1">Manage your subscription and billing information.</p>
      </div>

      {loading ? (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-muted mb-4 animate-spin" />
          <p className="text-sm text-muted">Loading billing information...</p>
        </div>
      ) : subscription ? (
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Current Subscription</h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                {subscription.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1">Plan</p>
                <p className="text-sm font-medium text-white capitalize">{subscription.plan_slug || plan}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Current Period</p>
                <p className="text-sm font-medium text-white">
                  {subscription.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString() : "—"}
                  {" — "}
                  {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          </div>

          {recentPayment && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Last Payment</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted">Amount</p>
                  <p className="text-lg font-bold text-white">${Number(recentPayment.amount || 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Status</p>
                  <span className={`text-xs font-medium ${recentPayment.status === "completed" ? "text-[#22C55E]" : "text-[#F59E0B]"}`}>
                    {recentPayment.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <CreditCard className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-semibold mb-1 capitalize">Free Plan</h3>
          <p className="text-sm text-muted max-w-md mb-4">
            You are currently on the Free plan. Upgrade to unlock premium AI tools and higher credit limits.
          </p>
          <Link href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            View Plans <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
