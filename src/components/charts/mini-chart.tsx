"use client"

import { LineChart, Line, ResponsiveContainer } from "recharts"

interface MiniChartProps {
  data: { name: string; value: number }[]
  color?: string
  height?: number
}

export function MiniChart({ data, color = "#6366f1", height = 40 }: MiniChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
