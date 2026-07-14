"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// Permanent redirect: /keyword-intelligence → /domain-overview
export default function KeywordIntelligenceRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const target = `/domain-overview${params.toString() ? "?" + params.toString() : ""}`
    router.replace(target)
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#6D5EF5] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-[#A7B0C0]">Redirecting to Domain Intelligence...</p>
      </div>
    </div>
  )
}
