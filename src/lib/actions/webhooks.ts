"use server"

import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export interface FormWebhook {
  id: string
  form_id: string
  url: string
  events: string[]
  is_active: boolean
  secret: string | null
  created_at: string
  updated_at: string
}

export interface WebhookLog {
  id: string
  webhook_id: string
  form_id: string
  event: string
  payload: Record<string, unknown>
  status_code: number | null
  response_body: string | null
  error: string | null
  created_at: string
}

export async function getFormWebhooks(formId: string): Promise<{
  webhooks: FormWebhook[]
  error?: string
}> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("form_webhooks")
    .select("*")
    .eq("form_id", formId)
    .order("created_at", { ascending: true })

  if (error) return { webhooks: [], error: error.message }
  return { webhooks: (data ?? []) as FormWebhook[] }
}

export async function upsertWebhook(params: {
  id?: string
  form_id: string
  url: string
  events: string[]
  is_active: boolean
  secret?: string | null
}): Promise<{ webhook?: FormWebhook; error?: string }> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  if (params.id) {
    const { data, error } = await sb
      .from("form_webhooks")
      .update({
        url: params.url,
        events: params.events,
        is_active: params.is_active,
        ...(params.secret !== undefined ? { secret: params.secret } : {}),
      })
      .eq("id", params.id)
      .select("*")
      .single()

    if (error) return { error: error.message }
    return { webhook: data as FormWebhook }
  }

  const secret = crypto.randomBytes(32).toString("hex")
  const { data, error } = await sb
    .from("form_webhooks")
    .insert({
      form_id: params.form_id,
      url: params.url,
      events: params.events,
      is_active: params.is_active,
      secret,
    })
    .select("*")
    .single()

  if (error) return { error: error.message }
  return { webhook: data as FormWebhook }
}

export async function deleteWebhook(webhookId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("form_webhooks")
    .delete()
    .eq("id", webhookId)

  if (error) return { error: error.message }
  return {}
}

export async function getWebhookLogs(formId: string, limit = 50): Promise<{
  logs: WebhookLog[]
  error?: string
}> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("webhook_logs")
    .select("*")
    .eq("form_id", formId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) return { logs: [], error: error.message }
  return { logs: (data ?? []) as WebhookLog[] }
}

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

export async function fireWebhooks(
  formId: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: webhooks } = await sb
    .from("form_webhooks")
    .select("*")
    .eq("form_id", formId)
    .eq("is_active", true)

  if (!webhooks || webhooks.length === 0) return

  const fullPayload = { event, form_id: formId, timestamp: new Date().toISOString(), data: payload }

  for (const webhook of webhooks as FormWebhook[]) {
    if (!webhook.events.includes(event)) continue

    const body = JSON.stringify(fullPayload)
    const headers: Record<string, string> = { "Content-Type": "application/json" }

    if (webhook.secret) {
      headers["X-Webhook-Signature"] = signPayload(body, webhook.secret)
    }

    let statusCode: number | null = null
    let responseBody: string | null = null
    let errorMsg: string | null = null

    try {
      const res = await fetch(webhook.url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(10000),
      })
      statusCode = res.status
      const text = await res.text()
      responseBody = text.slice(0, 1000)
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : "Unknown error"
    }

    try {
      await sb.from("webhook_logs").insert({
        webhook_id: webhook.id,
        form_id: formId,
        event,
        payload: fullPayload,
        status_code: statusCode,
        response_body: responseBody,
        error: errorMsg,
      })
    } catch {
      // log insertion failed — non-blocking
    }
  }
}

export async function testWebhook(webhookId: string): Promise<{
  success: boolean
  statusCode?: number
  error?: string
}> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: webhook, error } = await sb
    .from("form_webhooks")
    .select("*")
    .eq("id", webhookId)
    .single()

  if (error || !webhook) return { success: false, error: "Webhook not found" }

  const wh = webhook as FormWebhook
  const testPayload = {
    event: "test",
    form_id: wh.form_id,
    timestamp: new Date().toISOString(),
    data: { message: "This is a test webhook from Amarel Forms" },
  }

  const body = JSON.stringify(testPayload)
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (wh.secret) {
    headers["X-Webhook-Signature"] = signPayload(body, wh.secret)
  }

  let statusCode: number | null = null
  let responseBody: string | null = null
  let errorMsg: string | null = null

  try {
    const res = await fetch(wh.url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(10000),
    })
    statusCode = res.status
    const text = await res.text()
    responseBody = text.slice(0, 1000)
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Unknown error"
  }

  try {
    await sb.from("webhook_logs").insert({
      webhook_id: wh.id,
      form_id: wh.form_id,
      event: "test",
      payload: testPayload,
      status_code: statusCode,
      response_body: responseBody,
      error: errorMsg,
    })
  } catch {
    // non-blocking
  }

  if (errorMsg) return { success: false, error: errorMsg }
  return { success: statusCode !== null && statusCode >= 200 && statusCode < 300, statusCode: statusCode ?? undefined }
}
