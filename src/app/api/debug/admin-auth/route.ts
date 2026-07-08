import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({
        authenticated: false,
        error: userError?.message || "No user",
      })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, user_id, email, full_name")
      .eq("user_id", user.id)
      .maybeSingle()

    const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
    const isAdmin = role === "admin" || role === "super_admin"

    return NextResponse.json({
      authenticated: true,
      user_id: user.id,
      email: user.email,
      profile_role: role,
      profile_found: !!profile,
      profile_user_id: (profile as { user_id?: string } | null)?.user_id || null,
      isAdmin,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
