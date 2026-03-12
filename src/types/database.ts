export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      forms: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          form_type: string
          id: string
          is_published: boolean
          name: string
          schema: Json
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields?: Json
          form_type?: string
          id?: string
          is_published?: boolean
          name: string
          schema?: Json
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          form_type?: string
          id?: string
          is_published?: boolean
          name?: string
          schema?: Json
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          form_id: string
          form_name: string
          id: string
          is_read: boolean
          response_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          form_id: string
          form_name: string
          id?: string
          is_read?: boolean
          response_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          form_id?: string
          form_name?: string
          id?: string
          is_read?: boolean
          response_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "responses"
            referencedColumns: ["id"]
          },
        ]
      }
      response_approvals: {
        Row: {
          created_at: string
          current_step_index: number
          finished_at: string | null
          form_id: string
          id: string
          response_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_step_index?: number
          finished_at?: string | null
          form_id: string
          id?: string
          response_id: string
          started_at?: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_step_index?: number
          finished_at?: string | null
          form_id?: string
          id?: string
          response_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "response_approvals_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_approvals_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["id"]
          },
        ]
      }
      response_approval_steps: {
        Row: {
          acted_at: string | null
          approver_channel: string
          approver_name: string
          approver_target: string
          created_at: string
          decision_note: string | null
          id: string
          response_approval_id: string
          signature_data: string | null
          status: string
          step_index: number
          token_expires_at: string | null
          token_hash: string | null
          token_used_at: string | null
          updated_at: string
        }
        Insert: {
          acted_at?: string | null
          approver_channel: string
          approver_name: string
          approver_target: string
          created_at?: string
          decision_note?: string | null
          id?: string
          response_approval_id: string
          signature_data?: string | null
          status: string
          step_index: number
          token_expires_at?: string | null
          token_hash?: string | null
          token_used_at?: string | null
          updated_at?: string
        }
        Update: {
          acted_at?: string | null
          approver_channel?: string
          approver_name?: string
          approver_target?: string
          created_at?: string
          decision_note?: string | null
          id?: string
          response_approval_id?: string
          signature_data?: string | null
          status?: string
          step_index?: number
          token_expires_at?: string | null
          token_hash?: string | null
          token_used_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "response_approval_steps_response_approval_id_fkey"
            columns: ["response_approval_id"]
            isOneToOne: false
            referencedRelation: "response_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      response_approval_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          response_approval_id: string
          response_approval_step_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          response_approval_id: string
          response_approval_step_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          response_approval_id?: string
          response_approval_step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "response_approval_events_response_approval_id_fkey"
            columns: ["response_approval_id"]
            isOneToOne: false
            referencedRelation: "response_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          data: Json
          form_id: string
          id: string
          submitted_at: string
        }
        Insert: {
          data?: Json
          form_id: string
          id?: string
          submitted_at?: string
        }
        Update: {
          data?: Json
          form_id?: string
          id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      attendance_presence: {
        Row: {
          data: Json | null
          form_id: string | null
          rn: number | null
          submitted_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      initialize_approval_for_response: {
        Args: { p_response_id: string }
        Returns: Json
      }
      get_approval_by_token: {
        Args: { p_token: string }
        Returns: {
          response_approval_id: string
          response_approval_step_id: string
          form_id: string
          form_name: string
          form_fields: Json
          form_settings: Json
          response_id: string
          response_data: Json
          step_index: number
          total_steps: number
          approver_name: string
          approver_channel: string
          approver_target: string
          expires_at: string
        }[]
      }
      decide_approval_by_token: {
        Args: { p_token: string; p_decision: string; p_note?: string; p_signature?: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"]
