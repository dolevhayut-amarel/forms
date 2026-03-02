"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { FormStat } from "@/lib/analytics"

const chartConfig = {
  total: { label: "סה״כ תגובות", color: "hsl(221 83% 53%)" },
}

interface Props {
  data: FormStat[]
}

export function FormsBarChart({ data }: Props) {
  const display = data.slice(0, 8) // top 8 forms

  if (display.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center text-neutral-400 text-sm">
        אין נתונים
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={display}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#a3a3a3" }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#525252" }}
            width={120}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={{ fill: "#f5f5f5" }}
          />
          <Bar dataKey="total" name="תגובות" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {display.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.form_type === "attendance" ? "#f97316" : "hsl(221 83% 53%)"}
                fillOpacity={entry.published ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
