"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  BarChart2,
  ExternalLink,
  Copy,
  Globe,
  EyeOff,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteForm, updateForm } from "@/lib/actions/forms"
import type { Form } from "@/lib/types"

interface FormCardProps {
  form: Form
  responseCount: number
}

export function FormCard({ form, responseCount }: FormCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  const fillUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${form.id}`
      : `/f/${form.id}`

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteForm(form.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Form deleted")
    }
    setDeleting(false)
    setDeleteOpen(false)
  }

  async function handleTogglePublish() {
    setToggling(true)
    const result = await updateForm(form.id, {
      is_published: !form.is_published,
    })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(
        form.is_published ? "Form unpublished" : "Form published — share the link!"
      )
    }
    setToggling(false)
  }

  function handleCopyLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/f/${form.id}`
        : `/f/${form.id}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied!")
  }

  const formattedDate = new Date(form.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <>
      <div className="group relative bg-white border border-neutral-200 rounded-2xl p-5 hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 truncate text-sm">
              {form.name}
            </h3>
            {form.description && (
              <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                {form.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}`} className="flex items-center gap-2">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/forms/${form.id}/results`}
                  className="flex items-center gap-2"
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  Results
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/f/${form.id}`}
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleTogglePublish}
                disabled={toggling}
                className="flex items-center gap-2"
              >
                {form.is_published ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive flex items-center gap-2"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-neutral-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-neutral-900">
              {form.fields.length}
            </div>
            <div className="text-xs text-neutral-500">
              {form.fields.length === 1 ? "field" : "fields"}
            </div>
          </div>
          <div className="flex-1 bg-neutral-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-neutral-900">
              {responseCount}
            </div>
            <div className="text-xs text-neutral-500">
              {responseCount === 1 ? "response" : "responses"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-neutral-400">{formattedDate}</span>
          <Badge
            variant={form.is_published ? "default" : "secondary"}
            className="text-xs rounded-lg"
          >
            {form.is_published ? "Published" : "Draft"}
          </Badge>
        </div>

        {/* Click overlay to edit */}
        <Link
          href={`/forms/${form.id}`}
          className="absolute inset-0 rounded-2xl"
          aria-label={`Edit ${form.name}`}
        />
      </div>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete form?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{form.name}&quot; and all its
              responses. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
