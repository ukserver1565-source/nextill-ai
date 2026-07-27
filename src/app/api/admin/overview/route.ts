import { NextResponse } from "next/server"
import { adminService } from "@/lib/services/admin-service"

export async function GET() {
  try {
    const data = await adminService.getOverview()
    return NextResponse.json(data)
  } catch (err) {
    // Return a safe empty dashboard instead of 500
    console.error("[Admin Overview]", err)
    return NextResponse.json({
      stats: {
        totalUsers: 0, activeToday: 0, premiumUsers: 0, freeUsers: 0,
        totalRevenue: 0, monthlyRevenue: 0, totalTransactions: 0,
        totalProjects: 0, totalCredits: 0, totalUsed: 0,
      },
      recentUsers: [],
      recentPayments: [],
      chartData: { users: [], revenue: [] },
      health: [],
      topTools: [],
    })
  }
}
