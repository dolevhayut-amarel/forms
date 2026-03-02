// ─── Domain types (used throughout the app) ─────────────────────────────────

export type FieldType = "text" | "dropdown" | "multiselect"

export interface FieldConfig {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export interface FormSettings {
  submit_message?: string
}

export interface Form {
  id: string
  user_id: string
  name: string
  description: string | null
  fields: FieldConfig[]
  settings: FormSettings
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface FormResponse {
  id: string
  form_id: string
  data: Record<string, string | string[]>
  submitted_at: string
}

// ─── JSON type used by Supabase for jsonb columns ────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Supabase Database schema ─────────────────────────────────────────────────
// Must include Relationships[] on each table to satisfy GenericTable constraint.

export type Database = {
  public: {
    Tables: {
      forms: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          fields: Json
          settings: Json
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          fields?: Json
          settings?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          fields?: Json
          settings?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      responses: {
        Row: {
          id: string
          form_id: string
          data: Json
          submitted_at: string
        }
        Insert: {
          id?: string
          form_id: string
          data?: Json
          submitted_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          data?: Json
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ─── Cast helpers ─────────────────────────────────────────────────────────────

export function rowToForm(
  row: Database["public"]["Tables"]["forms"]["Row"]
): Form {
  return {
    ...row,
    fields: (row.fields as unknown as FieldConfig[]) ?? [],
    settings: (row.settings as unknown as FormSettings) ?? {},
  }
}

export function rowToResponse(
  row: Database["public"]["Tables"]["responses"]["Row"]
): FormResponse {
  return {
    ...row,
    data:
      (row.data as unknown as Record<string, string | string[]>) ?? {},
  }
}
