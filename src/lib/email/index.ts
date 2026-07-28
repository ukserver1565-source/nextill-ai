const ENV_RESEND_API_KEY = process.env.RESEND_API_KEY || ""
const ENV_SMTP_HOST = process.env.SMTP_HOST || ""
const ENV_SMTP_USER = process.env.SMTP_USER || ""
const ENV_SMTP_PASS = process.env.SMTP_PASS || ""
const ENV_FROM_EMAIL = process.env.EMAIL_FROM || "noreply@adultpulse.co.uk"

interface EmailPayload {
  to: string
  subject: string
  html: string
}

// Load settings from DB (site_settings table) — caches for 60s
let cachedSettings: Record<string, string> | null = null
let cacheTime = 0

async function getSettings(): Promise<Record<string, string>> {
  const now = Date.now()
  if (cachedSettings && (now - cacheTime) < 60_000) return cachedSettings

  try {
    // Dynamic import to avoid circular deps
    const { supabaseAdmin } = await import("@/lib/supabase/admin")
    const { data } = await supabaseAdmin.from("site_settings").select("key, value")
    const map: Record<string, string> = {}
    for (const row of data || []) {
      if (row.key && row.value) {
        map[row.key] = typeof row.value === "string" ? row.value : JSON.stringify(row.value)
      }
    }
    cachedSettings = map
    cacheTime = now
    return map
  } catch {
    return {}
  }
}

function getApiKey(settings: Record<string, string>): string {
  return ENV_RESEND_API_KEY || settings.resend_api_key || ""
}

function getFromEmail(settings: Record<string, string>): string {
  return settings.from_email || ENV_FROM_EMAIL
}

function getSmtpConfig(settings: Record<string, string>) {
  return {
    host: settings.smtp_host || ENV_SMTP_HOST,
    user: settings.smtp_user || ENV_SMTP_USER,
    pass: settings.smtp_pass || ENV_SMTP_PASS,
  }
}

function isResendConfigured(settings: Record<string, string>): boolean {
  return getApiKey(settings).length > 0
}

function isSmtpConfigured(settings: Record<string, string>): boolean {
  const smtp = getSmtpConfig(settings)
  return smtp.host.length > 0 && smtp.user.length > 0 && smtp.pass.length > 0
}

async function sendViaResend(payload: EmailPayload, settings: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
  const apiKey = getApiKey(settings)
  const fromEmail = getFromEmail(settings)

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
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

async function sendViaSmtp(_payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  // SMTP sending requires nodemailer – not installed by default.
  // This is a placeholder for when SMTP credentials are configured.
  return { ok: false, error: "SMTP sending requires nodemailer. Install with: npm install nodemailer" }
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  const settings = await getSettings()

  if (isResendConfigured(settings)) {
    return sendViaResend(payload, settings)
  }

  if (isSmtpConfigured(settings)) {
    return sendViaSmtp(payload)
  }

  return { ok: false, error: "Email provider not configured. Set RESEND_API_KEY or SMTP credentials in .env.local or admin settings." }
}

export function clearCache() {
  cachedSettings = null
  cacheTime = 0
}

/**
 * Check if any email provider is configured (env OR database).
 * Used by the test email endpoint to give a clear error message.
 */
export async function isEmailConfigured(): Promise<boolean> {
  // Check env vars first (fast path)
  if (ENV_RESEND_API_KEY) return true
  if (ENV_SMTP_HOST && ENV_SMTP_USER && ENV_SMTP_PASS) return true

  // Check database settings
  const settings = await getSettings()
  return isResendConfigured(settings) || isSmtpConfigured(settings)
}
