"use client"

import { useId } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AttendanceDateFilterProps {
  selectedDate: string // YYYY-MM-DD
  formId: string
}

export function AttendanceDateFilter({
  selectedDate,
  formId,
}: AttendanceDateFilterProps) {
  const router = useRouter()
  const today = new Date().toISOString().split("T")[0]
  const isToday = selectedDate === today

  function navigate(days: number) {
    const d = new Date(selectedDate + "T12:00:00")
    d.setDate(d.getDate() + days)
    const iso = d.toISOString().split("T")[0]
    router.push(`/forms/${formId}/attendance?date=${iso}`)
  }

  function goToday() {
    router.push(`/forms/${formId}/attendance`)
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    router.push(`/forms/${formId}/attendance?date=${e.target.value}`)
  }

  const dateInputId = useId()

  return (
    <fieldset className="flex items-center gap-2 border-0 p-0 m-0 min-w-0" aria-labelledby="date-filter-label">
      <legend id="date-filter-label" className="sr-only">בחירת תאריך</legend>
      {/* Prev day */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(-1)}
        aria-label="יום קודם"
        className="h-8 w-8 min-w-[44px] min-h-[44px] rounded-xl"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Button>

      {/* Date picker */}
      <div className="relative flex items-center">
        <label htmlFor={dateInputId} className="sr-only">
          תאריך לצפייה
        </label>
        <CalendarDays className="absolute start-2.5 h-3.5 w-3.5 text-neutral-400 pointer-events-none" aria-hidden />
        <input
          id={dateInputId}
          type="date"
          value={selectedDate}
          max={today}
          onChange={handleDateChange}
          aria-label="תאריך לצפייה"
          className="h-8 ps-8 pe-3 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent min-h-[44px]"
          dir="ltr"
        />
      </div>

      {/* Next day */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(1)}
        disabled={isToday}
        aria-label={isToday ? "היום — לא ניתן לעבור ליום הבא" : "יום הבא"}
        className="h-8 w-8 min-w-[44px] min-h-[44px] rounded-xl"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </Button>

      {/* Today shortcut */}
      {!isToday && (
        <Button
          variant="outline"
          size="sm"
          onClick={goToday}
          aria-label="עבור להיום"
          className="h-8 text-xs rounded-xl min-h-[44px]"
        >
          היום
        </Button>
      )}
    </fieldset>
  )
}
