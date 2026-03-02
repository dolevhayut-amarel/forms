"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { TimeSeriesPoint } from "@/lib/analytics"

const chartConfig = {
  תגובות: { label: "תגובות", color: "hsl(221 83% 53%)" },
}

interface Props {
  data: TimeSeriesPoint[]
}

export function ResponsesOverTimeChart({ data }: Props) {
  const hasData = data.some((d) => d.תגובות > 0)

  if (!hasData) {
    return (
      <div className="h-52 flex items-center justify-center text-neutral-400 text-sm">
        אין נתונים לתקופה זו
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="fillResponses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#a3a3a3" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#a3a3a3" }}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="תגובות"
            stroke="hsl(221 83% 53%)"
            strokeWidth={2}
            fill="url(#fillResponses)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
