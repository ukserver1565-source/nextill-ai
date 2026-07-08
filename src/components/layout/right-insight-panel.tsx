"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Lightbulb, Sparkles, Zap, Bell, Clock, FileText,
  ChevronRight, TrendingUp, AlertTriangle, CheckCircle,
  X, PanelRightClose, PanelRight,
} from "lucide-react"

interface RightInsightPanelProps {
  open?: boolean
  onToggle?: () => void
}

const tips: { icon: React.ElementType; text: string; type: "tip" | "warning" | "success" }[] = [
  { icon: Lightbulb, text: "Add more internal links to improve SEO structure", type: "tip" },
  { icon: AlertTriangle, text: "3 articles have high AI detection risk", type: "warning" },
  { icon: TrendingUp, text: "Your keyword rankings improved 12% this week", type: "success" },
  { icon: Sparkles, text: "Try the new Content Optimizer for better scores", type: "tip" },
]

const recentFiles = [
  { name: "SEO Guide 2026", time: "2 min ago", icon: FileText },
  { name: "Product Launch Post", time: "15 min ago", icon: FileText },
  { name: "Weekly Newsletter", time: "1 hour ago", icon: FileText },
  { name: "Case Study Draft", time: "3 hours ago", icon: FileText },
]

export function RightInsightPanel({ open = true, onToggle }: RightInsightPanelProps) {
  const [showAllTips, setShowAllTips] = useState(false)
  const displayTips = showAllTips ? tips : tips.slice(0, 2)

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="h-full border-l border-border bg-background/50 flex flex-col shrink-0 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 h-[--topbar-height] border-b border-border shrink-0">
            <h2 className="text-sm font-semibold">Insights</h2>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>

          <ScrollArea className="flex-1 p-4 space-y-5">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-accent" />
                  Today's Activity
                </h3>
                <Badge variant="info" size="sm">Live</Badge>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Articles Written", value: "12", change: "+3" },
                  { label: "Words Generated", value: "8,450", change: "+12%" },
                  { label: "AI Requests", value: "247", change: "+8%" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-muted">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{item.value}</span>
                      <span className="text-[10px] text-success font-medium">{item.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3 text-warning" />
                  AI Suggestions
                </h3>
                <button
                  onClick={() => setShowAllTips(!showAllTips)}
                  className="text-[10px] text-primary hover:underline"
                >
                  {showAllTips ? "Less" : "All"}
                </button>
              </div>
              <div className="space-y-2">
                {displayTips.map((tip, i) => {
                  const Icon = tip.icon
                  const typeStyles: Record<string, string> = {
                    tip: "bg-primary/5 border-primary/20 text-primary-light",
                    warning: "bg-warning/5 border-warning/20 text-warning",
                    success: "bg-success/5 border-success/20 text-success",
                  }
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2.5 p-2.5 rounded-lg border",
                        typeStyles[tip.type as keyof typeof typeStyles]
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-snug">{tip.text}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-3">
                <Clock className="w-3 h-3" />
                Recent Files
              </h3>
              <div className="space-y-1">
                {recentFiles.map((file, i) => {
                  const Icon = file.icon
                  return (
                    <button
                      key={i}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-card transition-colors text-left"
                    >
                      <Icon className="w-3.5 h-3.5 text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <p className="text-[10px] text-muted">{file.time}</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-muted shrink-0" />
                    </button>
                  )
                })}
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-3">
                <Bell className="w-3 h-3" />
                Notifications
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-success/5 border border-success/20">
                  <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-medium">Weekly SEO Report Ready</p>
                    <p className="text-[10px] text-muted">10 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-medium">New AI Model Available</p>
                    <p className="text-[10px] text-muted">1 hour ago</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                System Status
              </h3>
              <div className="glass-card p-3 rounded-lg space-y-2">
                {[
                  { label: "AI Engine", status: "Operational", color: "bg-success" },
                  { label: "Database", status: "Operational", color: "bg-success" },
                  { label: "API", status: "Degraded", color: "bg-warning" },
                ].map((sys) => (
                  <div key={sys.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted">{sys.label}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full", sys.color)} />
                      <span className="text-[10px] font-medium">{sys.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollArea>
        </motion.aside>
      ) : (
        <button
          onClick={onToggle}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-l-lg bg-card border border-border border-r-0 text-muted hover:text-foreground transition-colors z-30"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      )}
    </AnimatePresence>
  )
}
