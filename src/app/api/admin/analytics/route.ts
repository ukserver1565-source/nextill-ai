import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { safeCount, safeQuery } from "@/lib/supabase/safe-query"

export async function GET() {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [totalUsers, totalDocs, totalProjects, recentUsage, aiLogsRecent] = await Promise.all([
      safeCount(() => supabaseAdmin.from("profiles").select("id", { count: "exact", head: true })),
      safeCount(() => supabaseAdmin.from("documents").select("id", { count: "exact", head: true })),
      safeCount(() => supabaseAdmin.from("projects").select("id", { count: "exact", head: true })),
      safeQuery<{ created_at: string }>(() =>
        supabaseAdmin.from("usage_logs").select("created_at").gte("created_at", sevenDaysAgo.toISOString()).order("created_at", { ascending: false })
      ),
      safeQuery<{ provider_slug: string | null; latency_ms: number | null; success: boolean | null }>(() =>
        supabaseAdmin.from("ai_logs").select("provider_slug, latency_ms, success").gte("created_at", thirtyDaysAgo.toISOString())
      ),
    ])

    // Provider usage breakdown
    const providerStats: Record<string, { count: number; totalLatency: number; failures: number }> = {}
    for (const log of aiLogsRecent.data || []) {
      const p = log.provider_slug || "unknown"
      if (!providerStats[p]) providerStats[p] = { count: 0, totalLatency: 0, failures: 0 }
      providerStats[p].count++
      providerStats[p].totalLatency += log.latency_ms || 0
      if (!log.success) providerStats[p].failures++
    }

    // Daily usage trend
    const dailyUsage: Record<string, number> = {}
    for (const log of recentUsage.data || []) {
      const day = log.created_at?.slice(0, 10) || "unknown"
      dailyUsage[day] = (dailyUsage[day] || 0) + 1
    }

    return NextResponse.json({
      totalUsers: totalUsers.count || 0,
      totalDocuments: totalDocs.count || 0,
      totalProjects: totalProjects.count || 0,
      totalAiRequests: (aiLogsRecent.data || []).length,
      providerStats,
      dailyUsage,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch analytics", details: (err as Error).message }, { status: 500 })
  }
}
