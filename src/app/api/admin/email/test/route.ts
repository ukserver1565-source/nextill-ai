import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json().catch(() => ({}))
    const targetEmail = to || process.env.ADMIN_EMAIL || "admin@example.com"

    const result = await sendEmail({
      to: targetEmail,
      subject: "Test Email from Nextill AI",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #6D5EF5;">Nextill AI - Test Email</h2>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <p style="color: #666; font-size: 12px;">Sent at ${new Date().toISOString()}</p>
        </div>
      `,
    })

    if (!result.ok) {
      return NextResponse.json({
        success: false,
        error: result.error || "Email provider not configured. Set RESEND_API_KEY or SMTP credentials in .env.local.",
      }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Test email sent successfully" })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Failed to send test email",
      details: (err as Error).message,
    }, { status: 500 })
  }
}
