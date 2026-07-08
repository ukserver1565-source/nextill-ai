"use client"

import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { HeartPulse, Activity, Clock, Database, Server, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SystemHealthPage() {
  const {data, loading, error, refetch} = useData(() => adminApi.health())
  const services = data?.services || []
  const avgUptime = (services.reduce((s: number, h: any) => s + h.uptime, 0) / services.length).toFixed(2)
  const operationalCount = services.filter((h: any) => h.status === "operational").length

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">System Health</h1><p className="text-sm text-muted mt-1">Monitor all system components and services</p></div>
        <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={refetch}><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <HeartPulse className="w-5 h-5 text-success mx-auto mb-2" />
          <p className="text-xl font-bold">{avgUptime}%</p>
          <p className="text-[11px] text-muted">Avg Uptime</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Activity className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-xl font-bold">{operationalCount}/{services.length}</p>
          <p className="text-[11px] text-muted">Operational</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-warning mx-auto mb-2" />
          <p className="text-xl font-bold">24ms</p>
          <p className="text-[11px] text-muted">Avg Response</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Server className="w-5 h-5 text-info mx-auto mb-2" />
          <p className="text-xl font-bold">1</p>
          <p className="text-[11px] text-muted">Deployments Today</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {services.map((h: any, i: number) => (
          <div key={h.label} className={cn("flex items-center justify-between p-4", i < services.length - 1 && "border-b border-border")}>
            <div className="flex items-center gap-3">
              <div className={cn("w-2.5 h-2.5 rounded-full", h.status === "operational" ? "bg-success" : h.status === "degraded" ? "bg-warning" : "bg-danger")} />
              <div>
                <p className="text-sm font-medium">{h.label}</p>
                <p className="text-[10px] text-muted">Last checked: {h.lastChecked}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={h.status === "operational" ? "success" : h.status === "degraded" ? "warning" : "danger"} size="sm">{h.status}</Badge>
              <p className="text-[10px] text-muted mt-1">{h.responseTime}ms · {h.uptime}% uptime</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
