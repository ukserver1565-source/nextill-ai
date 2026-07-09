import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/20",
        success: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
        warning: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
        danger: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
        info: "bg-[#4CC9F0]/10 text-[#4CC9F0] border border-[#4CC9F0]/20",
        outline: "text-white border border-[rgba(255,255,255,0.06)]",
        ghost: "bg-[#151C2E] text-[#A7B0C0]",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean
}

const dotColorMap: Record<string, string> = {
  default: "bg-[#6D5EF5]",
  success: "bg-[#22C55E]",
  warning: "bg-[#F59E0B]",
  danger: "bg-[#EF4444]",
  info: "bg-[#4CC9F0]",
  outline: "bg-white",
  ghost: "bg-[#A7B0C0]",
}

function Badge({ className, variant, size, showDot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {showDot && (
        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dotColorMap[variant || "default"])} />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
