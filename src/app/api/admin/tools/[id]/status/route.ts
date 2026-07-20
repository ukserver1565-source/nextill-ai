import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (body.status !== undefined) {
      if (!["coming_soon", "published", "maintenance"].includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      payload.status = body.status
    }

    if (body.api_verified !== undefined) {
      payload.api_verified = body.api_verified
    }

    if (body.last_tested_at !== undefined) {
      payload.last_tested_at = body.last_tested_at
    }

    if (body.last_test_result !== undefined) {
      payload.last_test_result = body.last_test_result
    }

    const { data, error } = await supabaseAdmin
      .from("workflow_settings")
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update tool status", details: (err as Error).message }, { status: 400 })
  }
}
