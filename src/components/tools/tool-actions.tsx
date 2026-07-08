"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, Trash2 } from "lucide-react"

interface ToolActionsProps {
  onGenerate: () => void
  onClear?: () => void
  loading?: boolean
  disabled?: boolean
  loadingText?: string
  generateText?: string
}

export function ToolActions({
  onGenerate,
  onClear,
  loading = false,
  disabled = false,
  loadingText = "Processing...",
  generateText = "Generate",
}: ToolActionsProps) {
  return (
    <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 pt-2">
      <Button
        onClick={onGenerate}
        disabled={disabled || loading}
        className="w-full xs:flex-1 gap-2"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {generateText}
          </>
        )}
      </Button>
      {onClear && (
        <Button variant="ghost" size="icon" onClick={onClear} title="Clear" className="self-end xs:self-auto">
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
