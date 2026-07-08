"use client"

import { useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface AdminModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export function AdminModal({ open, onClose, title, children, size = "md" }: AdminModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, handleKeyDown])

  if (!open) return null

  const sizeClasses = {
    sm: "max-w-sm sm:max-w-md",
    md: "max-w-sm sm:max-w-lg",
    lg: "max-w-xl sm:max-w-2xl",
    xl: "max-w-2xl sm:max-w-4xl",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${sizeClasses[size]} max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-lg sm:rounded-xl border border-white/10 bg-[#0a0a1a] p-4 sm:p-6 shadow-2xl`}
      >
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-white truncate">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0 text-gray-400 hover:bg-white/10 hover:text-white shrink-0"
          >
            &#x2715;
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
