import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single()
  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { user }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from("backup_exports")
      .select("*")
      .eq("id", id)
      .single()
    if (error || !data) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch backup", details: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await params
    const { error } = await supabaseAdmin
      .from("backup_exports")
      .delete()
      .eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete backup", details: (err as Error).message }, { status: 500 })
  }
}
