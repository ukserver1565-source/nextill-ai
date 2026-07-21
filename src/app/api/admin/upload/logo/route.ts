import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { supabaseAdmin } from "@/lib/supabase/admin"

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"]
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

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

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
    const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: PNG, JPG, SVG" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size: 2MB" }, { status: 400 })
    }

    // Ensure branding bucket exists
    const { error: bucketErr } = await supabaseAdmin.storage.getBucket("branding")
    if (bucketErr) {
      // Create the bucket if it doesn't exist
      await supabaseAdmin.storage.createBucket("branding", {
        public: true,
        fileSizeLimit: MAX_SIZE,
        allowedMimeTypes: ALLOWED_TYPES,
      })
    }

    // Upload file
    const ext = (file.name.split(".").pop() || "png").toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "Invalid file extension" }, { status: 400 })
    }
    const filePath = `site-logo.${ext}`

    // Remove old logo if exists
    await supabaseAdmin.storage.from("branding").remove([filePath]).catch(() => {})

    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadErr } = await supabaseAdmin.storage
      .from("branding")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadErr) {
      console.error("Logo upload error:", uploadErr)
      return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("branding")
      .getPublicUrl(filePath)

    const logoUrl = urlData.publicUrl

    // Save URL to site_settings
    const { error: settingsErr } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: "site_logo_url", value: logoUrl }, { onConflict: "key" })

    if (settingsErr) {
      console.error("Settings save error:", settingsErr)
      return NextResponse.json({ error: "Failed to save logo URL" }, { status: 500 })
    }

    return NextResponse.json({ success: true, logo_url: logoUrl })
  } catch (err) {
    console.error("Logo upload API error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
