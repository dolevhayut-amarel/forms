"use client"

import { useState, useCallback } from "react"
import { Share2, Link2, Copy, Check, Printer, Loader2, ExternalLink, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createShortLinkWithQR } from "@/lib/actions/shortio"

interface ShareFormDialogProps {
  formId: string
  formName: string
  variant?: "outline" | "ghost-dark"
  /** Controlled mode: pass open + onOpenChange to manage externally */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** When true, renders without a trigger button (for use inside dropdowns) */
  noTrigger?: boolean
}

export function ShareFormDialog({
  formId,
  formName,
  variant = "outline",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  noTrigger = false,
}: ShareFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const [loading, setLoading] = useState(false)
  const [shortURL, setShortURL] = useState<string | null>(null)
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [copiedFull, setCopiedFull] = useState(false)
  const [copiedShort, setCopiedShort] = useState(false)

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${formId}`
      : `https://forms.amarel.net/f/${formId}`

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    const result = await createShortLinkWithQR(formId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setShortURL(result.shortURL ?? null)
      setSvgContent(result.svgContent ?? null)
    }
    setLoading(false)
  }, [formId])

  function handleOpenChange(next: boolean) {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(next)
    } else {
      setInternalOpen(next)
    }
    // Auto-generate when opening for the first time
    if (next && !shortURL && !loading) {
      handleGenerate()
    }
  }

  function handleCopy(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const displayUrl = shortURL ?? publicUrl
    const qrBlock = svgContent
      ? `<div class="qr">${svgContent}</div>`
      : `<p class="no-qr">לא נוצר QR</p>`

    printWindow.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8" />
  <title>QR — ${formName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 32px 24px;
      background: #fff;
      color: #111;
    }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; text-align: center; }
    .subtitle { font-size: 13px; color: #666; margin-bottom: 28px; text-align: center; }
    .qr { line-height: 0; }
    .qr svg { width: 260px; height: 260px; }
    .url {
      margin-top: 20px;
      font-size: 13px;
      color: #444;
      word-break: break-all;
      text-align: center;
      max-width: 280px;
    }
    .scan-hint {
      margin-top: 10px;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
    @media print {
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <h1>${formName}</h1>
  <p class="subtitle">סרוק את הקוד להגשת הטופס</p>
  ${qrBlock}
  <p class="url">${displayUrl}</p>
  <p class="scan-hint">forms.amarel.net</p>
</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 400)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!noTrigger && (
        <DialogTrigger asChild>
          <Button
            variant={variant === "ghost-dark" ? "ghost" : "outline"}
            size="sm"
            className={cn(
              "gap-1.5 text-xs",
              variant === "ghost-dark"
                ? "h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 border-0"
                : "h-8 rounded-lg border-neutral-200"
            )}
          >
            <Share2 className="h-3.5 w-3.5" />
            שיתוף
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="rounded-2xl max-w-sm w-full" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-4 w-4 text-orange-500" />
            שיתוף הטופס
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* QR Code area */}
          <div className="flex flex-col items-center gap-3 bg-neutral-50 rounded-xl p-6 border border-neutral-100 min-h-[220px] justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                <span className="text-xs">יוצר קישור קצר וקוד QR…</span>
              </div>
            ) : svgContent ? (
              <>
                <div
                  className="[&_svg]:w-[180px] [&_svg]:h-[180px]"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
                <p className="text-xs text-neutral-400 text-center">סרוק להגשת הטופס</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <QrCode className="h-10 w-10 text-neutral-300" />
                <span className="text-xs text-center">
                  {shortURL ? "ה-QR לא זמין, אך הקישור הקצר נוצר" : "לא ניתן היה ליצור QR"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs h-7"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  נסה שוב
                </Button>
              </div>
            )}
          </div>

          {/* Print button — only if we have a QR */}
          {svgContent && (
            <Button
              variant="outline"
              className="w-full rounded-xl gap-2 h-9 text-sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              הדפס QR להדבקה
            </Button>
          )}

          {/* Short link */}
          {shortURL && (
            <div>
              <p className="text-xs font-medium text-neutral-600 mb-1.5 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-orange-500" />
                קישור קצר (Short.io)
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shortURL}
                  dir="ltr"
                  className="rounded-xl text-xs h-9 flex-1 bg-orange-50 border-orange-200 text-orange-800 font-medium"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl shrink-0 border-orange-200 hover:bg-orange-50"
                  onClick={() => handleCopy(shortURL, setCopiedShort)}
                  title="העתק קישור קצר"
                >
                  {copiedShort ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl shrink-0"
                  asChild
                  title="פתח בטאב חדש"
                >
                  <a href={shortURL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {/* Full public link */}
          <div>
            <p className="text-xs font-medium text-neutral-600 mb-1.5 flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
              קישור ישיר
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={publicUrl}
                dir="ltr"
                className="rounded-xl text-xs h-9 flex-1 text-neutral-500"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl shrink-0"
                onClick={() => handleCopy(publicUrl, setCopiedFull)}
                title="העתק קישור"
              >
                {copiedFull ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
