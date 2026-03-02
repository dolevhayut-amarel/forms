"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { FieldConfig, FormResponse } from "@/lib/types"

interface ResponsesTableProps {
  fields: FieldConfig[]
  responses: FormResponse[]
}

export function ResponsesTable({ fields, responses }: ResponsesTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (responses.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 text-sm">
        No responses yet
      </div>
    )
  }

  function formatValue(val: string | string[] | undefined): React.ReactNode {
    if (!val) return <span className="text-neutral-300">—</span>
    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-neutral-300">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {val.map((v) => (
            <Badge key={v} variant="secondary" className="text-xs rounded-md">
              {v}
            </Badge>
          ))}
        </div>
      )
    }
    return <span className="text-sm text-neutral-700">{val}</span>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-50">
            <TableHead className="text-xs font-semibold text-neutral-500 w-32">
              Submitted
            </TableHead>
            {fields.map((f) => (
              <TableHead
                key={f.id}
                className="text-xs font-semibold text-neutral-500 min-w-[140px]"
              >
                {f.label || "Untitled"}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <>
              <TableRow
                key={response.id}
                className="cursor-pointer hover:bg-neutral-50"
                onClick={() =>
                  setExpanded(expanded === response.id ? null : response.id)
                }
              >
                <TableCell className="text-xs text-neutral-500 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {expanded === response.id ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                    {new Date(response.submitted_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                </TableCell>
                {fields.map((f) => (
                  <TableCell key={f.id} className="max-w-[200px] truncate">
                    {formatValue(response.data[f.id])}
                  </TableCell>
                ))}
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
