import { profileRepo } from "@/lib/repositories/profile-repo"
import { paymentRepo } from "@/lib/repositories/payment-repo"
import { toolRepo } from "@/lib/repositories/tool-repo"
import { systemHealthRepo } from "@/lib/repositories/system-health-repo"
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

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const [userStats, paymentStats, projects, health] = await Promise.all([
      profileRepo.getStats(),
      paymentRepo.getStats(),
      supabaseAdmin.from("projects").select("count", { count: "exact", head: true }),
      systemHealthRepo.check(),
    ])

    const recentUsers = await profileRepo.list({ page: 1, limit: 5 })
    const recentPayments = await paymentRepo.list({ page: 1, limit: 5 })
    const tools = await toolRepo.list()

    const topTools = tools
      .slice(0, 5)
      .map((t) => ({ name: t.tool_name, count: 0 }))

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoff = thirtyDaysAgo.toISOString()

    const [userDailyRaw, revenueDailyRaw] = await Promise.all([
      supabaseAdmin.from("profiles").select("created_at").gte("created_at", cutoff),
      supabaseAdmin.from("payments").select("created_at, amount").eq("status", "completed").gte("created_at", cutoff),
    ])

    const userCountByDate = new Map<string, number>()
    for (const row of userDailyRaw.data || []) {
      const d = row.created_at.slice(0, 10)
      userCountByDate.set(d, (userCountByDate.get(d) || 0) + 1)
    }

    const revenueByDate = new Map<string, number>()
    for (const row of revenueDailyRaw.data || []) {
      const d = row.created_at.slice(0, 10)
      revenueByDate.set(d, (revenueByDate.get(d) || 0) + Number(row.amount))
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
        totalProjects: projects.count || 0,
        totalCredits: userStats.totalCredits,
        totalUsed: userStats.totalUsed,
      },
      recentUsers: recentUsers.data,
      recentPayments: recentPayments.data,
      chartData: { users: userChart, revenue: revenueChart },
      health,
      topTools,
    }
  },
}
