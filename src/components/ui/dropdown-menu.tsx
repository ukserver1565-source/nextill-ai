"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext() {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) throw new Error("DropdownMenu components must be used within <DropdownMenu />")
  return ctx
}

interface DropdownMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const DropdownMenu = ({ open: controlledOpen, onOpenChange, children }: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const change = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setInternalOpen(v)
      onOpenChange?.(v)
    },
    [isControlled, onOpenChange]
  )

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: change }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}
DropdownMenu.displayName = "DropdownMenu"

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  className?: string
}

const DropdownMenuTrigger = ({ asChild, children, className }: DropdownMenuTriggerProps) => {
  const ctx = useDropdownMenuContext()
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  if (asChild) {
    return React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<{ onClick?: () => void; ref?: React.Ref<unknown> }>, {
          onClick: () => ctx.onOpenChange(!ctx.open),
          ref: triggerRef,
        })
      : <>{children}</>
  }
  return (
    <button ref={triggerRef} type="button" onClick={() => ctx.onOpenChange(!ctx.open)} className={className}>
      {children}
    </button>
  )
}
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end" | "center"
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, children, align = "start", ...props }, ref) => {
    const ctx = useDropdownMenuContext()
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [style, setStyle] = React.useState<React.CSSProperties>({})

    React.useEffect(() => {
      if (ctx.open) {
        const updatePosition = () => {
          const trigger = document.querySelector("[data-dropdown-trigger]")
          if (trigger) {
            const rect = trigger.getBoundingClientRect()
            setStyle({
              position: "fixed",
              top: `${rect.bottom + 4}px`,
              left: align === "end" ? `${rect.right}px` : align === "center" ? `${rect.left + rect.width / 2}px` : `${rect.left}px`,
              transform: align === "end" ? "translateX(-100%)" : align === "center" ? "translateX(-50%)" : undefined,
              minWidth: `${rect.width}px`,
            })
          }
        }
        updatePosition()
      }
    }, [ctx.open, align])

    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
          ctx.onOpenChange(false)
        }
      }
      if (ctx.open) {
        document.addEventListener("mousedown", handleClickOutside)
      }
      return () => document.removeEventListener("mousedown", handleClickOutside)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctx.open])

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") ctx.onOpenChange(false)
      }
      if (ctx.open) {
        document.addEventListener("keydown", handleEscape)
      }
      return () => document.removeEventListener("keydown", handleEscape)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctx.open])

    if (!ctx.open) return null

    return createPortal(
      <div
        ref={(node) => {
          contentRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        style={style}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)]",
          "bg-[#111827]/95 backdrop-blur-2xl shadow-2xl",
          "p-1 transition-all duration-200",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        data-state={ctx.open ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>,
      document.body
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, inset, children, ...props }, ref) => {
    const ctx = useDropdownMenuContext()
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          props.onClick?.(e)
          ctx.onOpenChange(false)
        }}
        className={cn(
          "relative flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white outline-none transition-colors",
          "hover:bg-white/[0.06] hover:text-white",
          "focus-visible:bg-white/[0.06]",
          inset && "pl-8",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mx-1 my-1 h-[1px] bg-[rgba(255,255,255,0.06)]", className)}
      {...props}
    />
  )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-xs font-semibold text-[#A7B0C0]", className)}
      {...props}
    />
  )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
}
