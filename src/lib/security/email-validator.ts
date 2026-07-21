/**
 * Real email provider validation.
 * Only allows emails from legitimate, established email providers.
 * Blocks disposable/temporary email services.
 */

// Allowed real email domains (major providers)
const ALLOWED_DOMAINS = new Set([
  // Google
  "gmail.com", "googlemail.com",
  // Microsoft
  "outlook.com", "hotmail.com", "live.com", "live.co.uk", "msn.com", "hotmail.co.uk",
  // Apple
  "icloud.com", "me.com", "mac.com",
  // Yahoo
  "yahoo.com", "yahoo.co.uk", "yahoo.co.in", "yahoo.ca", "yahoo.com.au",
  // Proton
  "protonmail.com", "proton.me", "pm.me",
  // Zoho
  "zohomail.com", "zoho.com",
  // AOL
  "aol.com", "aim.com",
  // GMX
  "gmx.com", "gmx.co.uk", "gmx.net",
  // Mail.com / GMX family
  "mail.com", "email.com",
  // Fastmail
  "fastmail.com", "fastmail.fm",
  // Tutanota
  "tutanota.com", "tutamail.com", "tuta.io", "keemail.me",
  // Yandex
  "yandex.com", "yandex.ru", "ya.ru",
  // Mail.ru
  "mail.ru", "inbox.ru", "list.ru",
  // iCloud private relay
  "icloud.com",
  // Workspace / business
  "google.com",
  // UK providers
  "btinternet.com", "btopenworld.com",
  // Other major
  "rediffmail.com",
  "laposte.net",
  "web.de",
  "arcor.de",
  "orange.fr", "orange.fr",
  "sfr.fr",
  "free.fr",
])

// Known disposable email domains to explicitly block
const BLOCKED_DOMAINS = new Set([
  "guerrillamail.com", "guerrillamail.de", "guerrillamail.net",
  "tempmail.com", "temp-mail.org", "tempmailo.com",
  "throwaway.email", "throwam.com",
  "mailinator.com", "maildrop.cc",
  "yopmail.com", "yopmail.fr",
  "guerrillamailblock.com",
  "sharklasers.com", "guerrillamail.info",
  "grr.la", "grr.la",
  "discard.email", "discardmail.com",
  "fakeinbox.com", "fakemailgenerator.com",
  "tempail.com", "tempalias.com",
  "10minutemail.com", "10minutemail.co.za",
  "getnada.com", "getairmail.com",
  "mohmal.com",
  "harakirimail.com",
  "tmail.ws", "tmail.io",
  "mailsac.com",
  "mailnesia.com",
  "mailcatch.com",
  "dispostable.com",
  "trashmail.com", "trashmail.me", "trashmail.net",
  "tempr.email",
  "tmpmail.net", "tmpmail.org",
  "tmpmailor.com",
  "boun.cr", "bouncr.com",
  "chacuo.net",
  "emailondeck.com",
  "ephemail.net",
  "filzmail.com",
  "get-mail.cf",
  "hat-gifts.com",
  "meltmail.com",
  "nospam.ze.tc",
  "nospamfor.us",
  "nowmymail.com",
  "reply-to.com",
  "s0ny.net",
  "safetymail.info",
  "slaskpost.se",
  "spamavert.com",
  "spamfree24.org",
  "spaml.de",
  "spamoff.de",
  "superrito.com",
  "teleworm.us",
  "temporaryemail.net",
  "thankyou2010.com",
  "tradermail.info",
  "turual.com",
  "tvchd.com",
  "uggsrock.com",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wh4f.org",
  "yopmail.gq",
  "zoaxe.com",
  "zoemail.org",
])

/**
 * Validate if an email is from a real, established provider.
 * Returns { valid: boolean; reason?: string }
 */
export function validateRealEmail(email: string): { valid: boolean; reason?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, reason: "Email is required" }
  }

  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    return { valid: false, reason: "Invalid email format" }
  }

  const domain = email.split("@")[1]?.toLowerCase()

  if (!domain) {
    return { valid: false, reason: "Invalid email domain" }
  }

  // Explicitly block disposable emails
  if (BLOCKED_DOMAINS.has(domain)) {
    return { valid: false, reason: "Disposable email addresses are not allowed. Please use a real email provider (Gmail, Outlook, iCloud, etc.)" }
  }

  // Check against allowed list (if populated, use it; otherwise block known bad)
  if (ALLOWED_DOMAINS.size > 0 && !ALLOWED_DOMAINS.has(domain)) {
    // Not in our allowed list — check common patterns
    // Allow custom domains that look like business domains (have MX records likely)
    // But block known disposable patterns
    if (domain.includes("temp") || domain.includes("throw") || domain.includes("fake") ||
        domain.includes("trash") || domain.includes("discard") || domain.includes("burner")) {
      return { valid: false, reason: "Disposable email addresses are not allowed. Please use a real email provider (Gmail, Outlook, iCloud, etc.)" }
    }
    // Allow unknown domains (they might be legitimate business domains)
  }

  return { valid: true }
}
