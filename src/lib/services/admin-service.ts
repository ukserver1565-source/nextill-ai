import { paymentRepo } from "@/lib/repositories/payment-repo"
import { toolRepo } from "@/lib/repositories/tool-repo"
import { supabaseAdmin } from "@/lib/supabase/admin"

export interface AdminOverview {
  stats: {
    totalUsers: number
    activeToday: number
    premiumUsers: number
    freeUsers: number
    totalRevenue: number
    monthlyRevenue: number
    totalTransactions: number
    totalProjects: number
    totalCredits: number
    totalUsed: number
  }
  recentUsers: any[]
  recentPayments: any[]
  chartData: {
    users: { date: string; value: number }[]
    revenue: { date: string; value: number }[]
  }
  health: any[]
  topTools: { name: string; count: number }[]
}

// Safe query wrapper — returns default value on error instead of crashing
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn() } catch { return fallback }
}

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    // Each query is wrapped independently so one failure doesn't kill the dashboard
    const [userStats, paymentStats, projectsCount] = await Promise.all([
      safe(async () => {
        const { data: all } = await supabaseAdmin.from("profiles").select("role, plan, status")
        const users = all || []
        const premium = users.filter((u) => u.plan !== "free" && u.plan !== "Free" && u.status === "active").length
        const free = users.filter((u) => (u.plan === "free" || u.plan === "Free" || !u.plan) && u.status === "active").length

        let totalCredits = 0
        let totalUsed = 0
        try {
          const { data: creditRows } = await supabaseAdmin.from("credits").select("balance")
          totalCredits = creditRows?.reduce((s: number, r: any) => s + (r.balance || 0), 0) || 0
        } catch { /* credits table may not exist */ }

        try {
          const { count } = await supabaseAdmin
            .from("credit_logs")
            .select("id", { count: "exact", head: true })
            .eq("type", "used")
          totalUsed = count || 0
        } catch { /* credit_logs table may not exist */ }

        return {
          total: users.length,
          activeToday: 0,
          premium,
          free,
          totalCredits,
          totalUsed,
        }
      }, { total: 0, activeToday: 0, premium: 0, free: 0, totalCredits: 0, totalUsed: 0 }),

      safe(() => paymentRepo.getStats(), { totalRevenue: 0, monthlyRevenue: 0, totalTransactions: 0, completedCount: 0 }),

      safe(async () => {
        const { count } = await supabaseAdmin.from("projects").select("id", { count: "exact", head: true })
        return count || 0
      }, 0),
    ])

    // Recent users — wrapped in safe
    const recentUsers = await safe(async () => {
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, role, plan, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
      return data || []
    }, [])

    // Recent payments — use simple query (no join) to avoid failures
    const recentPayments = await safe(async () => {
      const { data } = await supabaseAdmin
        .from("payments")
        .select("id, plan_slug, amount, status, provider, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
      return data || []
    }, [])

    // Tools — wrapped in safe
    const tools = await safe(() => toolRepo.list(), [])
    const topTools = tools.slice(0, 5).map((t: any) => ({ name: t.tool_name, count: 0 }))

    // Chart data — 30-day user + revenue charts
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoff = thirtyDaysAgo.toISOString()

    const [userDailyRaw, revenueDailyRaw] = await Promise.all([
      safe(async () => {
        const { data } = await supabaseAdmin
          .from("profiles")
          .select("created_at")
          .gte("created_at", cutoff)
        return data || []
      }, []),
      safe(async () => {
        const { data } = await supabaseAdmin
          .from("payments")
          .select("created_at, amount")
          .eq("status", "completed")
          .gte("created_at", cutoff)
        return data || []
      }, []),
    ])

    const userCountByDate = new Map<string, number>()
    for (const row of userDailyRaw) {
      const d = row.created_at?.slice(0, 10)
      if (d) userCountByDate.set(d, (userCountByDate.get(d) || 0) + 1)
    }

    const revenueByDate = new Map<string, number>()
    for (const row of revenueDailyRaw) {
      const d = row.created_at?.slice(0, 10)
      if (d) revenueByDate.set(d, (revenueByDate.get(d) || 0) + Number(row.amount || 0))
    }

    const now = new Date()
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().slice(0, 10)
    })

    const userChart = days.map((date) => ({ date, value: userCountByDate.get(date) || 0 }))
    const revenueChart = days.map((date) => ({ date, value: revenueByDate.get(date) || 0 }))

    return {
      stats: {
        totalUsers: userStats.total,
        activeToday: userStats.activeToday,
        premiumUsers: userStats.premium,
        freeUsers: userStats.free,
        totalRevenue: paymentStats.totalRevenue,
        monthlyRevenue: paymentStats.monthlyRevenue,
        totalTransactions: paymentStats.totalTransactions,
        totalProjects: projectsCount,
        totalCredits: userStats.totalCredits,
        totalUsed: userStats.totalUsed,
      },
      recentUsers,
      recentPayments,
      chartData: { users: userChart, revenue: revenueChart },
      health: [],
      topTools,
    }
  },
}
