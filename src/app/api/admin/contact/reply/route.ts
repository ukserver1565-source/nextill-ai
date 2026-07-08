import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"

const replySchema = z.object({
  contactId: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().min(1).max(500),
  message: z.string().min(1).max(10000),
})

export async function POST(req: NextRequest) {
  try {
    // Verify admin session
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    const role = (profile as { role?: string } | null)?.role
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse body
    const body = await req.json()
    const { contactId, to, subject, message } = replySchema.parse(body)

    // Send email via email service
    const result = await sendEmail({
      to,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <p>${message.replace(/\n/g, "<br/>")}</p>
          <hr style="margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 12px;">Nextill AI Support</p>
        </div>
      `,
    })

    if (!result.ok && result.error === "Email provider not configured") {
      // Mark as replied in DB anyway
      await supabaseAdmin
        .from("contact_messages")
        .update({ status: "replied" })
        .eq("id", contactId)

      return NextResponse.json({
        success: true,
        note: "Email provider not configured. Message saved as replied in database.",
      })
    }

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Mark as replied
    await supabaseAdmin
      .from("contact_messages")
      .update({ status: "replied" })
      .eq("id", contactId)

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.issues }, { status: 400 })
    }
    console.error("Contact reply error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
