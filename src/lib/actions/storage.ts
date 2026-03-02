"use server"

import { createClient } from "@/lib/supabase/server"

const BUCKET = "form-images"
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

export async function uploadFormImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null
  if (!file) return { error: "לא נבחר קובץ" }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "סוג קובץ לא נתמך. יש להעלות תמונה (JPG, PNG, GIF, WEBP, SVG)" }
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { error: "גודל הקובץ חורג מ-5MB" }
  }

  const supabase = await createClient()

  const ext = file.name.split(".").pop() ?? "jpg"
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { contentType: file.type, upsert: false })

  if (error) return { error: error.message }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)

  return { url: data.publicUrl }
}
