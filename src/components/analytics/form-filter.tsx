"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FormFilterProps {
  forms: { id: string; name: string }[]
  current: string
}

export function FormFilter({ forms, current }: FormFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setForm(formId: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (formId === "all") {
      params.delete("form")
    } else {
      params.set("form", formId)
    }
    router.push(`/analytics?${params.toString()}`)
  }

  return (
    <Select value={current} onValueChange={setForm}>
      <SelectTrigger className="h-8 rounded-xl text-xs w-48 bg-white">
        <SelectValue placeholder="כל הטפסים" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">כל הטפסים</SelectItem>
        {forms.map((f) => (
          <SelectItem key={f.id} value={f.id}>
            {f.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
