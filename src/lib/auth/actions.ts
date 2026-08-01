"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { validateRealEmail } from "@/lib/security/email-validator"
import { sendEmail } from "@/lib/email"
import { welcomeEmail } from "@/lib/email/templates"

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirect") as string) || null

  // Rate limit: 5 login attempts per 1 hour per email
  const rl = checkRateLimit(`login:${email}`, 5, 60 * 60_000)
  if (rl.limited) {
    return { error: "Too many failed login attempts. Your account has been temporarily locked. Please try again in 1 hour." }
  }

  const { data: _data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const errMsg = error.message?.toLowerCase() || ""
    if (errMsg.includes("email not confirmed") || errMsg.includes("email_not_confirmed")) {
      return { error: "Please confirm your email address before signing in. Check your inbox for the confirmation link." }
    }
    return { error: "The email or password you entered is incorrect. Please try again." }
  }

  const { data: { user: verifiedUser }, error: verifyErr } = await supabase.auth.getUser()
  if (verifyErr || !verifiedUser) return { error: "Failed to verify session. Please try again." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, user_id, full_name")
    .eq("user_id", verifiedUser.id)
    .maybeSingle()

  const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()

  revalidatePath("/", "layout")

  // If a redirect param is provided, honor it (e.g. from checkout flow)
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return { redirect: redirectTo }
  }

  if (role === "admin" || role === "super_admin") {
    // Admin accounts must use the dedicated admin login, not /login
    await supabase.auth.signOut()
    return { error: "Admin accounts must use the admin login page." }
  }

  return { redirect: "/dashboard" }
}

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("full_name") as string
  const redirectTo = (formData.get("redirect") as string) || null

  // Rate limit: 3 signups per hour per IP (using email as proxy)
  const rl = checkRateLimit(`signup:${email}`, 3, 60 * 60_000)
  if (rl.limited) {
    return { error: "Too many signup attempts. Please try again later." }
  }

  // Password strength validation
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." }
  }
  if (!/[A-Z]/.test(password)) {
    return { error: "Password must include at least one uppercase letter." }
  }
  if (!/[a-z]/.test(password)) {
    return { error: "Password must include at least one lowercase letter." }
  }
  if (!/[0-9]/.test(password)) {
    return { error: "Password must include at least one number." }
  }

  // Validate real email provider (block temp/disposable emails)
  const emailCheck = validateRealEmail(email)
  if (!emailCheck.valid) {
    return { error: emailCheck.reason || "Invalid email provider" }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) {
    const errMsg = error.message?.toLowerCase() || ""
    if (errMsg.includes("already registered") || errMsg.includes("already been registered") || errMsg.includes("user already")) {
      return { error: "An account with this email already exists. Please sign in instead." }
    }
    return { error: error.message }
  }

  if (data?.session && data.user) {
    // Send welcome email (fire-and-forget, don't block signup)
    const welcome = welcomeEmail(fullName || "there", email)
    sendEmail({ to: email, subject: welcome.subject, html: welcome.html }).catch(() => {})

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle()

    const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
    revalidatePath("/", "layout")

    // If a redirect param is provided, honor it (e.g. from checkout flow)
    if (redirectTo && redirectTo.startsWith("/")) {
      return { redirect: redirectTo }
    }

    if (role === "admin" || role === "super_admin") {
      // Admin accounts should not sign up through the public form
      await supabase.auth.signOut()
      return { error: "Admin accounts cannot be created through public signup." }
    }
    return { redirect: "/dashboard" }
  }

  return {
    success: true,
    message: "Check your email for a confirmation link.",
  }
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })
  if (error) return { error: error.message }

  return {
    success: true,
    message: "Check your email for a reset link.",
  }
}

export async function logout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  return { redirect: "/login" }
}
