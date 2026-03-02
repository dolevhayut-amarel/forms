"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

const RANGES = [
  { label: "7 ימים", value: "7" },
  { label: "14 ימים", value: "14" },
  { label: "30 ימים", value: "30" },
  { label: "90 ימים", value: "90" },
]

export function DateRangeFilter({ current }: { current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setRange(days: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("days", days)
    router.push(`/analytics?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
      {RANGES.map(({ label, value }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => setRange(value)}
          className={`h-7 rounded-lg text-xs font-medium transition-all ${
            current === value
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 hover:bg-transparent"
          }`}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
