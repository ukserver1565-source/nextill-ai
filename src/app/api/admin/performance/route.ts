import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const now = new Date()
    const oneDayAgo = new Date(now)
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [aiLogsRecent, aiLogsWeek, usageLogsRecent] = await Promise.all([
      supabaseAdmin.from("ai_logs").select("latency_ms, success, cost").gte("created_at", oneDayAgo.toISOString()),
      supabaseAdmin.from("ai_logs").select("latency_ms, success, cost").gte("created_at", oneWeekAgo.toISOString()),
      supabaseAdmin.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", oneDayAgo.toISOString()),
    ])

    const recentLogs = aiLogsRecent.data || []
    const weekLogs = aiLogsWeek.data || []
    const totalRequests = usageLogsRecent.count || 0

    const avgLatency = recentLogs.length > 0
      ? Math.round(recentLogs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / recentLogs.length)
      : 0

    const failedCount = recentLogs.filter(l => !l.success).length
    const errorRate = recentLogs.length > 0
      ? ((failedCount / recentLogs.length) * 100).toFixed(2)
      : "0.00"

    const totalCost = weekLogs.reduce((sum, l) => sum + (l.cost || 0), 0)

    return NextResponse.json({
      avgLatency,
      errorRate: parseFloat(errorRate),
      totalRequests,
      failedRequests: failedCount,
      weeklyCost: Math.round(totalCost * 100) / 100,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch performance metrics", details: (err as Error).message }, { status: 500 })
  }
}
