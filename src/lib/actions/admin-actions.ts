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
import {
  updateUserSchema, createPlanSchema, updatePlanSchema,
  createBlogPostSchema, updateBlogPostSchema, createCouponSchema,
  addCreditsSchema, updateSettingsSchema, updateToolSchema,
  updateModelSchema,
} from "@/lib/validation/admin-schemas"

export async function updateUser(formData: FormData) {
  const id = formData.get("id") as string
  const raw = Object.fromEntries(formData.entries())
  delete raw.id
  const parsed = updateUserSchema.parse(raw)
  await profileRepo.update(id, parsed)
  revalidatePath("/admin/users")
}

export async function deleteUser(formData: FormData) {
  const id = formData.get("id") as string
  await profileRepo.delete(id)
  revalidatePath("/admin/users")
}

export async function createPlan(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = createPlanSchema.parse({
    ...raw,
    price: Number(raw.price),
    monthly_credits: Number(raw.monthly_credits),
    max_projects: Number(raw.max_projects),
    max_users: Number(raw.max_users),
  })
  await planRepo.create(parsed)
  revalidatePath("/admin/plans")
}

export async function updatePlan(formData: FormData) {
  const id = formData.get("id") as string
  const raw = Object.fromEntries(formData.entries())
  delete raw.id
  const parsed = updatePlanSchema.parse(raw)
  await planRepo.update(id, parsed)
  revalidatePath("/admin/plans")
}

export async function deletePlan(formData: FormData) {
  const id = formData.get("id") as string
  await planRepo.delete(id)
  revalidatePath("/admin/plans")
}

export async function createBlogPost(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
    const parsed = createBlogPostSchema.parse(raw)
  await blogRepo.create({
    ...parsed,
    content: parsed.content ?? null,
    seo_title: parsed.seo_title ?? null,
    meta_description: parsed.meta_description ?? null,
    image_url: parsed.image_url ?? null,
  })
  revalidatePath("/admin/blog")
}

export async function updateBlogPost(formData: FormData) {
  const id = formData.get("id") as string
  const raw = Object.fromEntries(formData.entries())
  delete raw.id
  const parsed = updateBlogPostSchema.parse(raw)
  await blogRepo.update(id, parsed)
  revalidatePath("/admin/blog")
}

export async function deleteBlogPost(formData: FormData) {
  const id = formData.get("id") as string
  await blogRepo.delete(id)
  revalidatePath("/admin/blog")
}

export async function createCoupon(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = createCouponSchema.parse({
    ...raw,
    value: Number(raw.value),
    usage_limit: Number(raw.usage_limit),
  })
  await couponRepo.create(parsed)
  revalidatePath("/admin/coupons")
}

export async function toggleCoupon(formData: FormData) {
  const id = formData.get("id") as string
  const active = formData.get("active") === "true"
  await couponRepo.update(id, { active })
  revalidatePath("/admin/coupons")
}

export async function addCredits(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const { userId, amount, description } = addCreditsSchema.parse({
    ...raw,
    amount: Number(raw.amount),
  })
  await creditRepo.add(userId, amount, description || "Admin adjustment")
  revalidatePath("/admin/credits")
  revalidatePath("/admin/users")
}

export async function updateSettings(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = updateSettingsSchema.parse(raw)
  await settingsRepo.update(parsed)
  revalidatePath("/admin/settings")
}

export async function updateTool(formData: FormData) {
  const id = formData.get("id") as string
  const raw = Object.fromEntries(formData.entries())
  delete raw.id
  const parsed = updateToolSchema.parse(raw)
  await toolRepo.update(id, parsed)
  revalidatePath("/admin/tools")
}

export async function updateModel(formData: FormData) {
  const id = formData.get("id") as string
  const raw = Object.fromEntries(formData.entries())
  delete raw.id
  const parsed = updateModelSchema.parse(raw)
  await modelRepo.update(id, parsed)
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
