import type { Form, FormResponse } from "./types"

// ─── KPI helpers ─────────────────────────────────────────────────────────────

export interface AnalyticsKPIs {
  totalForms: number
  publishedForms: number
  totalResponses: number
  responsesToday: number
  responsesThisWeek: number
  avgResponsesPerForm: number
}

export function computeKPIs(
  forms: Form[],
  responses: FormResponse[]
): AnalyticsKPIs {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay())

  const responsesToday = responses.filter(
    (r) => new Date(r.submitted_at) >= startOfToday
  ).length

  const responsesThisWeek = responses.filter(
    (r) => new Date(r.submitted_at) >= startOfWeek
  ).length

  return {
    totalForms: forms.length,
    publishedForms: forms.filter((f) => f.is_published).length,
    totalResponses: responses.length,
    responsesToday,
    responsesThisWeek,
    avgResponsesPerForm:
      forms.length > 0 ? Math.round(responses.length / forms.length) : 0,
  }
}

// ─── Responses over time ──────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  date: string   // "DD/MM"
  תגובות: number
}

export function buildTimeSeries(
  responses: FormResponse[],
  days: number,
  formId?: string
): TimeSeriesPoint[] {
  const now = new Date()
  const points: TimeSeriesPoint[] = []
  const filtered = formId
    ? responses.filter((r) => r.form_id === formId)
    : responses

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const next = new Date(d)
    next.setDate(d.getDate() + 1)

    const count = filtered.filter((r) => {
      const t = new Date(r.submitted_at)
      return t >= d && t < next
    }).length

    points.push({
      date: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      תגובות: count,
    })
  }

  return points
}

// ─── Per-form breakdown ───────────────────────────────────────────────────────

export interface FormStat {
  id: string
  name: string
  total: number
  today: number
  published: boolean
  form_type: string
}

export function buildFormStats(
  forms: Form[],
  responses: FormResponse[]
): FormStat[] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return forms
    .map((f) => {
      const formResponses = responses.filter((r) => r.form_id === f.id)
      const todayResponses = formResponses.filter(
        (r) => new Date(r.submitted_at) >= startOfToday
      ).length
      return {
        id: f.id,
        name: f.name,
        total: formResponses.length,
        today: todayResponses,
        published: f.is_published,
        form_type: f.form_type,
      }
    })
    .sort((a, b) => b.total - a.total)
}

// ─── Responses by day of week ─────────────────────────────────────────────────

export interface DayOfWeekPoint {
  day: string
  תגובות: number
}

const DAYS_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]

export function buildDayOfWeekStats(
  responses: FormResponse[]
): DayOfWeekPoint[] {
  const counts = new Array(7).fill(0)
  responses.forEach((r) => {
    counts[new Date(r.submitted_at).getDay()]++
  })
  return DAYS_HE.map((day, i) => ({ day, תגובות: counts[i] }))
}
