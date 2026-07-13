"use client"

import { useAuth } from "@/lib/auth/AuthProvider"
import { supabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { CreditCard, Loader2, ArrowUpRight, ArrowDownLeft, Minus, Clock } from "lucide-react"

export default function DashboardCredits() {
  const { profile } = useAuth()
  const [credits, setCredits] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      supabase.from("credits").select("balance").eq("user_id", profile.user_id).single(),
      supabase.from("credit_logs").select("*").eq("user_id", profile.user_id).order("created_at", { ascending: false }).limit(50),
    ]).then(([credRes, logRes]) => {
      setCredits(credRes.data as { balance: number } | null)
      setLogs(logRes.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [profile])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>

  const balance = credits?.balance ?? profile?.credits ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Credits</h1>
        <p className="text-sm text-muted mt-1">Your AI processing credit balance and history</p>
      </div>

      <div className="glass-card rounded-xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-3xl font-bold">{balance.toLocaleString()}</p>
          <p className="text-xs text-muted">Available AI Credits</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Transaction History</h3>
        </div>
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-card/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                log.type === "added" ? "bg-success/10" : log.type === "removed" ? "bg-danger/10" : "bg-warning/10"
              }`}>
                {log.type === "added" ? <ArrowUpRight className="w-4 h-4 text-success" /> :
                 log.type === "removed" ? <ArrowDownLeft className="w-4 h-4 text-danger" /> :
                 <Minus className="w-4 h-4 text-warning" />}
              </div>
              <div>
                <p className="text-xs font-medium capitalize">{log.type}</p>
                <p className="text-[10px] text-muted">{log.reason || "No description"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-bold ${log.type === "added" ? "text-success" : log.type === "removed" ? "text-danger" : "text-warning"}`}>
                {log.type === "added" ? "+" : "-"}{log.amount}
              </p>
              <p className="text-[10px] text-muted">{new Date(log.created_at).toLocaleDateString("en-US")}</p>
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="text-xs text-muted text-center py-10">No credit transactions yet</p>}
      </div>
    </div>
  )
}
