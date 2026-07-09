"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  fallback?: string
  src?: string
  alt?: string
  size?: "sm" | "default" | "lg" | "xl"
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  default: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, fallback, src, alt, size = "default", ...props }, ref) => {
    const [error, setError] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0",
          "bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20",
          "ring-2 ring-[rgba(255,255,255,0.06)] ring-offset-2 ring-offset-[#090B16]",
          "shadow-lg shadow-[#6D5EF5]/10",
          sizeMap[size],
          className
        )}
        {...props}
      >
        {src && !error ? (
          <img
            src={src}
            alt={alt || ""}
            className="h-full w-full object-cover"
            onError={() => setError(true)}
          />
        ) : fallback ? (
          <span className="font-medium text-white/80 select-none">
            {fallback.slice(0, 2).toUpperCase()}
          </span>
        ) : null}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
