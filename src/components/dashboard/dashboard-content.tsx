"use client"

import { useState, useMemo } from "react"
import { FormCard } from "./form-card"
import { FolderTabs } from "./folder-tabs"
import { AiFormBuilder } from "./ai-form-builder"
import type { Form } from "@/lib/types"

interface DashboardContentProps {
  formsWithCounts: { form: Form; responseCount: number }[]
}

export function DashboardContent({ formsWithCounts }: DashboardContentProps) {
  const [activeFolder, setActiveFolder] = useState<string | null>(null)

  const folders = useMemo(() => {
    const set = new Set<string>()
    formsWithCounts.forEach(({ form }) => {
      if (form.folder) set.add(form.folder)
    })
    return [...set].sort()
  }, [formsWithCounts])

  const filtered = useMemo(() => {
    if (activeFolder === null) return formsWithCounts
    if (activeFolder === "__none__") return formsWithCounts.filter(({ form }) => !form.folder)
    return formsWithCounts.filter(({ form }) => form.folder === activeFolder)
  }, [formsWithCounts, activeFolder])

  function handleCreateFolder(name: string) {
    setActiveFolder(name)
  }

  return (
    <>
      {folders.length > 0 && (
        <div className="mb-5">
          <FolderTabs
            folders={folders}
            activeFolder={activeFolder}
            onSelect={setActiveFolder}
            onCreateFolder={handleCreateFolder}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
          <p className="text-sm text-neutral-400">
            {activeFolder ? "אין טפסים בתיקיה זו" : "אין טפסים עדיין"}
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
