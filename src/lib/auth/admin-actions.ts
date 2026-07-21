"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkRateLimit } from "@/lib/security/rate-limit"

export async function adminLogin(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = (formData.get("email") as string) || ""
  const password = formData.get("password") as string

  // Rate limit: 5 admin login attempts per 15 minutes per email
  const rl = checkRateLimit(`admin-login:${email}`, 5, 15 * 60_000)
  if (rl.limited) {
    return { error: "Too many login attempts. Please try again later." }
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
    return { error: "Not authorized. Admin access required." }
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
