"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function adminLogin(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = (formData.get("email") as string) || ""
  const password = formData.get("password") as string

  const { data: _data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

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
  return { redirect: "/admin" }
}

export async function adminLogout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  return { redirect: "/admin/login" }
}
