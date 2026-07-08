const RESEND_API_KEY = process.env.RESEND_API_KEY || ""
const SMTP_HOST = process.env.SMTP_HOST || ""
const SMTP_PORT = process.env.SMTP_PORT || ""
const SMTP_USER = process.env.SMTP_USER || ""
const SMTP_PASS = process.env.SMTP_PASS || ""
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@nextill.ai"

interface EmailPayload {
  to: string
  subject: string
  html: string
}

function isResendConfigured(): boolean {
  return RESEND_API_KEY.length > 0
}

function isSmtpConfigured(): boolean {
  return SMTP_HOST.length > 0 && SMTP_USER.length > 0 && SMTP_PASS.length > 0
}

function isConfigured(): boolean {
  return isResendConfigured() || isSmtpConfigured()
}

async function sendViaResend(payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      return { ok: false, error: `Resend error (${res.status}): ${err}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

async function sendViaSmtp(payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  // SMTP sending requires nodemailer – not installed by default.
  // This is a placeholder for when SMTP credentials are configured.
  return { ok: false, error: "SMTP sending requires nodemailer. Install with: npm install nodemailer" }
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  if (!isConfigured()) {
    console.log("[Email] Email provider not configured. Skipping send to", payload.to)
    return { ok: false, error: "Email provider not configured" }
  }

  if (isResendConfigured()) {
    return sendViaResend(payload)
  }

  return sendViaSmtp(payload)
}
