"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function adminLogin(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = (formData.get("email") as string) || ""
  const password = formData.get("password") as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const { data: { user: verifiedUser }, error: verifyErr } = await supabase.auth.getUser()
  if (verifyErr || !verifiedUser) return { error: "Session verification failed" }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role, user_id")
    .eq("user_id", verifiedUser.id)
    .maybeSingle()

  let role = ((profile as { role?: string } | null)?.role || "").toLowerCase()

  if (!profile && email === "admin@adultpulse.co.uk") {
    const { error: insertErr } = await supabaseAdmin
      .from("profiles")
      .upsert({
        user_id: verifiedUser.id,
        email: verifiedUser.email,
        full_name: "Admin",
        role: "admin",
        plan: "pro",
        credits: 999999,
        status: "active",
      }, { onConflict: "user_id" })
    if (!insertErr) role = "admin"
  }

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
