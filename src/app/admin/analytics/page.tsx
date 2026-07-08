"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import { formatCurrency } from "@/lib/admin-utils"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 text-sm shadow-xl">
      <p className="text-muted text-xs mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-xs font-medium">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: users, loading, error, refetch } = useData(() => adminApi.users({ limit: "100" }))
  const { data: tools } = useData(() => adminApi.tools())

  const usersArr = users?.data || []
  const toolsArr = tools || []

  const usersByPlan = [
    { name: "Free", value: usersArr.filter((u: any) => (u.plan || u.plan_id) === "free").length, color: "#6b7280" },
    { name: "Starter", value: usersArr.filter((u: any) => (u.plan || u.plan_id) === "starter").length, color: "#10b981" },
    { name: "Pro", value: usersArr.filter((u: any) => (u.plan || u.plan_id) === "pro").length, color: "#6366f1" },
    { name: "Agency", value: usersArr.filter((u: any) => (u.plan || u.plan_id) === "agency").length, color: "#8b5cf6" },
    { name: "Enterprise", value: usersArr.filter((u: any) => (u.plan || u.plan_id) === "enterprise").length, color: "#f59e0b" },
  ]

  const monthlyRevenue = [
    { month: "Jan", revenue: 1200 }, { month: "Feb", revenue: 1800 },
    { month: "Mar", revenue: 2400 }, { month: "Apr", revenue: 2800 },
    { month: "May", revenue: 3200 }, { month: "Jun", revenue: 4100 },
  ]

  const toolsUsageChart = toolsArr.map((t: any) => ({ name: t.name.replace(/_/g, " ").slice(0, 12), usage: t.usage_count }))

  const conversionRate = ((usersArr.filter((u: any) => (u.plan || u.plan_id) !== "free").length / (usersArr.length || 1)) * 100).toFixed(1)

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Analytics</h1><p className="text-sm text-muted mt-1">Dashboard analytics and insights</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg Users/Day", value: "124" },
          { label: "Avg Users/Week", value: "845" },
          { label: "Avg Users/Month", value: "3,240" },
          { label: "Conversion Rate", value: `${conversionRate}%` },
        ].map((m) => (
          <div key={m.label} className="glass-card rounded-xl p-4 text-center">
            <p className="text-xl font-bold">{m.value}</p>
            <p className="text-[11px] text-muted mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Monthly Revenue</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Users by Plan</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={usersByPlan} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {usersByPlan.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 xl:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Tool Usage</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={toolsUsageChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="usage" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Usage" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
