import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("blog_categories")
      .select("id, name, slug, created_at")
      .order("name")
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (_err) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll() {},
        },
      }
    )
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
    const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("blog_categories")
      .insert({ name: body.name, slug: body.slug })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data, { status: 201 })
  } catch (_err) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
