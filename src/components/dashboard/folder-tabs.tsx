"use client"

import { useState } from "react"
import { FolderOpen, Plus, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface FolderTabsProps {
  folders: string[]
  activeFolder: string | null
  onSelect: (folder: string | null) => void
  onCreateFolder: (name: string) => void
}

export function FolderTabs({ folders, activeFolder, onSelect, onCreateFolder }: FolderTabsProps) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  function handleCreate() {
    const trimmed = newName.trim()
    if (!trimmed) { setCreating(false); return }
    onCreateFolder(trimmed)
    setNewName("")
    setCreating(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap" dir="rtl">
      {/* All forms */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeFolder === null
            ? "bg-neutral-800 text-white shadow-sm"
            : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
        }`}
      >
        הכל
      </button>

      {/* Folder pills */}
      {folders.map((folder) => (
        <button
          key={folder}
          type="button"
          onClick={() => onSelect(folder)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeFolder === folder
              ? "bg-neutral-800 text-white shadow-sm"
              : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <FolderOpen className="h-3 w-3" />
          {folder}
        </button>
      ))}

      {/* Uncategorized */}
      {folders.length > 0 && (
        <button
          type="button"
          onClick={() => onSelect("__none__")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeFolder === "__none__"
              ? "bg-neutral-800 text-white shadow-sm"
              : "bg-white border border-neutral-200 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
          }`}
        >
          ללא תיקיה
        </button>
      )}

      {/* New folder */}
      {creating ? (
        <div className="inline-flex items-center gap-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false) }}
            placeholder="שם תיקיה..."
            autoFocus
            className="h-7 w-32 rounded-lg text-xs px-2"
          />
          <button type="button" onClick={handleCreate} className="text-green-600 hover:text-green-700">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setCreating(false)} className="text-neutral-400 hover:text-neutral-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-dashed border-neutral-300 text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 transition-colors"
        >
          <Plus className="h-3 w-3" />
          תיקיה חדשה
        </button>
      )}
    </div>
  )
}
