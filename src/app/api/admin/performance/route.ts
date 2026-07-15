import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { safeQuery, safeCount } from "@/lib/supabase/safe-query"

interface AiLogEntry {
  latency_ms: number | null
  success: boolean | null
  cost: number | null
  created_at: string | null
}

export async function GET() {
  try {
    const now = new Date()
    const oneDayAgo = new Date(now)
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [aiLogsRecent, aiLogsWeek, usageLogsRecent, chartLogs] = await Promise.all([
      safeQuery<AiLogEntry>(() => supabaseAdmin.from("ai_logs").select("latency_ms, success, cost").gte("created_at", oneDayAgo.toISOString())),
      safeQuery<AiLogEntry>(() => supabaseAdmin.from("ai_logs").select("latency_ms, success, cost").gte("created_at", oneWeekAgo.toISOString())),
      safeCount(() => supabaseAdmin.from("usage_logs").select("id", { count: "exact", head: true }).gte("created_at", oneDayAgo.toISOString())),
      safeQuery<AiLogEntry>(() => supabaseAdmin.from("ai_logs").select("latency_ms, cost, success, created_at").gte("created_at", oneWeekAgo.toISOString()).order("created_at", { ascending: true })),
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

    // Build hourly chart data for 7 days
    const allChartLogs = chartLogs.data || []
    const hourlyData: Record<string, { requests: number; totalLatency: number }> = {}
    allChartLogs.forEach(l => {
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

    return NextResponse.json({
      avgLatency,
      errorRate: parseFloat(errorRate),
      totalRequests,
      failedRequests: failedCount,
      weeklyCost: Math.round(totalCost * 100) / 100,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      chartData,
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch performance metrics", details: (err as Error).message }, { status: 500 })
  }
}
