import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") || "system"
    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const perPage = Number(req.nextUrl.searchParams.get("perPage")) || 50
    const offset = (page - 1) * perPage

    let data: unknown[] = []

    if (type === "admin_audit") {
      const { data: logs, error } = await supabaseAdmin
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + perPage - 1)
      if (error) throw new Error(error.message)
      data = (logs || []).map((l: Record<string, unknown>) => ({
        id: l.id,
        admin_id: l.admin_id,
        action: l.action,
        section: l.section || "",
        target_type: l.target_type || "",
        target_id: l.target_id || "",
        created_at: l.created_at,
      }))
    } else if (type === "workflow_runs") {
      const { data: logs, error } = await supabaseAdmin
        .from("workflow_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + perPage - 1)
      if (error) throw new Error(error.message)
      data = (logs || []).map((l: Record<string, unknown>) => ({
        id: l.id,
        workflow: l.workflow_slug || "",
        status: l.status || "",
        credits_used: l.credits_used || 0,
        error: l.error || "",
        created_at: l.created_at,
      }))
    } else {
      const level = req.nextUrl.searchParams.get("level") || undefined
      let query = supabaseAdmin
        .from("system_logs")
        .select("*", { count: "exact" })
      if (level) query = query.eq("level", level)
      query = query.order("created_at", { ascending: false })
      query = query.range(offset, offset + perPage - 1)
      const { data: logs, error } = await query
      if (error) throw new Error(error.message)
      data = (logs || []).map((l: Record<string, unknown>) => ({
        id: l.id,
        level: l.level,
        message: l.message,
        metadata: l.metadata,
        created_at: l.created_at,
      }))
    }

    return NextResponse.json(data)
  } catch (_err) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { level, message, metadata } = await req.json()
    const { error } = await supabaseAdmin.from("system_logs").insert({
      level: level || "info",
      message: message || "",
      metadata: metadata || null,
    })
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (_err) {
    return NextResponse.json({ error: "Failed to create system log" }, { status: 400 })
  }
}
