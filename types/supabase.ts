export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      event: {
        Row: {
          event_id: number
          event_name: string
          category_id: number | null
          event_date: string | null
          event_picture: string | null
          rulebook: string | null
          description: string | null
          is_registration_open: boolean
          created_at: string
        }
        Insert: {
          event_id?: number
          event_name: string
          category_id?: number | null
          event_date?: string | null
          event_picture?: string | null
          rulebook?: string | null
          description?: string | null
          is_registration_open?: boolean
          created_at?: string
        }
        Update: {
          event_id?: number
          event_name?: string
          category_id?: number | null
          event_date?: string | null
          event_picture?: string | null
          rulebook?: string | null
          description?: string | null
          is_registration_open?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_category"
            referencedColumns: ["category_id"]
          }
        ]
      }
      event_category: {
        Row: {
          category_id: number
          category_name: string
          description: string | null
          category_image: string | null
          created_at: string
        }
        Insert: {
          category_id?: number
          category_name: string
          description?: string | null
          category_image?: string | null
          created_at?: string
        }
        Update: {
          category_id?: number
          category_name?: string
          description?: string | null
          category_image?: string | null
          created_at?: string
        }
        Relationships: []
      }
      fee: {
        Row: {
          fee_id: number
          participation_type: string
          price: number
          min_members: number | null
          max_members: number | null
          created_at: string
        }
        Insert: {
          fee_id?: number
          participation_type: string
          price: number
          min_members?: number | null
          max_members?: number | null
          created_at?: string
        }
        Update: {
          fee_id?: number
          participation_type?: string
          price?: number
          min_members?: number | null
          max_members?: number | null
          created_at?: string
        }
        Relationships: []
      }
      event_fee: {
        Row: {
          event_fee_id: number
          event_id: number
          fee_id: number
          created_at: string
        }
        Insert: {
          event_fee_id?: number
          event_id: number
          fee_id: number
          created_at?: string
        }
        Update: {
          event_fee_id?: number
          event_id?: number
          fee_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_fee_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_fee_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "fee"
            referencedColumns: ["fee_id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_: string]: never
    }
    Functions: {
      [_: string]: never
    }
    Enums: {
      [_: string]: never
    }
    CompositeTypes: {
      [_: string]: never
    }
  }
} 