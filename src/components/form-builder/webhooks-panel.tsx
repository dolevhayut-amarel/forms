"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Loader2,
  Send,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  getFormWebhooks,
  upsertWebhook,
  deleteWebhook,
  getWebhookLogs,
  testWebhook,
  type FormWebhook,
  type WebhookLog,
} from "@/lib/actions/webhooks"

const WEBHOOK_EVENTS = [
  { value: "response_submitted", label: "תגובה חדשה" },
  { value: "approval_requested", label: "בקשת אישור" },
  { value: "approval_completed", label: "אישור הושלם" },
  { value: "next_step_requested", label: "שלב אישור הבא" },
]

interface WebhooksPanelProps {
  formId: string
}

export function WebhooksPanel({ formId }: WebhooksPanelProps) {
  const [webhooks, setWebhooks] = useState<FormWebhook[]>([])
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [url, setUrl] = useState("")
  const [events, setEvents] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [showLogs, setShowLogs] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [whRes, logRes] = await Promise.all([
      getFormWebhooks(formId),
      getWebhookLogs(formId, 20),
    ])
    setWebhooks(whRes.webhooks)
    setLogs(logRes.logs)
    setLoading(false)
  }, [formId])

  useEffect(() => {
    loadData()
  }, [loadData])

  function resetForm() {
    setUrl("")
    setEvents([])
    setIsActive(true)
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(wh: FormWebhook) {
    setUrl(wh.url)
    setEvents(wh.events)
    setIsActive(wh.is_active)
    setEditingId(wh.id)
    setShowForm(true)
  }

  function toggleEvent(event: string) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  async function handleSave() {
    if (!url.trim()) {
      toast.error("נא להזין URL")
      return
    }
    if (events.length === 0) {
      toast.error("נא לבחור לפחות אירוע אחד")
      return
    }

    setSaving(true)
    const result = await upsertWebhook({
      id: editingId ?? undefined,
      form_id: formId,
      url: url.trim(),
      events,
      is_active: isActive,
    })
    setSaving(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(editingId ? "Webhook עודכן" : "Webhook נוצר")
    resetForm()
    loadData()
  }

  async function handleDelete(id: string) {
    const result = await deleteWebhook(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success("Webhook נמחק")
    loadData()
  }

  async function handleTest(id: string) {
    setTesting(id)
    const result = await testWebhook(id)
    setTesting(null)

    if (result.success) {
      toast.success(`בדיקה הצליחה (${result.statusCode})`)
    } else {
      toast.error(`בדיקה נכשלה: ${result.error}`)
    }
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">Webhooks</h3>
        {!showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { resetForm(); setShowForm(true) }}
            className="h-7 rounded-lg gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            הוסף
          </Button>
        )}
      </div>

      {/* Webhook form */}
      {showForm && (
        <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50/50 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-neutral-600">URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              className="h-9 rounded-xl text-xs"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-neutral-600">אירועים</Label>
            <div className="space-y-1.5">
              {WEBHOOK_EVENTS.map((ev) => (
                <label key={ev.value} className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                  <Checkbox
                    checked={events.includes(ev.value)}
                    onCheckedChange={() => toggleEvent(ev.value)}
                  />
                  {ev.label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
            <Checkbox
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(Boolean(checked))}
            />
            פעיל
          </label>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="h-8 rounded-lg gap-1.5 text-xs flex-1"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingId ? "עדכן" : "צור"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="h-8 rounded-lg text-xs"
            >
              ביטול
            </Button>
          </div>
        </div>
      )}

      {/* Webhooks list */}
      {webhooks.length === 0 && !showForm ? (
        <p className="text-xs text-neutral-400 text-center py-4">אין webhooks מוגדרים</p>
      ) : (
        <div className="space-y-2">
          {webhooks.map((wh) => (
            <div key={wh.id} className="rounded-xl border border-neutral-200 bg-white p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-800 truncate" dir="ltr">
                    {wh.url}
                  </p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {wh.events.map((ev) => {
                      const label = WEBHOOK_EVENTS.find((e) => e.value === ev)?.label ?? ev
                      return (
                        <Badge key={ev} className="text-[10px] rounded-md px-1.5 py-0 bg-neutral-100 text-neutral-600 border-neutral-200">
                          {label}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
                <Badge
                  className={`text-[10px] rounded-md px-1.5 py-0 shrink-0 ${
                    wh.is_active
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-neutral-50 text-neutral-400 border-neutral-200"
                  }`}
                >
                  {wh.is_active ? "פעיל" : "מושבת"}
                </Badge>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest(wh.id)}
                  disabled={testing === wh.id}
                  className="h-7 rounded-lg gap-1 text-[11px] flex-1"
                >
                  {testing === wh.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  בדיקה
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(wh)}
                  className="h-7 rounded-lg text-[11px]"
                >
                  ערוך
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(wh.id)}
                  className="h-7 rounded-lg text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Logs section */}
      <div>
        <button
          type="button"
          onClick={() => setShowLogs(!showLogs)}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-700 w-full"
        >
          {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          לוגים ({logs.length})
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); loadData() }}
            className="ms-auto text-neutral-400 hover:text-neutral-600"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </button>

        {showLogs && (
          <div className="mt-2 space-y-1.5 max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-3">אין לוגים</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-2">
                  <button
                    type="button"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    className="flex items-center gap-2 w-full text-start"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        log.status_code && log.status_code >= 200 && log.status_code < 300
                          ? "bg-green-500"
                          : log.error
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-[11px] font-medium text-neutral-700 flex-1 truncate">
                      {WEBHOOK_EVENTS.find((e) => e.value === log.event)?.label ?? log.event}
                    </span>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {log.status_code ?? "err"}
                    </span>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </button>

                  {expandedLog === log.id && (
                    <div className="mt-2 space-y-1.5">
                      {log.error && (
                        <p className="text-[11px] text-red-600 bg-red-50 rounded-md px-2 py-1">
                          {log.error}
                        </p>
                      )}
                      <pre
                        className="text-[10px] text-neutral-500 bg-white rounded-md px-2 py-1.5 overflow-x-auto whitespace-pre-wrap break-all max-h-32"
                        dir="ltr"
                      >
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                      {log.response_body && (
                        <pre
                          className="text-[10px] text-neutral-400 bg-white rounded-md px-2 py-1.5 overflow-x-auto whitespace-pre-wrap break-all max-h-20"
                          dir="ltr"
                        >
                          {log.response_body}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
