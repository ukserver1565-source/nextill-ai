"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"

type ChartView = "area" | "bar"

interface TooltipPayloadEntry {
  name: string
  value: number
  color: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 text-sm shadow-xl">
      <p className="text-muted text-xs mb-1">{label}</p>
      {(payload as TooltipPayloadEntry[]).map((entry, i) => (
        <p key={i} className="flex items-center gap-2 text-xs font-medium">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

interface TrafficChartProps {
  data: { name: string; organic: number; direct: number; referral: number }[]
  className?: string
}

export function TrafficChart({ data, className }: TrafficChartProps) {
  const [view, setView] = useState<ChartView>("area")

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-card border border-border">
          <button
            onClick={() => setView("area")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              view === "area"
                ? "bg-primary/20 text-primary"
                : "text-muted hover:text-foreground"
            )}
          >
            Area
          </button>
          <button
            onClick={() => setView("bar")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              view === "bar"
                ? "bg-primary/20 text-primary"
                : "text-muted hover:text-foreground"
            )}
          >
            Bar
          </button>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          {view === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="organic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="direct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="referral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#9ca3af" }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="organic"
                stroke="#6366f1"
                fill="url(#organic)"
                strokeWidth={2}
                name="Organic"
              />
              <Area
                type="monotone"
                dataKey="direct"
                stroke="#06b6d4"
                fill="url(#direct)"
                strokeWidth={2}
                name="Direct"
              />
              <Area
                type="monotone"
                dataKey="referral"
                stroke="#10b981"
                fill="url(#referral)"
                strokeWidth={2}
                name="Referral"
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#9ca3af" }}
                iconType="circle"
              />
              <Bar
                dataKey="organic"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                name="Organic"
              />
              <Bar
                dataKey="direct"
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
                name="Direct"
              />
              <Bar
                dataKey="referral"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Referral"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
