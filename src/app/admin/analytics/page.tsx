"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, TrendingUp, Users, Eye, MousePointerClick } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const pageViewsData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  views: Math.floor(Math.random() * 8000) + 2000,
}))

const usersData = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  users: Math.floor(Math.random() * 500) + 200,
}))

const topPages = [
  { page: "/", views: 45230, avgTime: "3:45" },
  { page: "/tools/ai-writer", views: 32100, avgTime: "5:12" },
  { page: "/pricing", views: 28900, avgTime: "2:30" },
  { page: "/login", views: 24500, avgTime: "1:15" },
  { page: "/blog/seo-tips", views: 18300, avgTime: "4:20" },
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

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Track page views, users, and engagement</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-[#090B16] rounded-xl border border-white/[0.06]">
          {(["7d", "30d", "90d"] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${range === r ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white" : "text-[#A7B0C0] hover:text-white"}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Eye, label: "Page Views", value: "89,234", change: "+12.5%", color: "#6D5EF5" },
          { icon: Users, label: "Unique Visitors", value: "45,678", change: "+8.3%", color: "#4CC9F0" },
          { icon: MousePointerClick, label: "Avg. Session", value: "4m 32s", change: "+2.1%", color: "#22C55E" },
          { icon: TrendingUp, label: "Bounce Rate", value: "32.1%", change: "-5.4%", color: "#F59E0B" },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4">
              <Icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-[11px] text-[#A7B0C0]">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#6D5EF5]" /> Page Views (30 days)
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pageViewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#A7B0C0", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A7B0C0", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="views" stroke="#6D5EF5" strokeWidth={2} dot={false} name="Views" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4CC9F0]" /> Users per Month
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#A7B0C0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A7B0C0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="users" fill="#4CC9F0" radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-2 bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top Pages</h3>
          <div className="space-y-2">
            {topPages.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#A7B0C0] w-5">{i + 1}</span>
                  <span className="text-xs text-white font-medium">{p.page}</span>
                </div>
                <div className="flex items-center gap-6 text-xs text-[#A7B0C0]">
                  <span>{p.views.toLocaleString()} views</span>
                  <span>{p.avgTime} avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
