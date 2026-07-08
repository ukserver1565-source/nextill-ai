export type UserRole = "user" | "admin" | "super_admin"
export type UserPlan = "free" | "starter" | "pro" | "agency" | "enterprise"
export type UserStatus = "active" | "suspended" | "inactive"
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"
export type BlogStatus = "draft" | "published"
export type CouponType = "percentage" | "fixed"
export type ToolName =
  | "ai_writer"
  | "ai_humanizer"
  | "ai_detector"
  | "plagiarism_checker"
  | "seo_title_generator"
  | "meta_description_generator"
  | "keyword_research"
  | "website_audit"
  | "rank_tracker"
  | "backlink_analyzer"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  plan: UserPlan
  status: UserStatus
  credits: number
  creditsUsed: number
  avatar?: string
  createdAt: string
  lastLogin: string
  articlesGenerated: number
}

export interface Payment {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  currency: string
  plan: UserPlan
  status: PaymentStatus
  date: string
  method: string
}

export interface Plan {
  id: string
  name: string
  slug: UserPlan
  price: number
  currency: string
  monthlyCredits: number
  toolAccess: ToolName[]
  maxProjects: number
  maxUsers: number
  priority: "low" | "medium" | "high" | "urgent"
  enabled: boolean
  description: string
}

export interface ToolSetting {
  id: string
  name: string
  slug: ToolName
  enabled: boolean
  guestLimit: number
  freeLimit: number
  premiumLimit: number
  creditsCost: number
  model: string
  promptTemplate: string
  usageCount: number
}

export interface AiModel {
  id: string
  name: string
  provider: string
  enabled: boolean
  apiKeyPlaceholder: string
  defaultFor: ToolName[]
  fallback: boolean
  usageCount: number
  costPerRequest: number
  monthlyCost: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  seoTitle: string
  metaDescription: string
  status: BlogStatus
  author: string
  createdAt: string
  updatedAt: string
}

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  expiryDate: string
  usageLimit: number
  usageCount: number
  active: boolean
}

export interface SecurityLog {
  id: string
  type: "login" | "failed_login" | "admin_action"
  userId?: string
  userName?: string
  action: string
  ipHash: string
  userAgent: string
  timestamp: string
}

export interface SiteSettings {
  siteName: string
  logo: string
  favicon: string
  primaryColor: string
  freeDailyLimits: number
  maintenanceMode: boolean
  maintenanceMessage: string
  contactEmail: string
  socialLinks: { platform: string; url: string }[]
  seoMetaDefaults: { title: string; description: string }
}

export interface SystemHealthMetric {
  label: string
  status: "operational" | "degraded" | "down"
  uptime: number
  lastChecked: string
  responseTime: number
}

export interface CreditLog {
  id: string
  userId: string
  userName: string
  amount: number
  type: "added" | "removed" | "used"
  tool?: ToolName
  description: string
  createdAt: string
}
