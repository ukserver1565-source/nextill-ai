"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  fallback?: string
  label?: string
}

export function BackButton({ fallback = "/dashboard", label = "Back" }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] border border-white/[0.06] hover:border-white/[0.12] transition-all"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}
