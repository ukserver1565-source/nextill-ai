import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") || "overview"
    
    const [usersResult, documentsResult, paymentsResult] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("documents").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("payments").select("amount,status"),
    ])

    return NextResponse.json({
      type,
      users: { total: usersResult.count || 0 },
      documents: { total: documentsResult.count || 0 },
      payments: {
        total: paymentsResult.data?.length || 0,
        revenue: paymentsResult.data?.filter(p => p.status === "completed").reduce((s, p) => s + (p.amount || 0), 0) || 0,
      },
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate report", details: (err as Error).message }, { status: 500 })
  }
}
