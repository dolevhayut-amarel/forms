"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { FieldConfig, FormResponse, ResponseApproval, ApprovalStatus } from "@/lib/types"

interface ResponsesTableProps {
  fields: FieldConfig[]
  responses: FormResponse[]
  approvalsByResponseId?: Record<string, ResponseApproval>
  showApprovalColumns?: boolean
  /** When false, cells are wider and text wraps instead of truncating (e.g. in dialog) */
  compact?: boolean
}

const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  pending: "ממתין",
  in_progress: "בתהליך",
  approved: "אושר",
  rejected: "נדחה",
  expired: "פג תוקף",
}

const APPROVAL_CLASS: Record<ApprovalStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-neutral-100 text-neutral-600 border-neutral-200",
}

export function ResponsesTable({ fields, responses, approvalsByResponseId = {}, showApprovalColumns = false, compact = true }: ResponsesTableProps) {
  if (responses.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 text-sm">
        עדיין אין תגובות
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
            <TableHead className="text-xs font-semibold text-neutral-500 w-32 text-right">
              זמן שליחה
            </TableHead>
            {showApprovalColumns && (
              <>
                <TableHead className="text-xs font-semibold text-neutral-500 min-w-[110px] text-right">סטטוס אישור</TableHead>
                <TableHead className="text-xs font-semibold text-neutral-500 min-w-[90px] text-right">שלב</TableHead>
              </>
            )}
            {fields.map((f) => (
              <TableHead
                key={f.id}
                className={`text-xs font-semibold text-neutral-500 text-right ${
                  compact ? "min-w-[140px]" : "min-w-[160px]"
                }`}
              >
                {f.label || "ללא שם"}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id} className="hover:bg-neutral-50">
              <TableCell className="text-xs text-neutral-500 whitespace-nowrap text-right">
                {new Date(response.submitted_at).toLocaleDateString("he-IL", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              {showApprovalColumns && (() => {
                const appr = approvalsByResponseId[response.id]
                return (
                  <>
                    <TableCell className="text-right">
                      {appr ? (
                        <Badge className={`rounded-md border text-xs ${APPROVAL_CLASS[appr.status]}`}>
                          {APPROVAL_LABEL[appr.status]}
                        </Badge>
                      ) : <span className="text-neutral-300">—</span>}
                    </TableCell>
                    <TableCell className="text-right text-xs text-neutral-600">
                      {appr ? `${appr.current_step_index + 1}/${Math.max(appr.steps.length, 1)}` : "—"}
                    </TableCell>
                  </>
                )
              })()}
              {fields.map((f) => (
                <TableCell
                  key={f.id}
                  className={`text-right ${compact ? "max-w-[200px] truncate" : "min-w-[160px] max-w-[320px] break-words whitespace-normal"}`}
                >
                  {formatValue(response.data[f.id])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
