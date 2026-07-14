"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, AlertCircle, Loader2, HelpCircle } from "lucide-react"
import type { DomainOverview } from "@/lib/domain-intelligence/domain-intelligence.types"

interface SummaryCardsProps {
  overview: DomainOverview | null
  loading: boolean
}

function formatValue(v: number | string | null): string {
  if (v === null || v === undefined) return "—"
  if (typeof v === "string") return v
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return v.toLocaleString()
}

function ChangeBadge({ change }: { change: number | null }) {
  if (change === null || change === undefined) return null
  const isUp = change > 0
  const isDown = change < 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded ${
      isUp ? "text-emerald-400 bg-emerald-500/10" :
      isDown ? "text-red-400 bg-red-500/10" :
      "text-gray-400 bg-white/5"
    }`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {isUp ? "+" : ""}{change.toFixed(1)}%
    </span>
  )
}

function StatusIndicator({ status }: { status: string }) {
  switch (status) {
    case "loading":
      return <Loader2 className="w-4 h-4 text-[#6D5EF5] animate-spin" />
    case "unavailable":
      return <span className="text-[10px] text-[#A7B0C0] bg-white/5 px-1.5 py-0.5 rounded">Unavailable</span>
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-400" />
    default:
      return null
  }
}

export function SummaryCards({ overview, loading }: SummaryCardsProps) {
  if (loading) {
    const skeletonCards = Array.from({ length: 11 })
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {skeletonCards.map((_, i) => (
          <div key={i} className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-4">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-7 w-16 mb-2" />
            <div className="skeleton h-3 w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (!overview) return null

  const cards = Object.values(overview)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-4 relative group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#A7B0C0] font-medium uppercase tracking-wider">{card.label}</span>
            <div className="flex items-center gap-1">
              <StatusIndicator status={card.status} />
              {card.tooltip && (
                <div className="relative group/tip">
                  <HelpCircle className="w-3 h-3 text-[#A7B0C0]/50 cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 px-3 py-2 text-xs text-white bg-[#111827]/95 border border-white/10 rounded-lg shadow-xl whitespace-nowrap opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50">
                    {card.tooltip}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">
              {card.status === "loading" ? (
                <span className="inline-flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin" />...</span>
              ) : card.status === "unavailable" ? (
                <span className="text-sm text-[#A7B0C0]">—</span>
              ) : (
                formatValue(card.value)
              )}
            </span>
            <ChangeBadge change={card.change} />
          </div>
          {card.source && (
            <span className="text-[9px] text-[#A7B0C0]/60 mt-1 block">Source: {card.source}</span>
          )}
        </motion.div>
      ))}
    </div>
  )
}
