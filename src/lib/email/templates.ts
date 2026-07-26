/**
 * Email Templates for Nextill AI
 * All templates use inline CSS for maximum email client compatibility
 */

const SITE_NAME = "Nextill AI"
const SITE_URL = "https://www.adultpulse.co.uk"
const LOGO_URL = `${SITE_URL}/og-image.png`
const SUPPORT_EMAIL = "support@adultpulse.co.uk"

function wrapTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#6D5EF5,#8B5CF6);padding:32px 40px;text-align:center;">
          <img src="${LOGO_URL}" alt="${SITE_NAME}" width="40" height="40" style="border-radius:8px;margin-bottom:12px;" />
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${SITE_NAME}</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 40px 20px;">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px 32px;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:12px;color:#999999;text-align:center;line-height:1.6;">
            © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.<br>
            <a href="${SITE_URL}/privacy-policy" style="color:#999999;">Privacy</a> ·
            <a href="${SITE_URL}/terms" style="color:#999999;">Terms</a> ·
            <a href="mailto:${SUPPORT_EMAIL}" style="color:#999999;">Support</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Welcome Email ──────────────────────────────────────────
export function welcomeEmail(name: string, email: string): { subject: string; html: string } {
  return {
    subject: `Welcome to ${SITE_NAME} — Your AI SEO Toolkit is Ready! 🚀`,
    html: wrapTemplate("Welcome", `
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;">Welcome, ${name}! 👋</h2>
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
        Your account is live and you've got <strong>100 free credits</strong> to explore everything ${SITE_NAME} has to offer.
      </p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
        Here's what you can do right now:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="padding:12px 16px;background:#f9fafb;border-radius:8px;margin-bottom:8px;">
          <strong style="color:#6D5EF5;">🔍 Keyword Intelligence</strong>
          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Research keywords with AI — 2 credits</p>
        </td></tr>
        <tr><td style="height:8px;"></td></tr>
        <tr><td style="padding:12px 16px;background:#f9fafb;border-radius:8px;">
          <strong style="color:#6D5EF5;">✍️ Post Generator</strong>
          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Generate SEO blog posts with AI — 10 credits</p>
        </td></tr>
        <tr><td style="height:8px;"></td></tr>
        <tr><td style="padding:12px 16px;background:#f9fafb;border-radius:8px;">
          <strong style="color:#6D5EF5;">🛡️ Plagiarism Checker</strong>
          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Check content originality — 4 credits</p>
        </td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr><td align="center">
          <a href="${SITE_URL}/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6D5EF5,#8B5CF6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
            Go to Dashboard →
          </a>
        </td></tr>
      </table>
    `),
  }
}

// ── Payment Confirmed ──────────────────────────────────────
export function paymentConfirmedEmail(
  name: string, planName: string, amount: number, billingCycle: string
): { subject: string; html: string } {
  return {
    subject: `Payment Confirmed — ${planName} Plan Activated ✅`,
    html: wrapTemplate("Payment Confirmed", `
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;">Payment Confirmed! ✅</h2>
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
        Hi ${name}, your payment has been processed and your plan is now active.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;">
        <tr><td>
          <table width="100%">
            <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Plan</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#111827;font-size:13px;">${planName}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Amount</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#111827;font-size:13px;">$${amount}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Billing</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#111827;font-size:13px;">${billingCycle}</td></tr>
          </table>
        </td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr><td align="center">
          <a href="${SITE_URL}/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6D5EF5,#8B5CF6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
            View Dashboard →
          </a>
        </td></tr>
      </table>
    `),
  }
}

// ── Credits Low Warning ────────────────────────────────────
export function creditsLowEmail(name: string, creditsLeft: number): { subject: string; html: string } {
  return {
    subject: `Credits Running Low — ${creditsLeft} credits remaining`,
    html: wrapTemplate("Credits Warning", `
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;">Credits Running Low ⚠️</h2>
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
        Hi ${name}, you have <strong>${creditsLeft} credits</strong> remaining this month.
      </p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
        Upgrade your plan to get more credits and unlock premium features.
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr><td align="center">
          <a href="${SITE_URL}/pricing" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6D5EF5,#8B5CF6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
            Upgrade Plan →
          </a>
        </td></tr>
      </table>
    `),
  }
}

// ── Password Reset ─────────────────────────────────────────
export function passwordResetEmail(name: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: `Reset Your ${SITE_NAME} Password`,
    html: wrapTemplate("Password Reset", `
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;">Password Reset 🔐</h2>
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
        Hi ${name}, we received a request to reset your password.
      </p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
        Click the button below to set a new password. This link expires in 1 hour.
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr><td align="center">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6D5EF5,#8B5CF6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
            Reset Password →
          </a>
        </td></tr>
      </table>
      <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;text-align:center;line-height:1.6;">
        If you didn't request this, you can safely ignore this email.
      </p>
    `),
  }
}

// ── Subscription Renewed ───────────────────────────────────
export function subscriptionRenewedEmail(
  name: string, planName: string, credits: number, renewalDate: string
): { subject: string; html: string } {
  return {
    subject: `${SITE_NAME} — Your Credits Have Been Renewed! 🎉`,
    html: wrapTemplate("Credits Renewed", `
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;">Credits Renewed! 🎉</h2>
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
        Hi ${name}, your monthly credits have been renewed!
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;">
        <tr><td>
          <table width="100%">
            <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Plan</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#111827;font-size:13px;">${planName}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Credits</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#111827;font-size:13px;">${credits}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Next Renewal</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#111827;font-size:13px;">${renewalDate}</td></tr>
          </table>
        </td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr><td align="center">
          <a href="${SITE_URL}/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6D5EF5,#8B5CF6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
            Start Creating →
          </a>
        </td></tr>
      </table>
    `),
  }
}

// ── Payment Pending (Admin Review) ─────────────────────────
export function paymentPendingEmail(
  name: string, planName: string, amount: number
): { subject: string; html: string } {
  return {
    subject: `Payment Received — Under Review ⏳`,
    html: wrapTemplate("Payment Pending", `
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;">Payment Received ⏳</h2>
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
        Hi ${name}, we've received your payment for the <strong>${planName}</strong> plan ($${amount}).
      </p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
        Our team is reviewing your payment. You'll receive an email once it's confirmed — typically within a few hours.
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr><td align="center">
          <a href="${SITE_URL}/dashboard/billing" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6D5EF5,#8B5CF6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
            View Billing →
          </a>
        </td></tr>
      </table>
    `),
  }
}
