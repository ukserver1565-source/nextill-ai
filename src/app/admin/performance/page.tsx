"use client"

import { motion } from "framer-motion"
import { Zap, Activity, Server, Cpu, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const performanceData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  responseTime: Math.floor(Math.random() * 150) + 20,
  requests: Math.floor(Math.random() * 500) + 100,
}))

const metrics = [
  { icon: Zap, label: "Avg Response Time", value: "45ms", change: "-12%", up: true, color: "#22C55E" },
  { icon: Activity, label: "Error Rate", value: "0.02%", change: "-0.01%", up: true, color: "#4CC9F0" },
  { icon: Server, label: "Requests/min", value: "2,345", change: "+8%", up: true, color: "#6D5EF5" },
  { icon: Cpu, label: "Memory Usage", value: "62%", change: "+3%", up: false, color: "#F59E0B" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#151C2E]/95 backdrop-blur-xl border border-white/[0.06] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[#A7B0C0] text-xs mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-xs font-medium text-white">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Performance</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">System performance and metrics monitoring</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4">
              <Icon className="w-5 h-5 mb-2" style={{ color: m.color }} />
              <p className="text-xl font-bold text-white">{m.value}</p>
              <p className="text-[11px] text-[#A7B0C0]">{m.label}</p>
              <span className={`text-[10px] font-medium ${m.up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{m.change}</span>
            </motion.div>
          )
        })}
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#6D5EF5]" /> Response Time (24h)
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#A7B0C0", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#A7B0C0", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="responseTime" stroke="#6D5EF5" strokeWidth={2} dot={false} name="Response Time (ms)" />
              <Line type="monotone" dataKey="requests" stroke="#4CC9F0" strokeWidth={2} dot={false} name="Requests" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
