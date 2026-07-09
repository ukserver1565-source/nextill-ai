import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") || "ai_logs"
    const from = req.nextUrl.searchParams.get("from") || undefined
    const to = req.nextUrl.searchParams.get("to") || undefined
    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const perPage = Number(req.nextUrl.searchParams.get("perPage")) || 50
    const offset = (page - 1) * perPage

    let data: any[] = []

    if (type === "admin_audit") {
      const { data: logs, error } = await supabaseAdmin
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + perPage - 1)
      if (error) throw new Error(error.message)
      data = (logs || []).map((l: any) => ({
        id: l.id,
        admin_name: l.user_id,
        action: l.action,
        section: l.details?.section || l.category || "",
        target: l.details?.target || l.details?.target_id || "",
        created_at: l.created_at,
      }))
    } else if (type === "workflow_runs") {
      const { data: logs, error } = await supabaseAdmin
        .from("system_logs")
        .select("*")
        .eq("source", "workflow")
        .order("created_at", { ascending: false })
        .range(offset, offset + perPage - 1)
      if (error) throw new Error(error.message)
      data = (logs || []).map((l: any) => ({
        id: l.id,
        workflow: l.metadata?.workflow || "",
        user_email: l.metadata?.user || "",
        status: l.metadata?.status || l.level,
        steps: l.metadata?.steps || "",
        credits: l.metadata?.credits || "",
        error: l.level === "error" ? l.message : "",
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
      data = (logs || []).map((l: any) => ({
        id: l.id,
        provider: l.metadata?.provider || l.source,
        model: l.metadata?.model || "",
        tokens: l.metadata?.tokens || 0,
        latency: l.metadata?.latency || "",
        cost: l.metadata?.cost || 0,
        success: l.level !== "error",
        error: l.level === "error" ? l.message : "",
        created_at: l.created_at,
        level: l.level,
        message: l.message,
        source: l.source,
      }))
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch logs", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { level, message, source, metadata } = await req.json()
    const { error } = await supabaseAdmin.from("system_logs").insert({
      level: level || "info",
      message: message || "",
      source: source || null,
      metadata: metadata || null,
    })
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create system log", details: (err as Error).message }, { status: 400 })
  }
}
