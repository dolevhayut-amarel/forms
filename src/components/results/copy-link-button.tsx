"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyLinkButtonProps {
  formId: string
  variant?: "outline" | "ghost-dark"
}

export function CopyLinkButton({ formId, variant = "outline" }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const url = `${window.location.origin}/f/${formId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant={variant === "ghost-dark" ? "ghost" : "outline"}
      size="sm"
      onClick={handleCopy}
      className={cn(
        "gap-1.5 text-xs",
        variant === "ghost-dark"
          ? "h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 border-0"
          : "h-8 rounded-lg border-neutral-200"
      )}
    >
      {copied ? (
        <Check className={cn("h-3.5 w-3.5", variant === "ghost-dark" ? "text-green-400" : "text-green-500")} />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "הועתק!" : "העתק קישור"}
    </Button>
  )
}
