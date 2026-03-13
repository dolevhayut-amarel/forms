"use client"

import { useState } from "react"
import { Check, Code, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EmbedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formId: string
}

export function EmbedDialog({ open, onOpenChange, formId }: EmbedDialogProps) {
  const [width, setWidth] = useState("100%")
  const [height, setHeight] = useState("600")
  const [copied, setCopied] = useState(false)

  const siteUrl = typeof window !== "undefined" ? window.location.origin : ""
  const embedUrl = `${siteUrl}/f/${formId}/embed`

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}px"
  frameborder="0"
  style="border: none; border-radius: 16px;"
  allow="geolocation"
></iframe>
<script>
window.addEventListener("message", function(e) {
  if (e.data && e.data.type === "amarel-form-resize") {
    var frames = document.querySelectorAll('iframe[src*="/f/${formId}/embed"]');
    frames.forEach(function(f) { f.style.height = e.data.height + "px"; });
  }
});
</script>`

  function handleCopy() {
    navigator.clipboard.writeText(iframeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            הטמעת טופס
          </DialogTitle>
          <DialogDescription>
            העתק את הקוד והדבק אותו באתר שלך להצגת הטופס
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">רוחב</Label>
              <Input
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="h-9 rounded-xl text-sm"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600">גובה (px)</Label>
              <Input
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="h-9 rounded-xl text-sm"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-neutral-600">קוד להטמעה</Label>
            <div className="relative">
              <pre
                className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-neutral-700 overflow-x-auto whitespace-pre-wrap break-all"
                dir="ltr"
              >
                {iframeCode}
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="absolute top-2 left-2 h-8 rounded-lg gap-1.5 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    הועתק
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    העתק
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-neutral-400">
            הסקריפט מעדכן אוטומטית את גובה ה-iframe בהתאם לתוכן הטופס.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
