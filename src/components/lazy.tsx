"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

function loadMetricCards() {
  return import("@/components/dashboard/metric-cards").then((mod) => ({ default: mod.MetricCards }))
}

function loadAiToolCards() {
  return import("@/components/dashboard/ai-tool-cards").then((mod) => ({ default: mod.AIToolCards }))
}

function loadCommandCenter() {
  return import("@/components/dashboard/command-center").then((mod) => ({ default: mod.CommandCenter }))
}

function loadQuickActions() {
  return import("@/components/dashboard/quick-actions").then((mod) => ({ default: mod.QuickActions }))
}

export const LazyMetricCards = dynamic(loadMetricCards, {
  loading: () => <Skeleton className="h-32 w-full rounded-xl" />,
})

export const LazyAiToolCards = dynamic(loadAiToolCards, {
  loading: () => <Skeleton className="h-48 w-full rounded-xl" />,
})

export const LazyCommandCenter = dynamic(loadCommandCenter, {
  loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  ssr: false,
})

export const LazyQuickActions = dynamic(loadQuickActions, {
  loading: () => <Skeleton className="h-40 w-full rounded-xl" />,
})
