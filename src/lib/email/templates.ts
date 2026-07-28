/**
 * Email Templates for Nextill AI
 * Premium, professional HTML email templates
 * All inline CSS for maximum email client compatibility
 * Mobile responsive with percentage widths
 */

const SITE_NAME = "Nextill AI"
const SITE_URL = "https://www.adultpulse.co.uk"
const LOGO_URL = `${SITE_URL}/og-image.png`
const SUPPORT_EMAIL = "support@adultpulse.co.uk"
const UNSUBSCRIBE_URL = `${SITE_URL}/unsubscribe`

// ── Shared Colors ────────────────────────────────────────────
const COLORS = {
  primary: "#6D5EF5",
  primaryLight: "#8B5CF6",
  cyan: "#4CC9F0",
  success: "#10B981",
  successLight: "#D1FAE5",
  successBorder: "#6EE7B7",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  warningBorder: "#FCD34D",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  dangerBorder: "#FECACA",
  info: "#3B82F6",
  infoLight: "#DBEAFE",
  infoBorder: "#93C5FD",
  text: "#111827",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  bgLight: "#F9FAFB",
  border: "#E5E7EB",
  white: "#FFFFFF",
}

// ── Footer Component ────────────────────────────────────────
function buildFooter(): string {
  return `
  <!-- Separator -->
  <tr><td style="padding:0 40px;"><div style="border-top:1px solid ${COLORS.border};"></div></td></tr>
  <!-- Footer -->
  <tr><td style="padding:28px 40px 36px;">
    <p style="margin:0 0 8px;font-size:13px;color:${COLORS.textMuted};text-align:center;line-height:1.5;">
      ${SITE_NAME} &mdash; AI-Powered SEO Tools for Content Creators
    </p>
    <p style="margin:0 0 12px;font-size:12px;color:${COLORS.textLight};text-align:center;line-height:1.6;">
      <a href="${SITE_URL}" style="color:${COLORS.primary};text-decoration:none;">Website</a>
      &nbsp;&middot;&nbsp;
      <a href="${SITE_URL}/dashboard" style="color:${COLORS.primary};text-decoration:none;">Dashboard</a>
      &nbsp;&middot;&nbsp;
      <a href="mailto:${SUPPORT_EMAIL}" style="color:${COLORS.primary};text-decoration:none;">Support</a>
      &nbsp;&middot;&nbsp;
      <a href="${SITE_URL}/blog" style="color:${COLORS.primary};text-decoration:none;">Blog</a>
    </p>
    <p style="margin:0 0 8px;font-size:12px;color:${COLORS.textLight};text-align:center;line-height:1.6;">
      <a href="${SITE_URL}/privacy-policy" style="color:${COLORS.textLight};text-decoration:underline;">Privacy Policy</a>
      &nbsp;&middot;&nbsp;
      <a href="${SITE_URL}/terms" style="color:${COLORS.textLight};text-decoration:underline;">Terms of Service</a>
      &nbsp;&middot;&nbsp;
      <a href="${SITE_URL}/refund-policy" style="color:${COLORS.textLight};text-decoration:underline;">Refund Policy</a>
    </p>
    <p style="margin:12px 0 0;font-size:11px;color:${COLORS.textLight};text-align:center;line-height:1.5;">
      You received this email because you have an account on ${SITE_NAME}.<br>
      <a href="${UNSUBSCRIBE_URL}" style="color:${COLORS.textLight};text-decoration:underline;">Unsubscribe</a>
      &nbsp;|&nbsp;
      <a href="${SITE_URL}/settings" style="color:${COLORS.textLight};text-decoration:underline;">Email Preferences</a>
    </p>
    <p style="margin:12px 0 0;font-size:11px;color:#D1D5DB;text-align:center;line-height:1.5;">
      &copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
    </p>
  </td></tr>`
}

// ── Wrap Template ────────────────────────────────────────────
function wrapTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title} &mdash; ${SITE_NAME}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-padding { padding: 28px 24px !important; }
      .header-padding { padding: 28px 24px !important; }
      .footer-padding { padding: 24px 24px 28px !important; }
      .mobile-full { width: 100% !important; display: block !important; }
      .mobile-center { text-align: center !important; }
      .mobile-hide { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#EEF0F5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;font-size:1px;color:#EEF0F5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${title} &mdash; ${SITE_NAME}
  </div>
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEF0F5;">
    <tr><td align="center" style="padding:40px 16px;">
      <!-- Inner container -->
      <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:${COLORS.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06),0 1px 4px rgba(0,0,0,0.04);">

        <!-- Header with gradient + subtle pattern -->
        <tr><td class="header-padding" style="background:linear-gradient(135deg,${COLORS.primary} 0%,${COLORS.primaryLight} 50%,#7C6EF8 100%);padding:36px 40px;text-align:center;position:relative;">
          <!--[if mso]>
          <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:160px;">
          <v:fill type="pattern" src="" color="${COLORS.primary}" />
          <v:textbox inset="0,0,0,0">
          <![endif]-->
          <!-- Decorative circles -->
          <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.07);"></div>
          <div style="position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
          <!-- Logo -->
          <img src="${LOGO_URL}" alt="${SITE_NAME}" width="48" height="48" style="border-radius:12px;margin-bottom:14px;display:inline-block;border:2px solid rgba(255,255,255,0.25);" />
          <!-- Title -->
          <h1 style="margin:0;color:${COLORS.white};font-size:20px;font-weight:700;letter-spacing:0.3px;">${SITE_NAME}</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:12px;font-weight:400;letter-spacing:0.5px;text-transform:uppercase;">${title}</p>
          <!--[if mso]>
          </v:textbox></v:rect>
          <![endif]-->
        </td></tr>

        <!-- Body -->
        <tr><td class="email-padding" style="padding:40px 40px 20px;">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td class="footer-padding" style="padding:0 40px 8px;">
          ${buildFooter()}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Helper: CTA Button ──────────────────────────────────────
function ctaButton(url: string, label: string, style?: string): string {
  const bgStyle = style || `background:linear-gradient(135deg,${COLORS.primary},${COLORS.primaryLight});`
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:4px;">
    <tr><td align="center">
      <a href="${url}" target="_blank" style="display:inline-block;padding:14px 36px;${bgStyle}color:${COLORS.white};font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;letter-spacing:0.2px;box-shadow:0 4px 12px rgba(109,94,245,0.3);">
        ${label}
      </a>
    </td></tr>
  </table>`
}

// ── Helper: Feature Row ─────────────────────────────────────
function featureRow(icon: string, title: string, description: string, credits: string): string {
  return `
  <tr>
    <td style="padding:14px 16px;background:${COLORS.bgLight};border-radius:10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="40" valign="top" style="padding-right:12px;">
            <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,${COLORS.primary},${COLORS.primaryLight});text-align:center;line-height:36px;font-size:18px;color:${COLORS.white};">${icon}</div>
          </td>
          <td valign="top">
            <p style="margin:0;font-size:14px;font-weight:600;color:${COLORS.text};">${title}</p>
            <p style="margin:4px 0 0;font-size:12px;color:${COLORS.textMuted};line-height:1.5;">${description}</p>
          </td>
          <td width="70" valign="top" align="right">
            <span style="display:inline-block;padding:3px 8px;background:rgba(109,94,245,0.08);color:${COLORS.primary};font-size:11px;font-weight:600;border-radius:6px;white-space:nowrap;">${credits}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr><td style="height:8px;"></td></tr>`
}

// ══════════════════════════════════════════════════════════════
// ── Welcome Email ───────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export function welcomeEmail(name: string, email: string): { subject: string; html: string } {
  return {
    subject: `Welcome to ${SITE_NAME} — Your AI SEO Toolkit is Ready!`,
    html: wrapTemplate("Welcome", `
      <!-- Greeting -->
      <h2 style="margin:0 0 8px;color:${COLORS.text};font-size:24px;font-weight:700;">Welcome, ${name}! 👋</h2>
      <p style="margin:0 0 20px;color:${COLORS.textSecondary};font-size:15px;line-height:1.7;">
        Your account is all set up and ready to go. We're excited to have you on board.
      </p>

      <!-- Credit Balance Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:linear-gradient(135deg,${COLORS.primary},${COLORS.primaryLight});border-radius:12px;padding:24px 28px;text-align:center;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Starting Balance</p>
          <p style="margin:0;color:${COLORS.white};font-size:42px;font-weight:800;line-height:1.1;">100 <span style="font-size:18px;font-weight:500;opacity:0.8;">credits</span></p>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Free credits — no card required</p>
        </td></tr>
      </table>

      <!-- What you can do -->
      <p style="margin:0 0 16px;color:${COLORS.text};font-size:16px;font-weight:600;">Here's what you can do right now:</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        ${featureRow("🔍", "Keyword Intelligence", "AI-powered keyword research with competition analysis & search volume", "2 cr")}
        ${featureRow("✍️", "Post Generator", "Generate full SEO-optimized blog posts with AI in minutes", "10 cr")}
        ${featureRow("🛡️", "Plagiarism Checker", "Scan content against billions of sources for originality", "4 cr")}
        ${featureRow("📊", "Website Audit", "Full technical SEO audit with actionable recommendations", "3 cr")}
        ${featureRow("🧠", "Content Brief", "AI-generated briefs with word count, headings & keywords", "5 cr")}
        ${featureRow("🔗", "Backlink Checker", "Analyze your backlink profile and find new opportunities", "2 cr")}
      </table>

      <!-- Social Proof -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:${COLORS.bgLight};border-radius:10px;padding:18px 20px;text-align:center;border:1px solid ${COLORS.border};">
          <p style="margin:0;font-size:14px;color:${COLORS.textSecondary};line-height:1.6;">
            🏆 Trusted by <strong style="color:${COLORS.primary};">10,000+</strong> content creators worldwide
          </p>
        </td></tr>
      </table>

      <!-- CTA -->
      ${ctaButton(`${SITE_URL}/dashboard`, "Go to Dashboard →")}

      <!-- Getting Started -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
        <tr><td style="background:${COLORS.bgLight};border-radius:10px;padding:20px;">
          <p style="margin:0 0 10px;color:${COLORS.text};font-size:14px;font-weight:600;">💡 Quick Start Tips</p>
          <p style="margin:0 0 8px;color:${COLORS.textMuted};font-size:13px;line-height:1.6;">
            1. Start with <strong>Keyword Intelligence</strong> to find what your audience is searching for
          </p>
          <p style="margin:0 0 8px;color:${COLORS.textMuted};font-size:13px;line-height:1.6;">
            2. Use the <strong>Post Generator</strong> to create your first article in minutes
          </p>
          <p style="margin:0;color:${COLORS.textMuted};font-size:13px;line-height:1.6;">
            3. Run a <strong>Website Audit</strong> to see where you can improve your SEO
          </p>
        </td></tr>
      </table>
    `),
  }
}

// ══════════════════════════════════════════════════════════════
// ── Payment Confirmed ───────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export function paymentConfirmedEmail(
  name: string, planName: string, amount: number, billingCycle: string
): { subject: string; html: string } {
  const nextBillingDate = (() => {
    const d = new Date()
    if (billingCycle === "monthly" || billingCycle === "Monthly") {
      d.setMonth(d.getMonth() + 1)
    } else {
      d.setFullYear(d.getFullYear() + 1)
    }
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  })()

  return {
    subject: `Payment Confirmed — ${planName} Plan Activated`,
    html: wrapTemplate("Payment Confirmed", `
      <!-- Success Banner -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:${COLORS.successLight};border:1px solid ${COLORS.successBorder};border-radius:12px;padding:24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:36px;">✅</p>
          <p style="margin:0;color:#065F46;font-size:18px;font-weight:700;">Payment Successful</p>
          <p style="margin:6px 0 0;color:#047857;font-size:13px;">Your plan is now active and ready to use</p>
        </td></tr>
      </table>

      <!-- Greeting -->
      <p style="margin:0 0 20px;color:${COLORS.textSecondary};font-size:15px;line-height:1.7;">
        Hi ${name}, thank you for your payment. Your <strong>${planName}</strong> plan has been activated.
      </p>

      <!-- Receipt Table -->
      <p style="margin:0 0 12px;color:${COLORS.text};font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Payment Receipt</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;">
        <!-- Plan -->
        <tr>
          <td style="padding:14px 18px;background:${COLORS.bgLight};border-bottom:1px solid ${COLORS.border};font-size:13px;color:${COLORS.textMuted};">Plan</td>
          <td style="padding:14px 18px;background:${COLORS.bgLight};border-bottom:1px solid ${COLORS.border};font-size:14px;font-weight:600;color:${COLORS.text};text-align:right;">${planName}</td>
        </tr>
        <!-- Amount -->
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid ${COLORS.border};font-size:13px;color:${COLORS.textMuted};">Amount Paid</td>
          <td style="padding:14px 18px;border-bottom:1px solid ${COLORS.border};font-size:16px;font-weight:700;color:${COLORS.success};text-align:right;">$${amount}</td>
        </tr>
        <!-- Billing Cycle -->
        <tr>
          <td style="padding:14px 18px;background:${COLORS.bgLight};border-bottom:1px solid ${COLORS.border};font-size:13px;color:${COLORS.textMuted};">Billing Cycle</td>
          <td style="padding:14px 18px;background:${COLORS.bgLight};border-bottom:1px solid ${COLORS.border};font-size:14px;font-weight:600;color:${COLORS.text};text-align:right;">${billingCycle}</td>
        </tr>
        <!-- Next Billing -->
        <tr>
          <td style="padding:14px 18px;font-size:13px;color:${COLORS.textMuted};">Next Billing Date</td>
          <td style="padding:14px 18px;font-size:14px;font-weight:600;color:${COLORS.text};text-align:right;">${nextBillingDate}</td>
        </tr>
      </table>

      <!-- CTA -->
      ${ctaButton(`${SITE_URL}/dashboard`, "Start Creating →")}

      <!-- Note -->
      <p style="margin:24px 0 0;font-size:12px;color:${COLORS.textLight};text-align:center;line-height:1.6;">
        A copy of this receipt has been saved to your account.<br>
        You can manage your subscription from your <a href="${SITE_URL}/dashboard/settings" style="color:${COLORS.primary};text-decoration:none;">account settings</a>.
      </p>
    `),
  }
}

// ══════════════════════════════════════════════════════════════
// ── Credits Low Warning ─────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export function creditsLowEmail(name: string, creditsLeft: number): { subject: string; html: string } {
  const maxCredits = 100
  const usagePercent = Math.round(((maxCredits - creditsLeft) / maxCredits) * 100)

  return {
    subject: `Credits Running Low — ${creditsLeft} credits remaining`,
    html: wrapTemplate("Credits Running Low", `
      <!-- Warning Banner -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:${COLORS.warningLight};border:1px solid ${COLORS.warningBorder};border-radius:12px;padding:24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:36px;">⚠️</p>
          <p style="margin:0;color:#92400E;font-size:18px;font-weight:700;">Credits Running Low</p>
          <p style="margin:6px 0 0;color:#B45309;font-size:13px;">Don't let your workflow be interrupted</p>
        </td></tr>
      </table>

      <!-- Greeting -->
      <p style="margin:0 0 20px;color:${COLORS.textSecondary};font-size:15px;line-height:1.7;">
        Hi ${name}, you have <strong style="color:${COLORS.warning};">${creditsLeft} credits</strong> remaining this month.
      </p>

      <!-- Usage Bar -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
        <tr>
          <td style="font-size:13px;color:${COLORS.textMuted};">Usage</td>
          <td style="font-size:13px;color:${COLORS.textMuted};text-align:right;">${usagePercent}% used</td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:#E5E7EB;border-radius:100px;height:10px;padding:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="${usagePercent}%" style="border-radius:100px;">
            <tr><td style="background:linear-gradient(90deg,${COLORS.warning},#F97316);height:10px;border-radius:100px;"></td></tr>
          </table>
        </td></tr>
      </table>

      <!-- Credit Breakdown -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:14px 18px;background:${COLORS.bgLight};border-bottom:1px solid ${COLORS.border};font-size:13px;color:${COLORS.textMuted};">Credits Remaining</td>
          <td style="padding:14px 18px;background:${COLORS.bgLight};border-bottom:1px solid ${COLORS.border};font-size:14px;font-weight:600;color:${COLORS.warning};text-align:right;">${creditsLeft} / ${maxCredits}</td>
        </tr>
        <tr>
          <td style="padding:14px 18px;font-size:13px;color:${COLORS.textMuted};">Credits Used</td>
          <td style="padding:14px 18px;font-size:14px;font-weight:600;color:${COLORS.text};text-align:right;">${maxCredits - creditsLeft}</td>
        </tr>
      </table>

      <!-- What credits get you -->
      <p style="margin:0 0 12px;color:${COLORS.text};font-size:14px;font-weight:600;">With more credits you can:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="padding:10px 14px;background:${COLORS.bgLight};border-radius:8px;">
          <p style="margin:0;font-size:13px;color:${COLORS.textMuted};line-height:1.6;">
            ✦ Generate <strong>10+ blog posts</strong> per month<br>
            ✦ Run <strong>unlimited keyword research</strong><br>
            ✦ Audit <strong>dozens of websites</strong> for SEO issues<br>
            ✦ Check <strong>all your content</strong> for plagiarism
          </p>
        </td></tr>
      </table>

      <!-- CTA -->
      ${ctaButton(`${SITE_URL}/pricing`, "Upgrade Your Plan →")}

      <p style="margin:20px 0 0;font-size:12px;color:${COLORS.textLight};text-align:center;line-height:1.6;">
        Credits reset automatically on the 1st of each month with your subscription.
      </p>
    `),
  }
}

// ══════════════════════════════════════════════════════════════
// ── Password Reset ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export function passwordResetEmail(name: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: `Reset Your ${SITE_NAME} Password`,
    html: wrapTemplate("Password Reset", `
      <!-- Security Icon -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr><td align="center">
          <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,${COLORS.infoLight},${COLORS.infoLight});border:2px solid ${COLORS.infoBorder};text-align:center;line-height:64px;font-size:28px;">🔐</div>
        </td></tr>
      </table>

      <!-- Greeting -->
      <h2 style="margin:0 0 8px;color:${COLORS.text};font-size:22px;font-weight:700;text-align:center;">Password Reset Request</h2>
      <p style="margin:0 0 24px;color:${COLORS.textSecondary};font-size:15px;line-height:1.7;text-align:center;">
        Hi ${name}, we received a request to reset the password for your ${SITE_NAME} account.
      </p>

      <!-- CTA -->
      ${ctaButton(resetUrl, "Reset My Password")}

      <!-- Expiry Notice -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
        <tr><td style="background:${COLORS.infoLight};border:1px solid ${COLORS.infoBorder};border-radius:10px;padding:16px 20px;text-align:center;">
          <p style="margin:0 0 4px;color:#1E40AF;font-size:13px;font-weight:600;">⏱ This link expires in 1 hour</p>
          <p style="margin:0;color:#3B82F6;font-size:12px;">For your security, the reset link will stop working after 60 minutes.</p>
        </td></tr>
      </table>

      <!-- Not You? -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
        <tr><td style="background:${COLORS.bgLight};border-radius:10px;padding:20px;text-align:center;border:1px solid ${COLORS.border};">
          <p style="margin:0 0 6px;color:${COLORS.text};font-size:14px;font-weight:600;">Didn't request this?</p>
          <p style="margin:0;color:${COLORS.textMuted};font-size:13px;line-height:1.6;">
            If you didn't ask for a password reset, you can safely ignore this email.<br>
            Your password will remain unchanged, and no action is needed.
          </p>
          <p style="margin:12px 0 0;font-size:13px;">
            <a href="mailto:${SUPPORT_EMAIL}" style="color:${COLORS.primary};text-decoration:none;font-weight:500;">Contact Support</a>
            if you have concerns about your account security.
          </p>
        </td></tr>
      </table>
    `),
  }
}

// ══════════════════════════════════════════════════════════════
// ── Subscription Renewed ────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export function subscriptionRenewedEmail(
  name: string, planName: string, credits: number, renewalDate: string
): { subject: string; html: string } {
  return {
    subject: `${SITE_NAME} — Your Credits Have Been Renewed!`,
    html: wrapTemplate("Subscription Renewed", `
      <!-- Celebration Banner -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:linear-gradient(135deg,#EDE9FE,#DDD6FE,#C4B5FD);border-radius:12px;padding:28px 24px;text-align:center;">
          <p style="margin:0 0 6px;font-size:42px;">&#127881;</p>
          <p style="margin:0;color:${COLORS.primary};font-size:20px;font-weight:700;">Credits Renewed!</p>
          <p style="margin:6px 0 0;color:#7C3AED;font-size:13px;">Your fresh batch is ready to go</p>
        </td></tr>
      </table>

      <!-- Greeting -->
      <p style="margin:0 0 20px;color:${COLORS.textSecondary};font-size:15px;line-height:1.7;">
        Hi ${name}, great news! Your <strong>${planName}</strong> subscription has been renewed and your credits have been refreshed.
      </p>

      <!-- Renewal Details -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
        <tr><td style="padding:0 2px;font-size:14px;font-weight:600;color:${COLORS.text};">Your Renewal Summary</td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:14px 18px;background:${COLORS.bgLight};border-bottom:1px solid ${COLORS.border};font-size:13px;color:${COLORS.textMuted};">Plan</td>
          <td style="padding:14px 18px;background:${COLORS.bgLight};border-bottom:1px solid ${COLORS.border};font-size:14px;font-weight:600;color:${COLORS.text};text-align:right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid ${COLORS.border};font-size:13px;color:${COLORS.textMuted};">Credits Renewed</td>
          <td style="padding:14px 18px;border-bottom:1px solid ${COLORS.border};font-size:16px;font-weight:700;color:${COLORS.primary};text-align:right;">${credits}</td>
        </tr>
        <tr>
          <td style="padding:14px 18px;font-size:13px;color:${COLORS.textMuted};">Next Renewal</td>
          <td style="padding:14px 18px;font-size:14px;font-weight:600;color:${COLORS.text};text-align:right;">${renewalDate}</td>
        </tr>
      </table>

      <!-- Usage Tips -->
      <p style="margin:0 0 12px;color:${COLORS.text};font-size:14px;font-weight:600;">💡 Make the Most of Your Credits</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="padding:14px 16px;background:${COLORS.bgLight};border-radius:10px;border-left:3px solid ${COLORS.primary};">
          <p style="margin:0 0 6px;font-size:13px;color:${COLORS.text};font-weight:500;">Plan your content calendar</p>
          <p style="margin:0;color:${COLORS.textMuted};font-size:12px;line-height:1.5;">Map out your month to spread credits evenly and maintain consistent output.</p>
        </td></tr>
        <tr><td style="height:8px;"></td></tr>
        <tr><td style="padding:14px 16px;background:${COLORS.bgLight};border-radius:10px;border-left:3px solid ${COLORS.cyan};">
          <p style="margin:0 0 6px;font-size:13px;color:${COLORS.text};font-weight:500;">Use the Keyword Intelligence first</p>
          <p style="margin:0;color:${COLORS.textMuted};font-size:12px;line-height:1.5;">Research before you write. Target the right keywords to maximize your SEO impact.</p>
        </td></tr>
        <tr><td style="height:8px;"></td></tr>
        <tr><td style="padding:14px 16px;background:${COLORS.bgLight};border-radius:10px;border-left:3px solid ${COLORS.success};">
          <p style="margin:0 0 6px;font-size:13px;color:${COLORS.text};font-weight:500;">Run regular audits</p>
          <p style="margin:0;color:${COLORS.textMuted};font-size:12px;line-height:1.5;">Catch technical issues early with monthly website audits to keep your SEO on track.</p>
        </td></tr>
      </table>

      <!-- CTA -->
      ${ctaButton(`${SITE_URL}/dashboard`, "Start Creating →")}
    `),
  }
}

// ══════════════════════════════════════════════════════════════
// ── Payment Pending (Admin Review) ──────────────────────────
// ══════════════════════════════════════════════════════════════
export function paymentPendingEmail(
  name: string, planName: string, amount: number
): { subject: string; html: string } {
  return {
    subject: `Payment Received — Under Review`,
    html: wrapTemplate("Payment Under Review", `
      <!-- Info Banner -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:${COLORS.infoLight};border:1px solid ${COLORS.infoBorder};border-radius:12px;padding:24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:36px;">&#9203;</p>
          <p style="margin:0;color:#1E40AF;font-size:18px;font-weight:700;">Payment Under Review</p>
          <p style="margin:6px 0 0;color:#2563EB;font-size:13px;">We've received your payment</p>
        </td></tr>
      </table>

      <!-- Greeting -->
      <p style="margin:0 0 20px;color:${COLORS.textSecondary};font-size:15px;line-height:1.7;">
        Hi ${name}, we've received your payment for the <strong>${planName}</strong> plan. Our team is reviewing it now.
      </p>

      <!-- Payment Details -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
        <tr><td style="padding:0 2px;font-size:14px;font-weight:600;color:${COLORS.text};">Payment Details</td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:14px 18px;background:${COLORS.bgLight};border-bottom:1px solid ${COLORS.border};font-size:13px;color:${COLORS.textMuted};">Plan</td>
          <td style="padding:14px 18px;background:${COLORS.bgLight};border-bottom:1px solid ${COLORS.border};font-size:14px;font-weight:600;color:${COLORS.text};text-align:right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid ${COLORS.border};font-size:13px;color:${COLORS.textMuted};">Amount</td>
          <td style="padding:14px 18px;border-bottom:1px solid ${COLORS.border};font-size:14px;font-weight:600;color:${COLORS.text};text-align:right;">$${amount}</td>
        </tr>
        <tr>
          <td style="padding:14px 18px;font-size:13px;color:${COLORS.textMuted};">Status</td>
          <td style="padding:14px 18px;text-align:right;">
            <span style="display:inline-block;padding:3px 10px;background:${COLORS.infoLight};color:#2563EB;font-size:12px;font-weight:600;border-radius:6px;">Pending Review</span>
          </td>
        </tr>
      </table>

      <!-- Estimated Time -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr><td style="background:rgba(109,94,245,0.05);border:1px solid rgba(109,94,245,0.15);border-radius:10px;padding:18px 20px;text-align:center;">
          <p style="margin:0 0 4px;color:${COLORS.primary};font-size:14px;font-weight:600;">⏱ Estimated Review Time</p>
          <p style="margin:0;color:${COLORS.textSecondary};font-size:13px;line-height:1.6;">Most payments are reviewed and confirmed <strong>within 2-4 hours</strong> during business hours.</p>
        </td></tr>
      </table>

      <!-- What Happens Next -->
      <p style="margin:0 0 12px;color:${COLORS.text};font-size:14px;font-weight:600;">What happens next:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr>
          <td width="36" valign="top" style="padding:8px 12px 8px 0;">
            <div style="width:28px;height:28px;border-radius:50%;background:${COLORS.primary};color:${COLORS.white};text-align:center;line-height:28px;font-size:13px;font-weight:700;">1</div>
          </td>
          <td valign="top" style="padding:8px 0;">
            <p style="margin:0;font-size:13px;color:${COLORS.text};line-height:1.6;">Our team verifies your payment with the provider</p>
          </td>
        </tr>
        <tr>
          <td width="36" valign="top" style="padding:8px 12px 8px 0;">
            <div style="width:28px;height:28px;border-radius:50%;background:${COLORS.primary};color:${COLORS.white};text-align:center;line-height:28px;font-size:13px;font-weight:700;">2</div>
          </td>
          <td valign="top" style="padding:8px 0;">
            <p style="margin:0;font-size:13px;color:${COLORS.text};line-height:1.6;">Your plan is activated and credits are added to your account</p>
          </td>
        </tr>
        <tr>
          <td width="36" valign="top" style="padding:8px 12px 8px 0;">
            <div style="width:28px;height:28px;border-radius:50%;background:${COLORS.primary};color:${COLORS.white};text-align:center;line-height:28px;font-size:13px;font-weight:700;">3</div>
          </td>
          <td valign="top" style="padding:8px 0;">
            <p style="margin:0;font-size:13px;color:${COLORS.text};line-height:1.6;">You'll receive a confirmation email with your receipt</p>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      ${ctaButton(`${SITE_URL}/dashboard/billing`, "View Billing Status")}

      <!-- Support Note -->
      <p style="margin:20px 0 0;font-size:12px;color:${COLORS.textLight};text-align:center;line-height:1.6;">
        Questions about your payment? Contact us at
        <a href="mailto:${SUPPORT_EMAIL}" style="color:${COLORS.primary};text-decoration:none;">${SUPPORT_EMAIL}</a>
      </p>
    `),
  }
}

// ══════════════════════════════════════════════════════════════
// ── Account Suspended ───────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export function accountSuspendedEmail(name: string, reason: string): { subject: string; html: string } {
  return {
    subject: `${SITE_NAME} — Your Account Has Been Suspended`,
    html: wrapTemplate("Account Suspended", `
      <!-- Danger Banner -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:${COLORS.dangerLight};border:1px solid ${COLORS.dangerBorder};border-radius:12px;padding:28px 24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:36px;">🚫</p>
          <p style="margin:0;color:#991B1B;font-size:18px;font-weight:700;">Account Suspended</p>
          <p style="margin:6px 0 0;color:#B91C1C;font-size:13px;">Your access has been temporarily disabled</p>
        </td></tr>
      </table>

      <!-- Greeting -->
      <p style="margin:0 0 20px;color:${COLORS.textSecondary};font-size:15px;line-height:1.7;">
        Hi ${name},
      </p>
      <p style="margin:0 0 20px;color:${COLORS.textSecondary};font-size:15px;line-height:1.7;">
        Your ${SITE_NAME} account has been suspended. During this period, you will not be able to access your dashboard or use any tools.
      </p>

      <!-- Reason -->
      <p style="margin:0 0 8px;color:${COLORS.text};font-size:14px;font-weight:600;">Reason for Suspension</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr><td style="background:${COLORS.bgLight};border:1px solid ${COLORS.border};border-left:4px solid ${COLORS.danger};border-radius:0 10px 10px 0;padding:16px 20px;">
          <p style="margin:0;color:${COLORS.textSecondary};font-size:14px;line-height:1.6;">${reason}</p>
        </td></tr>
      </table>

      <!-- Impact Notice -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr><td style="background:${COLORS.bgLight};border-radius:10px;padding:18px 20px;">
          <p style="margin:0 0 8px;color:${COLORS.text};font-size:13px;font-weight:600;">What this means:</p>
          <p style="margin:0;color:${COLORS.textMuted};font-size:13px;line-height:1.7;">
            ✦ Your dashboard and all projects are temporarily inaccessible<br>
            ✦ Active subscriptions are paused (no charges during suspension)<br>
            ✦ Your data is preserved and will be available if reinstated
          </p>
        </td></tr>
      </table>

      <!-- Appeal -->
      <p style="margin:0 0 16px;color:${COLORS.textSecondary};font-size:14px;line-height:1.7;">
        If you believe this was done in error, or if you would like to appeal, please contact our support team. We review all appeals within <strong>48 hours</strong>.
      </p>

      <!-- CTA -->
      ${ctaButton(`mailto:${SUPPORT_EMAIL}?subject=Account%20Suspension%20Appeal%20-%20${encodeURIComponent(name)}`, "Contact Support", `background:${COLORS.danger};`)}

      <p style="margin:24px 0 0;font-size:12px;color:${COLORS.textLight};text-align:center;line-height:1.6;">
        Please review our <a href="${SITE_URL}/terms" style="color:${COLORS.primary};text-decoration:none;">Terms of Service</a>
        for more information about account policies.
      </p>
    `),
  }
}
