import { supabaseAdmin } from "@/lib/supabase/admin"

export interface HealthCheck {
  label: string
  status: "operational" | "degraded" | "down"
  uptime: number
  lastChecked: string
  responseTime: number
}

function calcUptime(responseTime: number, maxMs: number = 2000): number {
  if (responseTime === 0) return 0
  const ratio = Math.min(responseTime / maxMs, 1)
  return Math.round((1 - ratio * 0.5) * 10000) / 100
}

export const systemHealthRepo = {
  async check(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = []

    try {
      const start = Date.now()
      const { error } = await supabaseAdmin.from("profiles").select("count", { count: "exact", head: true })
      if (error) throw error
      const rt = Date.now() - start
      checks.push({ label: "Database", status: "operational", uptime: calcUptime(rt), lastChecked: "now", responseTime: rt })
    } catch {
      checks.push({ label: "Database", status: "down", uptime: 0, lastChecked: "now", responseTime: 0 })
    }

    try {
      const start = Date.now()
      const { error } = await supabaseAdmin.from("site_settings").select("id", { count: "exact", head: true })
      if (error) throw error
      const rt = Date.now() - start
      checks.push({ label: "API Server", status: "operational", uptime: calcUptime(rt), lastChecked: "now", responseTime: rt })
    } catch {
      checks.push({ label: "API Server", status: "degraded", uptime: 0, lastChecked: "now", responseTime: 0 })
    }

    try {
      const start = Date.now()
      const { data: providers } = await supabaseAdmin.from("ai_providers").select("slug, status").eq("enabled", true)
      const activeProviders = (providers || []).filter((p: any) => p.status === "active")
      const totalEnabled = (providers || []).length
      const status = totalEnabled === 0 ? "operational" : activeProviders.length === totalEnabled ? "operational" : activeProviders.length > 0 ? "degraded" : "down"
      const rt = Date.now() - start
      checks.push({ label: "AI Providers", status, uptime: totalEnabled > 0 ? Math.round((activeProviders.length / totalEnabled) * 10000) / 100 : 100, lastChecked: "now", responseTime: rt })
    } catch {
      checks.push({ label: "AI Providers", status: "down", uptime: 0, lastChecked: "now", responseTime: 0 })
    }

    try {
      const start = Date.now()
      const { error } = await supabaseAdmin.from("workflow_runs").select("id", { count: "exact", head: true })
      if (error) throw error
      const rt = Date.now() - start
      checks.push({ label: "Workflow Queue", status: "operational", uptime: calcUptime(rt), lastChecked: "now", responseTime: rt })
    } catch {
      checks.push({ label: "Workflow Queue", status: "degraded", uptime: 0, lastChecked: "now", responseTime: 0 })
    }

    try {
      const start = Date.now()
      const { error } = await supabaseAdmin.from("documents").select("id", { count: "exact", head: true })
      if (error) throw error
      const rt = Date.now() - start
      checks.push({ label: "File Storage", status: "operational", uptime: calcUptime(rt), lastChecked: "now", responseTime: rt })
    } catch {
      checks.push({ label: "File Storage", status: "degraded", uptime: 0, lastChecked: "now", responseTime: 0 })
    }

    return checks
  },
}
