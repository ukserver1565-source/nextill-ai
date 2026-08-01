import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { safeSingle } from "@/lib/supabase/safe-query"
import { updateUserSchema } from "@/lib/validation/admin-schemas"
import { userService } from "@/lib/services/user-service"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updateUserSchema.parse(body)
    const { data } = await safeSingle(() => supabaseAdmin.from("profiles").update(parsed).eq("id", id).select().single())
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update user", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Use userService.delete to properly remove auth user + projects + profile
    await userService.delete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete user", details: (err as Error).message }, { status: 500 })
  }
}
