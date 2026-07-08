import type { UserRole } from "./admin-types"

export function canAccessAdmin(user?: { role: string }): boolean {
  if (!user) return false
  return user.role === "admin" || user.role === "super_admin"
}

export function isSuperAdmin(user?: { role: string }): boolean {
  if (!user) return false
  return user.role === "super_admin"
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

export const roleColors: Record<UserRole, string> = {
  user: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  super_admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

export const planColors: Record<string, string> = {
  free: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  starter: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pro: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  agency: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  enterprise: "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

export const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  suspended: "bg-danger/10 text-danger border-danger/20",
  inactive: "bg-muted/10 text-muted border-muted/20",
  completed: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  failed: "bg-danger/10 text-danger border-danger/20",
  refunded: "bg-info/10 text-info border-info/20",
  published: "bg-success/10 text-success border-success/20",
  draft: "bg-warning/10 text-warning border-warning/20",
}
