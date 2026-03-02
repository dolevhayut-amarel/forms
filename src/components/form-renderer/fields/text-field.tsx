"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { FieldConfig } from "@/lib/types"
import { VALIDATION_PRESETS } from "@/lib/field-validation"

interface TextFieldProps {
  field: FieldConfig
  value: string
  onChange: (value: string) => void
  error?: string
}

export function TextField({ field, value, onChange, error }: TextFieldProps) {
  const isLong = field.label.length > 50 || (field.placeholder ?? "").length > 50
  const validationType = field.validation?.type ?? "none"
  const validationHint =
    validationType !== "none"
      ? VALIDATION_PRESETS[validationType]?.description
      : undefined

  // Use numeric keyboard for numbers_only on mobile
  const inputMode =
    validationType === "numbers_only" || validationType === "id_il"
      ? ("numeric" as const)
      : validationType === "phone_il"
      ? ("tel" as const)
      : ("text" as const)

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium text-neutral-800 leading-snug">
        {field.label}
        {field.required && (
          <span className="text-red-500 ms-1 font-bold">*</span>
        )}
      </Label>

      {isLong ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "תשובתך…"}
          rows={4}
          className={`
            rounded-xl resize-none
            text-base
            min-h-[100px]
            px-4 py-3
            ${error ? "border-red-400 focus-visible:ring-red-400" : ""}
          `}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "תשובתך…"}
          inputMode={inputMode}
          className={`
            h-12
            rounded-xl
            text-base
            px-4
            ${error ? "border-red-400 focus-visible:ring-red-400" : ""}
          `}
          dir={validationType === "phone_il" || validationType === "id_il" ? "ltr" : undefined}
        />
      )}

      {/* Format hint */}
      {validationHint && !error && (
        <p className="text-xs text-neutral-400 flex items-center gap-1">
          <span className="text-neutral-300">•</span>
          {validationHint}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
