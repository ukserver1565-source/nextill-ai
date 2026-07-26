import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const targetEmail = body.to || process.env.ADMIN_EMAIL || "muzamal57gansari@icloud.com"

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "RESEND_API_KEY not set in environment variables. Add it to .env.local.",
      }, { status: 400 })
    }

    const result = await sendEmail({
      to: targetEmail,
      subject: "Test Email from Nextill AI",
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #6D5EF5;">Nextill AI - Test Email ✅</h2>
          <p style="color: #374151;">Your email configuration is working correctly!</p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">
            Sent to: ${targetEmail}<br>
            Time: ${new Date().toISOString()}
          </p>
        </div>
      `,
    })

    if (!result.ok) {
      return NextResponse.json({
        success: false,
        error: result.error || "Failed to send email",
      }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `Test email sent to ${targetEmail}` })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Failed to send test email",
      details: (err as Error).message,
    }, { status: 500 })
  }
}
