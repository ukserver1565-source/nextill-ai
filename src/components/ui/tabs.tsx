"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs components must be used within <Tabs />")
  return ctx
}

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Tabs = ({ defaultValue, value: controlledValue, onValueChange, children, className }: TabsProps) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? "")
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue
  const change = React.useCallback(
    (v: string) => {
      if (!isControlled) setUncontrolledValue(v)
      onValueChange?.(v)
    },
    [isControlled, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ value, onValueChange: change }}>
      <div className={cn(className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}
Tabs.displayName = "Tabs"

type TabsListProps = React.HTMLAttributes<HTMLDivElement>

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useTabsContext()
    const listRef = React.useRef<HTMLDivElement | null>(null)
    const [indicatorStyle, setIndicatorStyle] = React.useState<{ left: number; width: number }>({ left: 0, width: 0 })

    React.useEffect(() => {
      const el = listRef.current
      if (!el) return
      const activeTrigger = el.querySelector<HTMLButtonElement>("[data-state=active]")
      if (activeTrigger) {
        const parentRect = el.getBoundingClientRect()
        const rect = activeTrigger.getBoundingClientRect()
        setIndicatorStyle({ left: rect.left - parentRect.left, width: rect.width })
      } else {
        setIndicatorStyle({ left: 0, width: 0 })
      }
    }, [ctx.value, children])

    return (
      <div
        ref={(node) => {
          listRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          "relative inline-flex h-10 items-center rounded-xl bg-white/[0.04] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-1 gap-1",
          className
        )}
        role="tablist"
        {...props}
      >
        {children}
        <div
          className="absolute bottom-1 top-1 rounded-lg bg-white/[0.06] transition-all duration-300 ease-out pointer-events-none"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      </div>
    )
  }
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = useTabsContext()
    const isActive = ctx.value === value

    return (
      <button
        ref={ref}
        role="tab"
        data-state={isActive ? "active" : "inactive"}
        onClick={() => ctx.onValueChange(value)}
        className={cn(
          "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "text-white"
            : "text-[#A7B0C0] hover:text-white",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = useTabsContext()
    if (ctx.value !== value) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn("mt-2 ring-offset-[#090B16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5EF5]/40 focus-visible:ring-offset-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
