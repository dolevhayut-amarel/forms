"use client"

import { useState, useEffect } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import type { FieldConfig } from "@/lib/types"

interface LocationFieldProps {
  field: FieldConfig
  value: string
  onChange: (value: string) => void
  error?: string
}

export function LocationField({ field, value, onChange, error }: LocationFieldProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_IPINFO_TOKEN
    if (!token || value) return

    const controller = new AbortController()
    fetch(`https://ipinfo.io/json?token=${token}`, {
      signal: controller.signal,
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.loc) {
          onChange(data.loc)
          setStatus("success")
        }
      })
      .catch(() => {})

    return () => controller.abort()
  }, [value, onChange])

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setErrorMsg("הדפדפן לא תומך בשירותי מיקום")
      setStatus("error")
      return
    }

    setLoading(true)
    setErrorMsg("")
    setStatus("idle")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6)
        const lng = position.coords.longitude.toFixed(6)
        onChange(`${lat}, ${lng}`)
        setStatus("success")
        setLoading(false)
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "הרשאת מיקום נדחתה. אנא אפשר/י הרשאות מיקום בדפדפן.",
          2: "לא ניתן לקבל מיקום כרגע.",
          3: "פג תוקף הבקשה. נסה/י שוב.",
        }
        setErrorMsg(messages[err.code] ?? "שגיאה בקבלת מיקום")
        setStatus("error")
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium text-neutral-800 leading-snug">
        {field.label}
        {field.required && (
          <span className="text-red-500 ms-1 font-bold">*</span>
        )}
      </Label>

      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={value}
          placeholder="לחץ/י על 'קבל מיקום'"
          className={`
            flex-1 h-12 rounded-xl border px-4 text-base bg-neutral-50 text-neutral-700
            focus:outline-none
            ${error ? "border-red-400" : "border-input"}
          `}
          dir="ltr"
        />
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={loading}
          className={`
            h-12 px-4 rounded-xl font-medium text-sm whitespace-nowrap
            flex items-center gap-2 transition-colors
            ${status === "success"
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            }
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {loading ? "מאתר..." : status === "success" ? "עודכן" : "קבל מיקום"}
        </button>
      </div>

      {errorMsg && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

      {error && !errorMsg && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      <p className="text-xs text-neutral-400">יש לאשר הרשאת מיקום בדפדפן</p>
    </div>
  )
}
