"use client"

import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted mt-1">Manage your subscription and billing information.</p>
      </div>
      <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <CreditCard className="w-12 h-12 text-muted mb-4" />
        <h3 className="text-lg font-semibold mb-1">Free Plan</h3>
        <p className="text-sm text-muted max-w-md mb-4">
          You are currently on the Free plan. Upgrade to unlock premium AI tools and higher credit limits.
        </p>
        <Button variant="gradient">View Plans</Button>
      </div>
    </div>
  )
}
