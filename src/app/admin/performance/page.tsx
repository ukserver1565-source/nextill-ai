"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Zap, Activity, Server, TrendingUp, Loader2, Inbox } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
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

export default function PerformancePage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState([
    { icon: Zap, label: "Avg Response Time", value: "—", change: "", up: true, color: "#22C55E" },
    { icon: Activity, label: "Error Rate", value: "—", change: "", up: true, color: "#4CC9F0" },
    { icon: Server, label: "Total Requests", value: "—", change: "", up: true, color: "#6D5EF5" },
  ])
  const [performanceData, setPerformanceData] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 7)
      const cutoffStr = cutoff.toISOString()

      const { data: logs } = await supabase
        .from("ai_logs")
        .select("latency_ms, cost, success, created_at")
        .gte("created_at", cutoffStr)
        .order("created_at", { ascending: true })

      const allLogs = logs || []
      const totalRequests = allLogs.length
      const failedRequests = allLogs.filter(l => !l.success).length
      const errorRate = totalRequests > 0 ? ((failedRequests / totalRequests) * 100).toFixed(2) : "0.00"
      const avgLatency = totalRequests > 0
        ? Math.round(allLogs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / totalRequests)
        : 0

      setMetrics([
        { icon: Zap, label: "Avg Response Time", value: totalRequests > 0 ? `${avgLatency}ms` : "—", change: totalRequests > 0 ? `${totalRequests} total` : "", up: true, color: "#22C55E" },
        { icon: Activity, label: "Error Rate", value: `${errorRate}%`, change: `${failedRequests} failed`, up: failedRequests === 0, color: "#4CC9F0" },
        { icon: Server, label: "Total Requests", value: totalRequests.toLocaleString(), change: `last 7 days`, up: true, color: "#6D5EF5" },
      ])

      const hourlyData: Record<string, { requests: number; totalLatency: number }> = {}
      allLogs.forEach(l => {
        const hour = l.created_at?.slice(0, 13) || "unknown"
        if (!hourlyData[hour]) hourlyData[hour] = { requests: 0, totalLatency: 0 }
        hourlyData[hour].requests++
        hourlyData[hour].totalLatency += l.latency_ms || 0
      })
      const chartData = Object.entries(hourlyData).map(([hour, data]) => ({
        hour: hour.slice(11, 13) + ":00",
        responseTime: data.requests > 0 ? Math.round(data.totalLatency / data.requests) : 0,
        requests: data.requests,
      }))
      setPerformanceData(chartData.length > 0 ? chartData : [])

      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Performance</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">System performance and metrics monitoring</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4">
              {loading ? (
                <Loader2 className="w-5 h-5 mb-2 animate-spin text-[#A7B0C0]" />
              ) : (
                <Icon className="w-5 h-5 mb-2" style={{ color: m.color }} />
              )}
              <p className="text-xl font-bold text-white">{loading ? "—" : m.value}</p>
              <p className="text-[11px] text-[#A7B0C0]">{m.label}</p>
              {m.change && <span className={`text-[10px] font-medium ${m.up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{m.change}</span>}
            </motion.div>
          )
        })}
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#6D5EF5]" /> Response Time (7 days)
        </h3>
        <div className="h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" /></div>
          ) : performanceData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Inbox className="w-10 h-10 text-[#A7B0C0] mb-3 mx-auto" />
                <p className="text-sm font-medium text-[#A7B0C0]">No performance data yet</p>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
