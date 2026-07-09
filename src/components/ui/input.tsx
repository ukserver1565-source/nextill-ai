import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)
    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={inputId}
            className="absolute -top-2 left-3 px-1 text-xs font-medium text-[#A7B0C0] bg-[#090B16] z-10"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#090B16]/60 px-3 py-2 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/40 focus:border-[#6D5EF5]/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 backdrop-blur-xl",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
