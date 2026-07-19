"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function adminLogin(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = (formData.get("email") as string) || ""
  const password = formData.get("password") as string

  const { data: _data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    // Provide more helpful error messages for common issues
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Invalid email or password. Please check your credentials." }
    }
    if (error.message.includes("API key") || error.message.includes("invalid")) {
      return { error: "Authentication service error. Please contact the administrator to verify the Supabase configuration." }
    }
    return { error: error.message }
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
