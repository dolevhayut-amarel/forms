"use client"

import { useState, useMemo } from "react"
import { Search, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormCard } from "./form-card"
import { FolderTabs } from "./folder-tabs"
import { AiFormBuilder } from "./ai-form-builder"
import type { Form } from "@/lib/types"

type SortOption = "newest" | "oldest" | "name" | "responses"

interface DashboardContentProps {
  formsWithCounts: { form: Form; responseCount: number }[]
}

export function DashboardContent({ formsWithCounts }: DashboardContentProps) {
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [manualFolders, setManualFolders] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  const folders = useMemo(() => {
    const set = new Set<string>()
    formsWithCounts.forEach(({ form }) => {
      if (form.folder) set.add(form.folder)
    })
    manualFolders.forEach((f) => set.add(f))
    return [...set].sort()
  }, [formsWithCounts, manualFolders])

  const filtered = useMemo(() => {
    let items = formsWithCounts

    // Folder filter
    if (activeFolder === "__none__") {
      items = items.filter(({ form }) => !form.folder)
    } else if (activeFolder !== null) {
      items = items.filter(({ form }) => form.folder === activeFolder)
    }

    // Search filter
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      items = items.filter(({ form }) =>
        form.name.toLowerCase().includes(q) ||
        (form.description ?? "").toLowerCase().includes(q)
      )
    }

    // Sort
    const sorted = [...items]
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => new Date(b.form.created_at).getTime() - new Date(a.form.created_at).getTime())
        break
      case "oldest":
        sorted.sort((a, b) => new Date(a.form.created_at).getTime() - new Date(b.form.created_at).getTime())
        break
      case "name":
        sorted.sort((a, b) => a.form.name.localeCompare(b.form.name, "he"))
        break
      case "responses":
        sorted.sort((a, b) => b.responseCount - a.responseCount)
        break
    }

    return sorted
  }, [formsWithCounts, activeFolder, searchQuery, sortBy])

  function handleCreateFolder(name: string) {
    setManualFolders((prev) => prev.includes(name) ? prev : [...prev, name])
    setActiveFolder(name)
  }

  return (
    <>
      <div className="mb-5">
        <FolderTabs
          folders={folders}
          activeFolder={activeFolder}
          onSelect={setActiveFolder}
          onCreateFolder={handleCreateFolder}
        />
      </div>

      {/* Search & Sort toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש טפסים..."
            className="h-9 pr-9 rounded-xl text-sm border-neutral-200"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="h-9 w-[160px] rounded-xl text-xs border-neutral-200">
            <ArrowUpDown className="h-3 w-3 text-neutral-400 shrink-0 me-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">חדש ביותר</SelectItem>
            <SelectItem value="oldest">ישן ביותר</SelectItem>
            <SelectItem value="name">לפי שם</SelectItem>
            <SelectItem value="responses">הכי הרבה תגובות</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
          <p className="text-sm text-neutral-400">
            {searchQuery.trim()
              ? "לא נמצאו טפסים תואמים"
              : activeFolder
                ? "אין טפסים בתיקיה זו"
                : "אין טפסים עדיין"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ form, responseCount }) => (
            <FormCard key={form.id} form={form} responseCount={responseCount} allFolders={folders} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <AiFormBuilder />
      </div>
    </>
  )
}
