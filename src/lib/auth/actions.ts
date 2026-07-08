"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const { data: { user: verifiedUser }, error: verifyErr } = await supabase.auth.getUser()
  if (verifyErr || !verifiedUser) return { error: "Failed to verify session. Please try again." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, user_id, full_name")
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

  revalidatePath("/", "layout")

  if (role === "admin" || role === "super_admin") {
    return { redirect: "/admin" }
  }

  return { redirect: "/dashboard" }
}

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("full_name") as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) return { error: error.message }

  if (data?.session && data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle()

    const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
    revalidatePath("/", "layout")

    if (role === "admin" || role === "super_admin") {
      return { redirect: "/admin" }
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
