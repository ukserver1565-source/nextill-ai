import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { auditService } from "@/lib/services/admin/audit.service"

export async function GET(req: NextRequest) {
  try {
    const eventType = req.nextUrl.searchParams.get("event_type") || undefined
    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const perPage = Number(req.nextUrl.searchParams.get("perPage")) || 20
    const from = (page - 1) * perPage
    let query = supabaseAdmin
      .from("security_logs")
      .select("*", { count: "exact" })
    if (eventType) query = query.eq("event_type", eventType)
    query = query.order("created_at", { ascending: false }).range(from, from + perPage - 1)
    const { data, error, count } = await query
    if (error) throw new Error(error.message)
    return NextResponse.json({ data: data || [], total: count || 0, page, perPage })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch security events", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { event_type, severity, message, metadata } = await req.json()
    await auditService.systemLog(severity === "critical" ? "error" : "warn", message, { event_type, source: "security", ...metadata })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create security event", details: (err as Error).message }, { status: 400 })
  }
}
