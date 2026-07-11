"use client"

import dynamic from "next/dynamic"

const NavigationProgress = dynamic(
  () => import("@/components/layout/navigation-progress").then((m) => ({ default: m.NavigationProgress })),
  { ssr: false }
)

export function NavigationProgressWrapper() {
  return <NavigationProgress />
}
