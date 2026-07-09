"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WriterErrorProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function WriterError({ message, onRetry, onDismiss }: WriterErrorProps) {
  return (
    <div className="glass-card rounded-xl p-6 border border-danger/30 bg-danger/5">
      <div className="flex flex-col items-center text-center gap-3">
        <AlertCircle className="w-10 h-10 text-danger" />
        <div>
          <h3 className="text-sm font-semibold text-danger mb-1">Generation Failed</h3>
          <p className="text-xs text-muted max-w-md">{message || "An unexpected error occurred during article generation."}</p>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>Dismiss</Button>
          )}
        </div>
      </div>
    </div>
  )
}
