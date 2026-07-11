import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("system_logs").select("*").ilike("action", "%backup%").order("created_at", { ascending: false }).limit(50)
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch backups", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const { data, error } = await supabaseAdmin.from("system_logs").insert({
      action: "backup_created",
      details: JSON.stringify({ timestamp: new Date().toISOString() }),
      status: "completed",
      created_at: new Date().toISOString(),
    }).select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
  }
}
