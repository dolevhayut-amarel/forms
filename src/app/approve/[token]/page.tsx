import { redirect } from "next/navigation"
import { decideApprovalByToken, getApprovalByToken } from "@/lib/actions/approvals"
import { isLayoutField, type FieldConfig } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  params: Promise<{ token: string }>
  searchParams: Promise<{ result?: string; error?: string }>
}

function getVisibleFields(
  allFields: FieldConfig[],
  visMode: "all" | "selected" | undefined,
  visibleIds: string[] | undefined,
  responseData: Record<string, string | string[]>
): { label: string; value: string }[] {
  const inputFields = allFields.filter((f) => !isLayoutField(f.type))
  const allowed =
    visMode === "selected" && visibleIds
      ? inputFields.filter((f) => f.show_to_approver !== false && visibleIds.includes(f.id))
      : inputFields

  return allowed
    .filter((f) => responseData[f.id] !== undefined)
    .map((f) => {
      const raw = responseData[f.id]
      return {
        label: f.label || f.id,
        value: Array.isArray(raw) ? raw.join(", ") : String(raw),
      }
    })
}

export default async function ApproveByTokenPage({ params, searchParams }: Props) {
  const { token } = await params
  const query = await searchParams

  async function approveAction(formData: FormData) {
    "use server"
    const note = String(formData.get("note") ?? "").trim()
    const signature = String(formData.get("signature") ?? "").trim()
    const result = await decideApprovalByToken({
      token,
      decision: "approved",
      note: note || undefined,
      signature: signature || undefined,
    })
    if (result.error) {
      redirect(`/approve/${token}?error=${encodeURIComponent(result.error)}`)
    }
    redirect(`/approve/${token}?result=approved`)
  }

  async function rejectAction(formData: FormData) {
    "use server"
    const note = String(formData.get("note") ?? "").trim()
    const result = await decideApprovalByToken({
      token,
      decision: "rejected",
      note: note || undefined,
    })
    if (result.error) {
      redirect(`/approve/${token}?error=${encodeURIComponent(result.error)}`)
    }
    redirect(`/approve/${token}?result=rejected`)
  }

  const { approval, error } = await getApprovalByToken(token)

  if (!approval || error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-2xl p-6 text-center">
          <h1 className="text-xl font-bold text-neutral-900 mb-2">הקישור אינו תקין</h1>
          <p className="text-sm text-neutral-500">
            נראה שהקישור פג תוקף או כבר נוצל.
          </p>
        </div>
      </div>
    )
  }

  const settings = approval.form_settings ?? {}
  const visMode = settings.approval_field_visibility?.mode
  const visibleIds = settings.approval_field_visibility?.visible_field_ids
  const displayFields = getVisibleFields(
    approval.form_fields,
    visMode,
    visibleIds,
    approval.response_data
  )

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4" dir="rtl">
      <main className="max-w-2xl mx-auto space-y-5">
        <section className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">אישור בקשה</h1>
          <p className="text-sm text-neutral-500 mb-4">
            טופס: {approval.form_name} | שלב {approval.step_index + 1} מתוך {approval.total_steps}
          </p>

          {query.result === "approved" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm px-3 py-2 mb-3">
              הבקשה אושרה בהצלחה.
            </div>
          )}
          {query.result === "rejected" && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2 mb-3">
              הבקשה נדחתה.
            </div>
          )}
          {query.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2 mb-3">
              פעולה נכשלה: {query.error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
            <div className="rounded-lg border border-neutral-200 p-3">
              <p className="text-xs text-neutral-500 mb-1">מאשר</p>
              <p className="font-medium text-neutral-800">{approval.approver_name}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-3">
              <p className="text-xs text-neutral-500 mb-1">ערוץ</p>
              <p className="font-medium text-neutral-800">{approval.approver_channel}: {approval.approver_target}</p>
            </div>
          </div>

          {displayFields.length > 0 && (
            <div className="space-y-2 mb-5">
              <h2 className="text-sm font-semibold text-neutral-700">פרטי הבקשה</h2>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-2">
                {displayFields.map((f) => (
                  <div key={f.label} className="flex items-start justify-between gap-4 text-xs">
                    <span className="text-neutral-500 shrink-0">{f.label}</span>
                    <span className="text-neutral-800 text-left break-all">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!query.result && (
            <>
              <form className="space-y-3" action={approveAction}>
                <Textarea name="note" placeholder="הערה (אופציונלי)" className="min-h-20 rounded-xl" />
                <Textarea name="signature" placeholder="חתימה טקסטואלית (אופציונלי)" className="min-h-16 rounded-xl" />
                <Button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">
                  אשר
                </Button>
              </form>

              <form className="mt-2" action={rejectAction}>
                <input type="hidden" name="note" value="" />
                <Button type="submit" variant="outline" className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                  דחה
                </Button>
              </form>
            </>
          )}
        </section>

        <p className="text-center text-xs text-neutral-400">
          מופעל על ידי <span className="font-medium text-neutral-600">אמרל טפסים</span>
        </p>
      </main>
    </div>
  )
}
