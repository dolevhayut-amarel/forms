import { useCallback, useRef, useState } from "react"

const MAX_HISTORY = 50

export function useHistory<T>(initialValue: T) {
  const [current, setCurrent] = useState<T>(initialValue)
  const pastRef = useRef<T[]>([])
  const futureRef = useRef<T[]>([])

  const set = useCallback((value: T | ((prev: T) => T)) => {
    setCurrent((prev) => {
      const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value
      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), prev]
      futureRef.current = []
      return next
    })
  }, [])

  const undo = useCallback(() => {
    setCurrent((prev) => {
      if (pastRef.current.length === 0) return prev
      const previous = pastRef.current[pastRef.current.length - 1]
      pastRef.current = pastRef.current.slice(0, -1)
      futureRef.current = [prev, ...futureRef.current]
      return previous
    })
  }, [])

  const redo = useCallback(() => {
    setCurrent((prev) => {
      if (futureRef.current.length === 0) return prev
      const next = futureRef.current[0]
      futureRef.current = futureRef.current.slice(1)
      pastRef.current = [...pastRef.current, prev]
      return next
    })
  }, [])

  const canUndo = pastRef.current.length > 0
  const canRedo = futureRef.current.length > 0

  return { value: current, set, undo, redo, canUndo, canRedo } as const
}
