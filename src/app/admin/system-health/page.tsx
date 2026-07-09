"use client"

import { motion } from "framer-motion"
import { HeartPulse, Activity, Clock, Server, CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react"

const services = [
  { name: "API Server", status: "operational", uptime: 99.98, responseTime: "24ms", lastChecked: "Just now" },
  { name: "Database", status: "operational", uptime: 99.99, responseTime: "12ms", lastChecked: "Just now" },
  { name: "AI Providers", status: "degraded", uptime: 98.5, responseTime: "450ms", lastChecked: "2 min ago" },
  { name: "Queue Workers", status: "operational", uptime: 99.95, responseTime: "8ms", lastChecked: "Just now" },
  { name: "Cache (Redis)", status: "operational", uptime: 100, responseTime: "3ms", lastChecked: "Just now" },
  { name: "File Storage", status: "operational", uptime: 99.97, responseTime: "45ms", lastChecked: "1 min ago" },
]

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  operational: { icon: CheckCircle, color: "#22C55E", bg: "bg-[#22C55E]/10" },
  degraded: { icon: AlertTriangle, color: "#F59E0B", bg: "bg-[#F59E0B]/10" },
  down: { icon: XCircle, color: "#EF4444", bg: "bg-[#EF4444]/10" },
}

export default function SystemHealthPage() {
  const avgUptime = (services.reduce((s, svc) => s + svc.uptime, 0) / services.length).toFixed(2)
  const operationalCount = services.filter(s => s.status === "operational").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Monitor all system components and services</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-2 transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: HeartPulse, label: "Avg Uptime", value: `${avgUptime}%`, color: "#22C55E" },
          { icon: Activity, label: "Operational", value: `${operationalCount}/${services.length}`, color: "#6D5EF5" },
          { icon: Clock, label: "Avg Response", value: "24ms", color: "#4CC9F0" },
          { icon: Server, label: "Services", value: services.length.toString(), color: "#8B5CF6" },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 text-center">
              <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-[11px] text-[#A7B0C0]">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        {services.map((svc, i) => {
          const config = statusConfig[svc.status]
          const Icon = config.icon
          return (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between p-5 ${i < services.length - 1 ? "border-b border-white/[0.06]" : ""} hover:bg-white/[0.02] transition-colors`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" style={{ color: config.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{svc.name}</p>
                  <p className="text-[10px] text-[#A7B0C0]">Last checked: {svc.lastChecked}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                  svc.status === "operational"
                    ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                    : svc.status === "degraded"
                    ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                    : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                }`}>{svc.status}</span>
                <p className="text-[10px] text-[#A7B0C0] mt-1">{svc.responseTime} &middot; {svc.uptime}% uptime</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
