"use server"

import { headers } from "next/headers"

const SHORTIO_API_KEY = process.env.SHORTIO_API_KEY!
const SHORTIO_DOMAIN = process.env.SHORTIO_DOMAIN ?? "forms.amarel.net"

async function getAppBaseUrl(): Promise<string> {
  const h = await headers()
  const host = h.get("host") ?? ""
  const proto = h.get("x-forwarded-proto") ?? "https"
  return `${proto}://${host}`
}

export async function createShortLinkWithQR(formId: string): Promise<{
  shortURL?: string
  svgContent?: string
  error?: string
}> {
  const baseUrl = await getAppBaseUrl()
  const originalURL = `${baseUrl}/f/${formId}`

  // Step 1: create short link
  let idString: string
  let shortURL: string
  try {
    const res = await fetch("https://api.short.io/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: SHORTIO_API_KEY,
      },
      body: JSON.stringify({ originalURL, domain: SHORTIO_DOMAIN }),
      cache: "no-store",
    })
    const data = await res.json()
    if (!res.ok) {
      return { error: data.error ?? "שגיאה ביצירת קישור קצר" }
    }
    idString = data.idString as string
    shortURL = data.shortURL as string
  } catch {
    return { error: "שגיאה ביצירת קישור קצר" }
  }

  // Step 2: generate QR SVG for the short link
  try {
    const res = await fetch(
      `https://api.short.io/links/qr/${encodeURIComponent(idString)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: SHORTIO_API_KEY,
        },
        body: JSON.stringify({ useDomainSettings: false, type: "svg", size: 10 }),
        cache: "no-store",
      }
    )
    if (!res.ok) {
      // Return the short link even if QR fails
      return { shortURL }
    }
    const svgContent = await res.text()
    return { shortURL, svgContent }
  } catch {
    return { shortURL }
  }
}
