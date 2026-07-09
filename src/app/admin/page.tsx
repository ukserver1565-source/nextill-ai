"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users, UserCheck, DollarSign, FileText, Sparkles, Activity,
  ArrowUpRight, ArrowDownRight, TrendingUp, BarChart3, Clock,
  UserPlus, Ticket, FileBarChart, HeartPulse, ChevronRight
} from "lucide-react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const stats = [
  { icon: Users, label: "Total Users", value: "24,582", change: "+12.5%", up: true, color: "#6D5EF5" },
  { icon: UserCheck, label: "Active Users", value: "8,341", change: "+8.2%", up: true, color: "#22C55E" },
  { icon: DollarSign, label: "Total Revenue", value: "$128,430", change: "+18.7%", up: true, color: "#F59E0B" },
  { icon: FileText, label: "Posts Generated", value: "342,891", change: "+22.3%", up: true, color: "#4CC9F0" },
  { icon: Sparkles, label: "Credits Used", value: "1.2M", change: "+15.1%", up: true, color: "#8B5CF6" },
  { icon: Activity, label: "AI Queries", value: "89,234", change: "+5.4%", up: true, color: "#EF4444" },
]

const revenueData = [
  { month: "Jan", revenue: 18500, users: 1200 },
  { month: "Feb", revenue: 22300, users: 1450 },
  { month: "Mar", revenue: 28900, users: 1800 },
  { month: "Apr", revenue: 34200, users: 2100 },
  { month: "May", revenue: 39800, users: 2450 },
  { month: "Jun", revenue: 45100, users: 2800 },
  { month: "Jul", revenue: 52300, users: 3200 },
]

const userGrowthData = [
  { month: "Jan", free: 800, premium: 400 },
  { month: "Feb", free: 950, premium: 500 },
  { month: "Mar", free: 1100, premium: 700 },
  { month: "Apr", free: 1300, premium: 800 },
  { month: "May", free: 1500, premium: 950 },
  { month: "Jun", free: 1700, premium: 1100 },
  { month: "Jul", free: 1900, premium: 1300 },
]

const recentActivity = [
  { user: "Sarah Chen", action: "Created new coupon SUMMER24", time: "2 min ago" },
  { user: "Mike Ross", action: "Updated system settings", time: "15 min ago" },
  { user: "Lisa Wang", action: "Added new user john@example.com", time: "1 hour ago" },
  { user: "Admin System", action: "Daily backup completed", time: "2 hours ago" },
  { user: "Tom Baker", action: "Modified Pro plan pricing", time: "3 hours ago" },
  { user: "Emma Davis", action: "Generated monthly report", time: "5 hours ago" },
]

const quickActions = [
  { icon: UserPlus, label: "Add User", color: "from-[#6D5EF5] to-[#8B5CF6]" },
  { icon: Ticket, label: "Create Coupon", color: "from-[#F59E0B] to-[#EF4444]" },
  { icon: FileBarChart, label: "View Reports", color: "from-[#4CC9F0] to-[#6D5EF5]" },
  { icon: HeartPulse, label: "System Health", color: "from-[#22C55E] to-[#4CC9F0]" },
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
  const [date] = useState(new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">{date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((stat, i) => {
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
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-[11px] text-[#A7B0C0] mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6D5EF5]" /> Revenue Overview
            </h2>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D5EF5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6D5EF5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#A7B0C0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A7B0C0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6D5EF5" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#4CC9F0]" /> User Growth
            </h2>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#A7B0C0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A7B0C0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="free" fill="#6D5EF5" radius={[4, 4, 0, 0]} name="Free" />
                <Bar dataKey="premium" fill="#4CC9F0" radius={[4, 4, 0, 0]} name="Premium" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#F59E0B]" /> Recent Activity
          </h2>
          <div className="space-y-1">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20 border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white">
                    {act.user.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs text-white">{act.action}</p>
                    <p className="text-[10px] text-[#A7B0C0]">{act.user}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#A7B0C0]">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
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
          <button className="w-full mt-4 py-2.5 rounded-lg bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-white/[0.12] transition-all flex items-center justify-center gap-1">
            View All Actions <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
