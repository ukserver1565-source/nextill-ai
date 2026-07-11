"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Users, UserCheck, DollarSign, FileText, Sparkles, Activity,
  ArrowUpRight, TrendingUp, BarChart3, Clock,
  UserPlus, Ticket, FileBarChart, HeartPulse, ChevronRight, Loader2
} from "lucide-react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useAdminFetch } from "@/lib/admin/use-admin-fetch"

const quickActions = [
  { icon: UserPlus, label: "Add User", color: "from-[#6D5EF5] to-[#8B5CF6]", path: "/admin/users" },
  { icon: Ticket, label: "Create Coupon", color: "from-[#F59E0B] to-[#EF4444]", path: "/admin/coupons" },
  { icon: FileBarChart, label: "View Reports", color: "from-[#4CC9F0] to-[#6D5EF5]", path: "/admin/reports" },
  { icon: HeartPulse, label: "System Health", color: "from-[#22C55E] to-[#4CC9F0]", path: "/admin/system-health" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#151C2E]/95 backdrop-blur-xl border border-white/[0.06] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[#A7B0C0] text-xs mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-xs font-medium text-white">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { data: overview, loading, error } = useAdminFetch<any>("/api/admin/overview")
  const [date, setDate] = useState("")
  useEffect(() => { setDate(new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })) }, [])

  const statCards = overview
    ? [
        { icon: Users, label: "Total Users", value: overview.stats.totalUsers.toLocaleString(), change: `+${overview.stats.activeToday} today`, up: true, color: "#6D5EF5" },
        { icon: UserCheck, label: "Active Today", value: overview.stats.activeToday.toLocaleString(), change: `${overview.stats.premiumUsers} premium`, up: true, color: "#22C55E" },
        { icon: DollarSign, label: "Total Revenue", value: `$${overview.stats.totalRevenue.toLocaleString()}`, change: `$${overview.stats.monthlyRevenue} this month`, up: true, color: "#F59E0B" },
        { icon: FileText, label: "Projects", value: overview.stats.totalProjects.toLocaleString(), change: `${overview.stats.totalTransactions} transactions`, up: true, color: "#4CC9F0" },
        { icon: Sparkles, label: "Credits Used", value: overview.stats.totalUsed.toLocaleString(), change: `${overview.stats.totalCredits} remaining`, up: true, color: "#8B5CF6" },
        { icon: Activity, label: "Free Users", value: overview.stats.freeUsers.toLocaleString(), change: `${overview.stats.premiumUsers} premium`, up: true, color: "#EF4444" },
      ]
    : []

  const recentPayments = overview?.recentPayments || []
  const userChart = overview?.chartData?.users || []
  const revenueChart = overview?.chartData?.revenue || []

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">{date}</p>
        </div>
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-sm text-red-400">Failed to load dashboard data: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">{date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20 border border-white/[0.06] flex items-center justify-center">
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <span className={`flex items-center gap-0.5 text-[10px] font-medium ${stat.up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              {loading ? (
                <div className="h-7 w-20 bg-white/[0.04] rounded animate-pulse mb-1" />
              ) : (
                <p className="text-xl font-bold text-white">{stat.value}</p>
              )}
              <p className="text-[11px] text-[#A7B0C0] mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6D5EF5]" /> Revenue (30 days)
            </h2>
          </div>
          <div className="h-[280px]">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" /></div>
            ) : revenueChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#A7B0C0]">No revenue data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6D5EF5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6D5EF5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#A7B0C0", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#A7B0C0", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#6D5EF5" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#4CC9F0]" /> New Users (30 days)
            </h2>
          </div>
          <div className="h-[280px]">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" /></div>
            ) : userChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#A7B0C0]">No user data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#A7B0C0", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#A7B0C0", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#6D5EF5" radius={[4, 4, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#F59E0B]" /> Recent Payments
          </h2>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-white/[0.04] rounded animate-pulse" />)}</div>
          ) : recentPayments.length === 0 ? (
            <p className="text-xs text-[#A7B0C0] py-8 text-center">No payments yet</p>
          ) : (
            <div className="space-y-1">
              {recentPayments.map((p: any, i: number) => (
                <div key={p.id || i} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20 border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white">
                      ${Number(p.amount || 0).toFixed(0)}
                    </div>
                    <div>
                      <p className="text-xs text-white">{p.plan_slug || p.plan_id || "Payment"}</p>
                      <p className="text-[10px] text-[#A7B0C0]">{p.status} &middot; {p.created_at?.slice(0, 10)}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium ${p.status === "completed" ? "text-[#22C55E]" : p.status === "failed" ? "text-[#EF4444]" : "text-[#F59E0B]"}`}>
                    ${Number(p.amount || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => router.push(action.path)}
                  className="bg-[#090B16] border border-white/[0.06] rounded-xl p-4 text-center hover:border-white/[0.12] transition-all group cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-white font-medium">{action.label}</p>
                </button>
              )
            })}
          </div>
          <button onClick={() => router.push("/admin/settings")} className="w-full mt-4 py-2.5 rounded-lg bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-white/[0.12] transition-all flex items-center justify-center gap-1">
            View All Actions <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
