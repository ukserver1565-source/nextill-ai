"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5EF5]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090B16] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#6D5EF5] text-white hover:brightness-110 shadow-lg shadow-[#6D5EF5]/20 hover:-translate-y-0.5",
        destructive: "bg-[#EF4444] text-white hover:brightness-110 hover:-translate-y-0.5",
        outline: "border border-[rgba(255,255,255,0.06)] bg-transparent hover:bg-[#151C2E] hover:border-[#A7B0C0] hover:-translate-y-0.5",
        secondary: "bg-[#151C2E] text-white hover:bg-[#151C2E]/80 border border-[rgba(255,255,255,0.06)] hover:-translate-y-0.5",
        ghost: "hover:bg-[#151C2E] text-[#A7B0C0] hover:text-white hover:-translate-y-0.5",
        link: "text-[#6D5EF5] underline-offset-4 hover:underline",
        glass: "bg-white/[0.04] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] text-white hover:bg-white/[0.08] shadow-lg hover:-translate-y-0.5",
        gradient: "bg-gradient-to-r from-[#6D5EF5] to-[#4CC9F0] text-white shadow-lg shadow-[#6D5EF5]/20 hover:brightness-110 hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        xl: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
