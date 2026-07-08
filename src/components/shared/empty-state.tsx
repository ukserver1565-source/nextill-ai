"use client"

import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There are no items to display yet.",
  action,
}: {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-muted/10 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted mb-6 max-w-md">{description}</p>
      {action}
    </div>
  )
}
