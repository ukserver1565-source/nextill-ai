"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthProvider"

interface BackButtonProps {
  fallbackHref?: string
  className?: string
}

export function BackButton({ fallbackHref, className }: BackButtonProps) {
  const router = useRouter()
  const { profile } = useAuth()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref || (profile ? "/dashboard" : "/"))
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted hover:text-foreground transition-colors ${className || ""}`}
    >
      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
      Back
    </button>
  )
}
