import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { safeQuery, safeCount } from "@/lib/supabase/safe-query"

interface PaymentRecord {
  amount: number | null
  status: string | null
}

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") || "overview"

    const [usersResult, documentsResult, paymentsResult] = await Promise.all([
      safeCount(() => supabaseAdmin.from("profiles").select("id", { count: "exact", head: true })),
      safeCount(() => supabaseAdmin.from("documents").select("id", { count: "exact", head: true })),
      safeQuery<PaymentRecord>(() => supabaseAdmin.from("payments").select("amount,status")),
    ])

    const completedPayments = paymentsResult.data?.filter(p => p.status === "completed") || []
    const revenue = completedPayments.reduce((s, p) => s + (p.amount || 0), 0)

    return NextResponse.json({
      type,
      users: { total: usersResult.count || 0 },
      documents: { total: documentsResult.count || 0 },
      payments: {
        total: paymentsResult.data?.length || 0,
        revenue,
      },
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[admin/reports]", err)
    return NextResponse.json({
      users: { total: 0 },
      documents: { total: 0 },
      payments: { total: 0, revenue: 0 },
      generated_at: new Date().toISOString(),
    })
  }
}
