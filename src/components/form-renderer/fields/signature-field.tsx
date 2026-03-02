"use client"

import { useRef, useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { FieldConfig } from "@/lib/types"

interface SignatureFieldProps {
  field: FieldConfig
  value: string        // base64 data URL or ""
  onChange: (value: string) => void
  error?: string
}

export function SignatureField({ field, value, onChange, error }: SignatureFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(!!value)

  // Restore existing signature on mount
  useEffect(() => {
    if (!value || !canvasRef.current) return
    const img = new Image()
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d")
      if (ctx && canvasRef.current) {
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
    img.src = value
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ("touches" in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    }
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setDrawing(true)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!drawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const pos = getPos(e, canvas)
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasStrokes(true)
  }

  function endDrawing() {
    if (!drawing) return
    setDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    onChange(canvas.toDataURL("image/png"))
  }

  function clearSignature() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
    onChange("")
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium text-neutral-800 leading-snug">
          {field.label}
          {field.required && <span className="text-red-500 ms-1 font-bold">*</span>}
        </Label>
        {hasStrokes && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSignature}
            className="h-7 px-2 text-xs text-neutral-400 hover:text-red-500 gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            נקה
          </Button>
        )}
      </div>

      <div
        className={`relative rounded-xl border-2 bg-white overflow-hidden ${
          error
            ? "border-red-400"
            : drawing
            ? "border-neutral-400"
            : "border-neutral-200"
        }`}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full touch-none cursor-crosshair"
          style={{ height: "160px" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />

        {!hasStrokes && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-neutral-300 select-none">חתום כאן</p>
          </div>
        )}

        {/* Bottom guide line */}
        <div className="absolute bottom-7 start-4 end-4 h-px bg-neutral-200 pointer-events-none" />
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
