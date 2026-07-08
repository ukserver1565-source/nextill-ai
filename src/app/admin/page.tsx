"use client"

import { AdminMetricCard } from "@/components/admin/admin-metric-card"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import { useAuth } from "@/lib/auth/AuthProvider"
import { Users, UserCheck, Crown, User, DollarSign, TrendingUp, Sparkles, Wrench, AlertTriangle, HeartPulse } from "lucide-react"

export default function AdminOverview() {
  const { profile } = useAuth()
  const {data, loading, error, refetch} = useData(() => adminApi.overview())

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const totalRevenue = data?.stats.totalRevenue || 0
  const monthlyRevenue = data?.stats.monthlyRevenue || 0
  const todayActive = data?.stats.activeToday || 0
  const premiumUsers = data?.stats.premiumUsers || 0
  const freeUsers = data?.stats.freeUsers || 0
  const totalCreditsUsed = data?.stats.totalUsed || 0
  const failedRequests = data?.health ? data.health.filter((h: any) => h.status !== "operational").length : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted mt-1">Welcome back, {profile?.full_name || "Admin"}. Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        <AdminMetricCard icon={Users} label="Total Users" value={data?.stats.totalUsers || 0} change="+12%" up index={0} color="text-blue-400" />
        <AdminMetricCard icon={UserCheck} label="Active Today" value={todayActive} change="+8%" up index={1} color="text-emerald-400" />
        <AdminMetricCard icon={Crown} label="Premium Users" value={premiumUsers} change="+5%" up index={2} color="text-amber-400" />
        <AdminMetricCard icon={User} label="Free Users" value={freeUsers} change="-2%" up={false} index={3} color="text-zinc-400" />
        <AdminMetricCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change="+18%" up index={4} color="text-green-400" />
        <AdminMetricCard icon={TrendingUp} label="Monthly Revenue" value={`$${monthlyRevenue.toLocaleString()}`} change="+22%" up index={5} color="text-emerald-400" />
        <AdminMetricCard icon={Sparkles} label="AI Credits Used" value={totalCreditsUsed.toLocaleString()} change="+15%" up index={6} color="text-purple-400" />
        <AdminMetricCard icon={Wrench} label="Transactions" value={data?.stats.totalTransactions || 0} change="+11%" up index={7} color="text-cyan-400" />
        <AdminMetricCard icon={AlertTriangle} label="Failed Requests" value={failedRequests} change="+1" up={false} index={8} color="text-red-400" />
        <AdminMetricCard icon={HeartPulse} label="System Health" value="98.2%" change="+0.5%" up index={9} color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Recent Payments</h2>
          <div className="space-y-2">
            {(data?.recentPayments || []).slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-xs font-medium">{p.userName}</p>
                  <p className="text-[10px] text-muted">{p.plan} plan - {p.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">${p.amount}</p>
                  <span className={`text-[10px] ${p.status === "completed" ? "text-success" : p.status === "pending" ? "text-warning" : "text-danger"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">System Health</h2>
          <div className="space-y-3">
            {(data?.health || []).map((h: any) => (
              <div key={h.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${h.status === "operational" ? "bg-success" : h.status === "degraded" ? "bg-warning" : "bg-danger"}`} />
                  <span className="text-xs">{h.label}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted">
                  <span>{h.responseTime}ms</span>
                  <span className={h.status === "operational" ? "text-success" : h.status === "degraded" ? "text-warning" : "text-danger"}>
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
