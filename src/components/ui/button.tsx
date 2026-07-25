"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20 hover:-translate-y-0.5",
        destructive: "bg-danger text-white hover:brightness-110 hover:-translate-y-0.5",
        outline: "border border-border bg-transparent hover:bg-card hover:border-muted hover:-translate-y-0.5",
        secondary: "bg-card text-foreground hover:bg-card-hover border border-border hover:-translate-y-0.5",
        ghost: "hover:bg-card text-muted hover:text-foreground hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-card/80 backdrop-blur-xl border border-border text-foreground hover:bg-card shadow-lg hover:-translate-y-0.5",
        gradient: "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:brightness-110 hover:-translate-y-0.5",
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
