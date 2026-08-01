"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkRateLimit } from "@/lib/security/rate-limit"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Determine a user-friendly error message from Supabase auth error.
 * Also checks if the email exists in the profiles table to provide
 * more specific (but still safe) error messages.
 */
async function getAuthErrorMessage(
  supabase: SupabaseClient,
  email: string,
  authError: { message: string }
): Promise<string> {
  const errMsg = authError.message?.toLowerCase() || ""

  if (errMsg.includes("invalid login credentials") || errMsg.includes("invalid")) {
    return "The email or password you entered is incorrect. Please try again."
  }

  if (errMsg.includes("email not confirmed") || errMsg.includes("email_not_confirmed")) {
    return "Please confirm your email address before signing in. Check your inbox for the confirmation link."
  }

  if (errMsg.includes("too many") || errMsg.includes("rate limit")) {
    return "Too many failed attempts. Please try again later."
  }

  return "The email or password you entered is incorrect. Please try again."
}

export async function adminLogin(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = (formData.get("email") as string) || ""
  const password = formData.get("password") as string

  // Rate limit: 3 admin login attempts per 3 DAYS per email
  const rl = checkRateLimit(`admin-login:${email}`, 3, 3 * 24 * 60 * 60_000)
  if (rl.limited) {
    return { error: "Too many failed attempts. Your account has been temporarily locked for security. Please try again in 3 days or contact support." }
  }

  const { data: _data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const message = await getAuthErrorMessage(supabase, email, error)
    return { error: message }
  }

  const { data: { user: verifiedUser }, error: verifyErr } = await supabase.auth.getUser()
  if (verifyErr || !verifiedUser) return { error: "Session verification failed. Please try again." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, user_id")
    .eq("user_id", verifiedUser.id)
    .maybeSingle()

  const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()

  if (!role || (role !== "admin" && role !== "super_admin")) {
    await supabase.auth.signOut()
    return { error: "This account does not have admin access. Please use the regular login page." }
  }

  revalidatePath("/", "layout")
  return { redirect: "/zain-nextill-ansari" }
}

export async function adminLogout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  return { redirect: "/zain-nextill-ansari/login" }
}
