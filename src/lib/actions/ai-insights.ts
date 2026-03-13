"use server"

import OpenAI from "openai"
import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod"

const INSIGHTS_MODEL = "gpt-5-nano"

export interface AISummary {
  summary: string
  topics: string[]
  sentiment: "positive" | "neutral" | "negative"
}

const AISummarySchema = z.object({
  summary: z.string(),
  topics: z.array(z.string()),
  sentiment: z.enum(["positive", "neutral", "negative"]),
})

export async function summarizeOpenEndedResponses(
  answers: string[],
  fieldLabel: string
): Promise<{ summary?: AISummary; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { error: "OpenAI API key not configured" }

  if (answers.length === 0) return { error: "אין תשובות לניתוח" }

  const truncated = answers.slice(0, 200)
  const answersText = truncated.map((a, i) => `${i + 1}. ${a}`).join("\n")

  try {
    const client = new OpenAI({ apiKey })

    const completion = await client.chat.completions.parse({
      model: INSIGHTS_MODEL,
      messages: [
        {
          role: "system",
          content: `אתה מנתח תשובות טופס. קיבלת רשימת תשובות פתוחות לשאלה "${fieldLabel}".
ספק:
1. סיכום קצר (2-3 משפטים) של הנושאים והמגמות העיקריות
2. רשימת נושאים עיקריים (3-7 נושאים, כל אחד מילה עד 3 מילים)
3. סנטימנט כללי: positive / neutral / negative

כתוב הכל בעברית.`,
        },
        {
          role: "user",
          content: `השאלה: "${fieldLabel}"\n\nתשובות (${answers.length} סה"כ):\n${answersText}`,
        },
      ],
      response_format: zodResponseFormat(AISummarySchema, "ai_summary"),
      ...(INSIGHTS_MODEL.startsWith("gpt-5")
        ? { reasoning_effort: "minimal" as const }
        : {}),
    })

    const parsed = completion.choices[0]?.message?.parsed
    if (!parsed) return { error: "לא התקבלה תשובה תקינה מהמודל" }

    return { summary: parsed }
  } catch (err) {
    console.error("AI insights error:", err)
    const message = err instanceof Error ? err.message : "שגיאה לא צפויה"
    return { error: `שגיאה בניתוח: ${message}` }
  }
}
