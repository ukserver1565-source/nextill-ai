import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { safeSingle } from "@/lib/supabase/safe-query"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    // Field whitelisting: only allow specific fields to be updated
    const allowed = (({ status, provider_payment_id }: Record<string, unknown>) => ({ status, provider_payment_id }))(body)
    const { data } = await safeSingle(() => supabaseAdmin.from("payments").update(allowed).eq("id", id).select().single())
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update payment", details: (err as Error).message }, { status: 400 })
  }
}
