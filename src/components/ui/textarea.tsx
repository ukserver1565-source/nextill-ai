import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#090B16]/60 px-3 py-2 text-sm text-white placeholder:text-[#A7B0C0] backdrop-blur-xl transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/40 focus:border-[#6D5EF5]/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
