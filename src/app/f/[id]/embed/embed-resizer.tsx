"use client"

import { useEffect } from "react"

export function EmbedResizer() {
  useEffect(() => {
    function postHeight() {
      const height = document.documentElement.scrollHeight
      window.parent.postMessage({ type: "amarel-form-resize", height }, "*")
    }

    postHeight()

    const observer = new ResizeObserver(postHeight)
    observer.observe(document.body)

    return () => observer.disconnect()
  }, [])

  return null
}
