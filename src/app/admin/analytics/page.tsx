"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Calendar, TrendingUp, Users, Eye, MousePointerClick, Loader2, Inbox } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabase/client"

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

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState("30d")
  const [totalPageViews, setTotalPageViews] = useState(0)
  const [uniqueVisitors, setUniqueVisitors] = useState(0)
  const [avgSession, setAvgSession] = useState("—")
  const [bounceRate, setBounceRate] = useState("—")
  const [topPages, setTopPages] = useState<any[]>([])
  const [pageViewsData, setPageViewsData] = useState<any[]>([])
  const [usersData, setUsersData] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const daysAgo = range === "7d" ? 7 : range === "90d" ? 90 : 30
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - daysAgo)
        const cutoffStr = cutoff.toISOString()

        const [usageRes, usersRes, docsRes] = await Promise.all([
          supabase.from("usage_logs").select("created_at, tool_slug, user_id, guest_id").gte("created_at", cutoffStr),
          supabase.from("profiles").select("created_at").gte("created_at", cutoffStr),
          supabase.from("documents").select("tool_slug, created_at").gte("created_at", cutoffStr),
        ])

        const logs = usageRes.data || []
        setTotalPageViews(logs.length)

        const uniqueUserIds = new Set(logs.filter(l => l.user_id).map(l => l.user_id))
        const uniqueGuestIds = new Set(logs.filter(l => l.guest_id).map(l => l.guest_id))
        setUniqueVisitors(uniqueUserIds.size + uniqueGuestIds.size)

        const toolCounts: Record<string, number> = {}
        logs.forEach(l => { if (l.tool_slug) toolCounts[l.tool_slug] = (toolCounts[l.tool_slug] || 0) + 1 })
        const sorted = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
        setTopPages(sorted.map(([slug, views]) => ({ page: `/tools/${slug}`, views, avgTime: "—" })))

      const dailyViews: Record<string, number> = {}
      logs.forEach(l => {
        const day = l.created_at?.slice(0, 10) || "unknown"
        dailyViews[day] = (dailyViews[day] || 0) + 1
      })
      const dailyArr = Object.entries(dailyViews).sort((a, b) => a[0].localeCompare(b[0])).map(([date, views]) => ({ date, views }))
      setPageViewsData(dailyArr.length > 0 ? dailyArr : [])

      const monthlyUsers: Record<string, number> = {}
      const allUsers = usersRes.data || []
      allUsers.forEach((u: any) => {
        const month = u.created_at?.slice(0, 7) || "unknown"
        monthlyUsers[month] = (monthlyUsers[month] || 0) + 1
      })
      const monthArr = Object.entries(monthlyUsers).sort((a, b) => a[0].localeCompare(b[0])).map(([month, users]) => ({
        month: new Date(month + "-01").toLocaleString("en-US", { month: "short" }),
        users,
      }))
      setUsersData(monthArr.length > 0 ? monthArr : [])

      setAvgSession(logs.length > 0 && uniqueUserIds.size > 0 ? `${Math.round(logs.length / uniqueUserIds.size)} hits/user` : "—")
      setBounceRate("—")

      } catch {}
      setLoading(false)
    }
    load()
  }, [range])

  const statCards = [
    { icon: Eye, label: "Total Usage Events", value: totalPageViews.toLocaleString(), color: "#6D5EF5" },
    { icon: Users, label: "Unique Visitors", value: uniqueVisitors.toLocaleString(), color: "#4CC9F0" },
    { icon: MousePointerClick, label: "Avg. Session", value: avgSession, color: "#22C55E" },
    { icon: TrendingUp, label: "Bounce Rate", value: bounceRate, color: "#F59E0B" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Track usage, users, and tool activity</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-[#090B16] rounded-xl border border-white/[0.06]">
          {(["7d", "30d", "90d"] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${range === r ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white" : "text-[#A7B0C0] hover:text-white"}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4">
              {loading ? (
                <Loader2 className="w-5 h-5 mb-2 animate-spin text-[#A7B0C0]" />
              ) : (
                <Icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
              )}
              <p className="text-xl font-bold text-white">{loading ? "—" : stat.value}</p>
              <p className="text-[11px] text-[#A7B0C0]">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#6D5EF5]" /> Usage Events ({range})
          </h3>
          <div className="h-[280px]">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" /></div>
            ) : pageViewsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#A7B0C0]">No usage data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pageViewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#A7B0C0", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#A7B0C0", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="views" stroke="#6D5EF5" strokeWidth={2} dot={false} name="Events" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4CC9F0]" /> New Users per Month
          </h3>
          <div className="h-[280px]">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" /></div>
            ) : usersData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#A7B0C0]">No user data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#A7B0C0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#A7B0C0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="users" fill="#4CC9F0" radius={[4, 4, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top Tools Used</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" /></div>
          ) : topPages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Inbox className="w-10 h-10 text-[#A7B0C0] mb-3" />
              <p className="text-sm font-medium text-[#A7B0C0]">No tool usage yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topPages.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#A7B0C0] w-5">{i + 1}</span>
                    <span className="text-xs text-white font-medium">{p.page}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-[#A7B0C0]">
                    <span>{p.views.toLocaleString()} uses</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
