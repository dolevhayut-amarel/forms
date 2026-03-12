"use server"

import { createClient } from "@/lib/supabase/server"
import { initializeApprovalForResponse } from "@/lib/actions/approvals"
import { rowToResponse, type FormResponse } from "@/lib/types"

export async function submitResponse(
  formId: string,
  data: Record<string, string | string[]>
): Promise<{ success?: boolean; error?: string; warning?: string }> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error } = await (supabase as any)
    .from("responses")
    .insert({ form_id: formId, data })
    .select("id")
    .single()

  if (error) return { error: error.message }

  if (inserted?.id) {
    const result = await initializeApprovalForResponse(inserted.id as string)
    if (!result.created && result.reason && result.reason !== "workflow_disabled" && result.reason !== "not_approval_form") {
      return { success: true, warning: "התגובה נשמרה אך יצירת סבב האישור נכשלה." }
    }
  }

  return { success: true }
}

export async function getResponses(
  formId: string
): Promise<{ responses: FormResponse[]; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { error: "Unauthorized", responses: [] }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows, error } = await (supabase as any)
    .from("responses")
    .select("*")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false })

  if (error) return { error: error.message, responses: [] }

  return { responses: (rows ?? []).map(rowToResponse) }
}
