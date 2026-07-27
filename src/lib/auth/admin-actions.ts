"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkRateLimit } from "@/lib/security/rate-limit"

export async function adminLogin(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = (formData.get("email") as string) || ""
  const password = formData.get("password") as string

  // Rate limit: 3 admin login attempts per 3 DAYS per email
  const rl = checkRateLimit(`admin-login:${email}`, 3, 3 * 24 * 60 * 60_000)
  if (rl.limited) {
    return { error: "Too many failed attempts. Account locked for 3 days. Contact support." }
  }

  const { data: _data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: "Invalid email or password." }
  }

  const { data: { user: verifiedUser }, error: verifyErr } = await supabase.auth.getUser()
  if (verifyErr || !verifiedUser) return { error: "Session verification failed" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, user_id")
    .eq("user_id", verifiedUser.id)
    .maybeSingle()

  const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()

  if (!role || (role !== "admin" && role !== "super_admin")) {
    await supabase.auth.signOut()
    // Generic error — don't reveal that the account exists but isn't admin
    return { error: "Invalid email or password." }
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
