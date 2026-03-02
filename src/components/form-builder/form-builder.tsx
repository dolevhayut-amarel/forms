"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { nanoid } from "nanoid"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  ArrowLeft,
  Globe,
  EyeOff,
  Save,
  Loader2,
  MousePointer,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { AddFieldButton } from "./add-field-button"
import { FieldItem } from "./field-item"
import { FieldEditorPanel } from "./field-editor-panel"
import { createForm, updateForm } from "@/lib/actions/forms"
import type { FieldConfig, FieldType, Form } from "@/lib/types"

interface FormBuilderProps {
  initialForm?: Form
}

export function FormBuilder({ initialForm }: FormBuilderProps) {
  const router = useRouter()
  const [name, setName] = useState(initialForm?.name ?? "")
  const [description, setDescription] = useState(
    initialForm?.description ?? ""
  )
  const [fields, setFields] = useState<FieldConfig[]>(
    initialForm?.fields ?? []
  )
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(
    initialForm?.is_published ?? false
  )

  const isEditing = !!initialForm

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null

  function addField(type: FieldType) {
    const newField: FieldConfig = {
      id: nanoid(),
      type,
      label: "",
      placeholder: type === "text" ? "" : undefined,
      required: false,
      options: type !== "text" ? [] : undefined,
    }
    setFields((prev) => [...prev, newField])
    setSelectedFieldId(newField.id)
  }

  function updateField(updated: FieldConfig) {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
  }

  function deleteField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id))
    if (selectedFieldId === id) setSelectedFieldId(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSave = useCallback(
    async (publish?: boolean) => {
      if (!name.trim()) {
        toast.error("Please give your form a name")
        return
      }

      const isSaving = publish === undefined
      if (isSaving) setSaving(true)
      else setPublishing(true)

      try {
        const payload = {
          name: name.trim(),
          description: description.trim() || undefined,
          fields,
          settings: { submit_message: "Thank you for your response!" },
          ...(publish !== undefined ? { is_published: publish } : {}),
        }

        let result
        if (isEditing) {
          result = await updateForm(initialForm.id, payload)
        } else {
          result = await createForm(payload)
        }

        if (result.error) {
          toast.error(result.error)
          return
        }

        if (publish !== undefined) {
          setIsPublished(publish)
          toast.success(publish ? "Form published!" : "Form unpublished")
        } else {
          toast.success(isEditing ? "Changes saved" : "Form created!")
          if (!isEditing && result.form) {
            router.push(`/forms/${result.form.id}`)
          }
        }
      } finally {
        setSaving(false)
        setPublishing(false)
      }
    },
    [name, description, fields, isEditing, initialForm, router]
  )

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-neutral-200 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Untitled form"
            className="border-0 shadow-none bg-transparent px-0 text-sm font-semibold text-neutral-900 h-auto focus-visible:ring-0 placeholder:text-neutral-400 w-full max-w-xs"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditing && (
            <Button variant="ghost" size="sm" asChild className="rounded-xl gap-1.5 h-8 text-xs">
              <Link href={`/f/${initialForm.id}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />
                Preview
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave()}
            disabled={saving}
            className="rounded-xl gap-1.5 h-8 text-xs"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </Button>

          <Button
            size="sm"
            onClick={() => handleSave(!isPublished)}
            disabled={publishing}
            className="rounded-xl gap-1.5 h-8 text-xs"
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isPublished ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
            {isPublished ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — field list */}
        <div className="w-72 shrink-0 bg-white border-r border-neutral-200 flex flex-col overflow-hidden">
          {/* Form meta */}
          <div className="p-4 border-b border-neutral-100">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={2}
              className="text-xs text-neutral-600 resize-none border-0 shadow-none bg-neutral-50 rounded-xl p-3 focus-visible:ring-0 placeholder:text-neutral-400"
            />
          </div>

          {/* Field list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {fields.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-neutral-400">
                  No fields yet. Add your first field below.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((field) => (
                    <FieldItem
                      key={field.id}
                      field={field}
                      isSelected={selectedFieldId === field.id}
                      onSelect={() => setSelectedFieldId(field.id)}
                      onDelete={() => deleteField(field.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className="p-3 border-t border-neutral-100">
            <AddFieldButton onAdd={addField} />
          </div>
        </div>

        {/* Right panel — editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedField ? (
            <div className="max-w-md mx-auto bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <FieldEditorPanel
                field={selectedField}
                onChange={updateField}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                <MousePointer className="h-6 w-6 text-neutral-300" />
              </div>
              <p className="text-sm font-medium text-neutral-500">
                Select a field to edit
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Click any field on the left to configure it
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
