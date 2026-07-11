"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { HeartPulse, Activity, Clock, Server, CheckCircle, AlertTriangle, XCircle, RefreshCw, Loader2, Inbox } from "lucide-react"
import { useAdminFetch } from "@/lib/admin/use-admin-fetch"

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  operational: { icon: CheckCircle, color: "#22C55E", bg: "bg-[#22C55E]/10" },
  degraded: { icon: AlertTriangle, color: "#F59E0B", bg: "bg-[#F59E0B]/10" },
  down: { icon: XCircle, color: "#EF4444", bg: "bg-[#EF4444]/10" },
}

export default function SystemHealthPage() {
  const { data: healthData, loading, error, refetch } = useAdminFetch<any>("/api/admin/health")
  const services = healthData?.services || []
  const avgUptime = services.length > 0
    ? (services.reduce((s: number, svc: any) => s + (svc.uptime || 0), 0) / services.length).toFixed(2)
    : "0.00"
  const operationalCount = services.filter((s: any) => s.status === "operational").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Monitor all system components and services</p>
        </div>
        <button onClick={refetch} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-2 transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: HeartPulse, label: "Avg Uptime", value: loading ? "—" : `${avgUptime}%`, color: "#22C55E" },
          { icon: Activity, label: "Operational", value: loading ? "—" : `${operationalCount}/${services.length}`, color: "#6D5EF5" },
          { icon: Clock, label: "Avg Response", value: loading ? "—" : `${services.length > 0 ? Math.round(services.reduce((s: number, svc: any) => s + (svc.responseTime || 0), 0) / services.length) : 0}ms`, color: "#4CC9F0" },
          { icon: Server, label: "Services", value: loading ? "—" : String(services.length), color: "#8B5CF6" },
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" />
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Inbox className="w-10 h-10 text-[#A7B0C0] mb-3" />
            <p className="text-sm font-medium text-[#A7B0C0]">No services to display</p>
          </div>
        ) : (
          services.map((svc: any, i: number) => {
            const config = statusConfig[svc.status] || statusConfig.operational
            const Icon = config.icon
            return (
              <motion.div
                key={svc.label || i}
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
                    <p className="text-sm font-medium text-white">{svc.label}</p>
                    <p className="text-[10px] text-[#A7B0C0]">Last checked: {svc.lastChecked || "—"}</p>
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
                  <p className="text-[10px] text-[#A7B0C0] mt-1">{svc.responseTime || 0}ms &middot; {svc.uptime || 0}% uptime</p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
