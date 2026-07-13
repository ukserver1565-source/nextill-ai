"use server"

import { revalidatePath } from "next/cache"
import { profileRepo } from "@/lib/repositories/profile-repo"
import { planRepo } from "@/lib/repositories/plan-repo"
import { blogRepo } from "@/lib/repositories/blog-repo"
import { couponRepo } from "@/lib/repositories/coupon-repo"
import { creditRepo } from "@/lib/repositories/credit-repo"
import { settingsRepo } from "@/lib/repositories/settings-repo"
import { toolRepo } from "@/lib/repositories/tool-repo"
import { modelRepo } from "@/lib/repositories/model-repo"
import { projectRepo } from "@/lib/repositories/project-repo"
import { contactRepo } from "@/lib/repositories/contact-repo"

export async function updateUser(formData: FormData) {
  const id = formData.get("id") as string
  const updates: Record<string, unknown> = {}
  const name = formData.get("full_name") as string | null
  const email = formData.get("email") as string | null
  const role = formData.get("role") as string | null
  const plan = formData.get("plan") as string | null
  const status = formData.get("status") as string | null
  if (name !== null) updates.full_name = name
  if (email !== null) updates.email = email
  if (role !== null) updates.role = role
  if (plan !== null) updates.plan = plan
  if (status !== null) updates.status = status
  await profileRepo.update(id, updates)
  revalidatePath("/admin/users")
}

export async function deleteUser(formData: FormData) {
  const id = formData.get("id") as string
  await profileRepo.delete(id)
  revalidatePath("/admin/users")
}

export async function createPlan(formData: FormData) {
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const price_monthly = Number(formData.get("price_monthly") || formData.get("price") || 0)
  const credits = Number(formData.get("credits") || formData.get("monthly_credits") || 0)
  const features = JSON.parse((formData.get("features") as string) || "[]")
  await planRepo.create({ name, slug, price_monthly, credits, features })
  revalidatePath("/admin/plans")
}

export async function updatePlan(formData: FormData) {
  const id = formData.get("id") as string
  const updates: Record<string, unknown> = {}
  const name = formData.get("name") as string | null
  const slug = formData.get("slug") as string | null
  const price_monthly = formData.get("price_monthly") ? Number(formData.get("price_monthly")) : formData.get("price") ? Number(formData.get("price")) : null
  const credits = formData.get("credits") ? Number(formData.get("credits")) : formData.get("monthly_credits") ? Number(formData.get("monthly_credits")) : null
  const is_active = formData.get("is_active") !== null ? formData.get("is_active") === "true" : formData.get("enabled") !== null ? formData.get("enabled") === "true" : null
  if (name !== null) updates.name = name
  if (slug !== null) updates.slug = slug
  if (price_monthly !== null) updates.price_monthly = price_monthly
  if (credits !== null) updates.credits = credits
  if (is_active !== null) updates.is_active = is_active
  await planRepo.update(id, updates)
  revalidatePath("/admin/plans")
}

export async function deletePlan(formData: FormData) {
  const id = formData.get("id") as string
  await planRepo.delete(id)
  revalidatePath("/admin/plans")
}

export async function createBlogPost(formData: FormData) {
  const title = formData.get("title") as string
  const slug = formData.get("slug") as string
  const post: Record<string, string> = { title, slug }
  for (const [key, value] of formData.entries()) {
    if (key === "id" || key === "title" || key === "slug") continue
    if (value) post[key] = value as string
  }
  await blogRepo.create(post as any)
  revalidatePath("/admin/blog")
}

export async function updateBlogPost(formData: FormData) {
  const id = formData.get("id") as string
  const updates: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key === "id") continue
    updates[key] = value === "" ? undefined : value
  }
  await blogRepo.update(id, updates)
  revalidatePath("/admin/blog")
}

export async function deleteBlogPost(formData: FormData) {
  const id = formData.get("id") as string
  await blogRepo.delete(id)
  revalidatePath("/admin/blog")
}

export async function createCoupon(formData: FormData) {
  const code = formData.get("code") as string
  const discount_type = (formData.get("discount_type") || formData.get("type") || "percentage") as "percentage" | "fixed"
  const discount_value = Number(formData.get("discount_value") || formData.get("value") || 0)
  const usage_limit = Number(formData.get("usage_limit") || 0)
  const expires_at = (formData.get("expires_at") || formData.get("expiry_date")) as string | null
  const is_active = formData.get("is_active") !== null ? formData.get("is_active") === "true" : formData.get("active") !== null ? formData.get("active") === "true" : true
  await couponRepo.create({ code, discount_type, discount_value, usage_limit, expires_at: expires_at || undefined, is_active })
  revalidatePath("/admin/coupons")
}

export async function toggleCoupon(formData: FormData) {
  const id = formData.get("id") as string
  const is_active = formData.get("is_active") === "true" || formData.get("active") === "true"
  await couponRepo.update(id, { is_active })
  revalidatePath("/admin/coupons")
}

export async function addCredits(formData: FormData) {
  const userId = formData.get("userId") as string
  const amount = Number(formData.get("amount"))
  const description = formData.get("description") as string | null
  await creditRepo.add(userId, amount, description || "Admin adjustment")
  revalidatePath("/admin/credits")
  revalidatePath("/admin/users")
}

export async function updateSettings(formData: FormData) {
  const entries: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    entries[key] = value
  }
  for (const [key, value] of Object.entries(entries)) {
    await settingsRepo.set(key, value)
  }
  revalidatePath("/admin/settings")
}

export async function updateTool(formData: FormData) {
  const id = formData.get("id") as string
  const updates: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key === "id") continue
    if (key === "is_enabled" || key === "enabled") updates.is_enabled = value === "true"
    else if (key === "credits_cost") updates.credits_cost = Number(value)
    else updates[key] = value
  }
  await toolRepo.update(id, updates)
  revalidatePath("/admin/tools")
}

export async function updateModel(formData: FormData) {
  const id = formData.get("id") as string
  const updates: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key === "id") continue
    if (key === "is_enabled" || key === "enabled") updates.is_enabled = value === "true"
    else if (key === "is_default") updates.is_default = value === "true"
    else if (key === "cost_input" || key === "cost_output" || key === "temperature" || key === "max_tokens") updates[key] = Number(value)
    else updates[key] = value
  }
  await modelRepo.update(id, updates)
  revalidatePath("/admin/ai-models")
}

export async function markContactRead(formData: FormData) {
  const id = formData.get("id") as string
  await contactRepo.markAsRead(id)
  revalidatePath("/admin/contact")
}

export async function deleteContact(formData: FormData) {
  const id = formData.get("id") as string
  await contactRepo.delete(id)
  revalidatePath("/admin/contact")
}

export async function deleteProject(formData: FormData) {
  const id = formData.get("id") as string
  await projectRepo.delete(id)
  revalidatePath("/admin/projects")
}
