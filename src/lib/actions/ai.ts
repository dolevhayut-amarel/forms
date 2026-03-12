"use server"

import { nanoid } from "nanoid"
import { z } from "zod"
import OpenAI from "openai"
import { zodResponseFormat } from "openai/helpers/zod"
import { createForm } from "./forms"
import type { FieldConfig, FieldCondition } from "@/lib/types"

const AIFieldSchema = z.object({
  type: z.enum([
    "text", "long_answer", "dropdown", "multiselect", "radio",
    "checkbox", "number", "date", "star_rating", "entry_exit",
    "location", "signature", "heading", "subheading", "paragraph", "divider",
  ]),
  label: z.string(),
  required: z.boolean(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  allow_other: z.boolean().optional(),
  paragraph_style: z.enum(["default", "info", "success", "warning", "danger"]).optional(),
  validation_type: z.enum(["none", "numbers_only", "text_only", "phone_il", "id_il"]).optional(),
  date_mode: z.enum(["date", "datetime"]).optional(),
  default_value_now: z.boolean().optional(),
  condition_field_label: z.string().optional(),
  condition_operator: z.enum(["equals", "not_equals", "contains", "not_contains", "is_empty", "is_not_empty"]).optional(),
  condition_value: z.string().optional(),
})

const FormGenerationSchema = z.object({
  name: z.string(),
  description: z.string(),
  fields: z.array(AIFieldSchema),
  submit_label: z.string().optional(),
})

type AIField = z.infer<typeof AIFieldSchema>

const SYSTEM_PROMPT = `You are an expert Hebrew form builder. You create digital forms for Israeli organizations.

When the user describes a form they need, generate a complete form structure with fields, validation, and conditional logic.

Guidelines:
- All labels and text MUST be in Hebrew
- Use appropriate field types: text for short answers, long_answer for paragraphs, dropdown/radio for single choice, multiselect for multiple choices, checkbox for boolean confirmations
- Add heading/subheading/divider/paragraph layout elements to organize the form visually
- Use entry_exit for attendance (entry/exit) forms
- Use location for GPS tracking fields
- Use signature for signature fields
- Set validation_type for text fields: phone_il for Israeli phones, id_il for Israeli ID numbers, numbers_only for numeric text
- Use date_mode "datetime" when time is needed, "date" for date-only
- Set default_value_now to true for date fields that should auto-fill with current date/time
- Use paragraph_style for styled paragraphs: info (blue), success (green), warning (orange), danger (red)
- Use conditional logic (condition_field_label + condition_operator + condition_value) to show/hide fields based on other field values. Reference the SOURCE field by its exact label text.
- For radio/dropdown with "other" option, set allow_other to true
- Set required appropriately - key fields should be required
- Generate a meaningful submit_label in Hebrew (e.g. "שלח טופס", "שלח דיווח")
- Keep the form practical and well-organized`

function mapAIFieldsToFieldConfig(aiFields: AIField[]): FieldConfig[] {
  const labelToId = new Map<string, string>()
  const idMap = new Map<string, AIField>()

  const ids = aiFields.map((af) => {
    const id = nanoid()
    labelToId.set(af.label, id)
    idMap.set(id, af)
    return id
  })

  return ids.map((id, i) => {
    const af = aiFields[i]

    let conditions: FieldCondition | undefined
    if (af.condition_field_label && af.condition_operator) {
      const sourceId = labelToId.get(af.condition_field_label)
      if (sourceId) {
        conditions = {
          match: "all",
          rules: [{
            fieldId: sourceId,
            operator: af.condition_operator,
            ...(af.condition_value !== undefined ? { value: af.condition_value } : {}),
          }],
        }
      }
    }

    return buildFieldConfig(id, af, conditions)
  })
}

function buildFieldConfig(
  id: string,
  f: AIField,
  conditions?: FieldCondition
): FieldConfig {
  const config: FieldConfig = {
    id,
    type: f.type,
    label: f.label,
    required: f.required,
  }

  if (f.placeholder) config.placeholder = f.placeholder
  if (f.options && f.options.length > 0) config.options = f.options
  if (f.allow_other) config.allow_other = true
  if (f.paragraph_style && f.paragraph_style !== "default") config.paragraph_style = f.paragraph_style
  if (f.validation_type && f.validation_type !== "none") {
    config.validation = { type: f.validation_type }
  }
  if (f.date_mode) config.date_mode = f.date_mode
  if (f.default_value_now) config.default_value = "__now__"
  if (f.type === "paragraph" && !config.content) config.content = f.label
  if (conditions) config.conditions = conditions

  return config
}

export async function generateFormWithAI(
  prompt: string
): Promise<{ formId?: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { error: "OpenAI API key not configured" }

  if (!prompt.trim()) return { error: "נא להזין תיאור לטופס" }

  try {
    const client = new OpenAI({ apiKey })

    const completion = await client.chat.completions.parse({
      model: "gpt-5.4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(FormGenerationSchema, "form_generation"),
    })

    const parsed = completion.choices[0]?.message?.parsed
    if (!parsed) {
      return { error: "לא התקבלה תשובה תקינה מהמודל" }
    }

    const fields = mapAIFieldsToFieldConfig(parsed.fields)

    const result = await createForm({
      name: parsed.name,
      description: parsed.description,
      fields,
      settings: {
        title_align: "right",
        submit_label: parsed.submit_label ?? "שלח",
        after_submit: "thank_you",
      },
      form_type: "general",
      is_published: false,
    })

    if (result.error) return { error: result.error }
    return { formId: result.form?.id }
  } catch (err) {
    console.error("AI form generation error:", err)
    const message = err instanceof Error ? err.message : "שגיאה לא צפויה"
    return { error: `שגיאה ביצירת הטופס: ${message}` }
  }
}
