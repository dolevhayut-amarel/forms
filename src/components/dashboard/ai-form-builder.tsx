"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { generateFormWithAI } from "@/lib/actions/ai"

export function AiFormBuilder() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    if (!prompt.trim()) {
      toast.error("נא להזין תיאור לטופס")
      return
    }

    startTransition(async () => {
      const result = await generateFormWithAI(prompt)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.formId) {
        toast.success("הטופס נוצר בהצלחה!")
        setPrompt("")
        setOpen(false)
        router.push(`/forms/${result.formId}`)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="text-start">
            <p className="text-sm font-semibold text-neutral-800">בנה טופס עם AI</p>
            <p className="text-xs text-neutral-500">תאר מה אתה צריך והטופס ייבנה אוטומטית</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-neutral-100 pt-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={"לדוגמה: טופס דיווח נוכחות עם שם, תעודת זהות, חטיבה (רשימה נפתחת), וכפתור כניסה/יציאה.\nאו: טופס משוב עם דירוג כוכבים, שדה טקסט חופשי, ושדה מייל."}
            className="min-h-[100px] rounded-xl text-sm resize-none"
            dir="rtl"
            disabled={isPending}
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-neutral-400 flex-1">
              הטופס ייווצר בעברית עם שדות, ולידציות ולוגיקה מותנית. תוכל לערוך אותו אח&quot;כ.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isPending || !prompt.trim()}
              className="rounded-xl gap-2 h-10 px-5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  בונה טופס…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  צור טופס
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
