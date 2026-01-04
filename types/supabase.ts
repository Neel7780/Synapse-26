export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accommodation_type: {
        Row: {
          description: string | null
          end_date: string | null
          id: number
          is_available: boolean | null
          package_name: string
          price: number | null
          start_date: string | null
        }
        Insert: {
          description?: string | null
          end_date?: string | null
          id?: number
          is_available?: boolean | null
          package_name: string
          price?: number | null
          start_date?: string | null
        }
        Update: {
          description?: string | null
          end_date?: string | null
          id?: number
          is_available?: boolean | null
          package_name?: string
          price?: number | null
          start_date?: string | null
        }
        Relationships: []
      }
      artist: {
        Row: {
          artist_image_url: string | null
          bio: string | null
          concert_id: number | null
          genre: string | null
          id: number
          name: string
          reveal_date: string | null
        }
        Insert: {
          artist_image_url?: string | null
          bio?: string | null
          concert_id?: number | null
          genre?: string | null
          id?: number
          name: string
          reveal_date?: string | null
        }
        Update: {
          artist_image_url?: string | null
          bio?: string | null
          concert_id?: number | null
          genre?: string | null
          id?: number
          name?: string
          reveal_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concert"
            referencedColumns: ["id"]
          },
        ]
      }
      concert: {
        Row: {
          concert_date: string | null
          concert_name: string
          id: number
          timing: string | null
          venue: string | null
        }
        Insert: {
          concert_date?: string | null
          concert_name: string
          id?: number
          timing?: string | null
          venue?: string | null
        }
        Update: {
          concert_date?: string | null
          concert_name?: string
          id?: number
          timing?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      event: {
        Row: {
          category_id: number | null
          description: string | null
          event_date: string
          event_id: number
          event_name: string
          event_picture: string | null
          is_dau_free: boolean | null
          is_registration_open: boolean | null
          rulebook: string | null
        }
        Insert: {
          category_id?: number | null
          description?: string | null
          event_date: string
          event_id?: number
          event_name: string
          event_picture?: string | null
          is_dau_free?: boolean | null
          is_registration_open?: boolean | null
          rulebook?: string | null
        }
        Update: {
          category_id?: number | null
          description?: string | null
          event_date?: string
          event_id?: number
          event_name?: string
          event_picture?: string | null
          is_dau_free?: boolean | null
          is_registration_open?: boolean | null
          rulebook?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_category"
            referencedColumns: ["category_id"]
          },
        ]
      }
      event_category: {
        Row: {
          category_id: number
          category_image: string | null
          category_name: string
          description: string | null
        }
        Insert: {
          category_id?: number
          category_image?: string | null
          category_name: string
          description?: string | null
        }
        Update: {
          category_id?: number
          category_image?: string | null
          category_name?: string
          description?: string | null
        }
        Relationships: []
      }
      event_fee: {
        Row: {
          event_id: number
          fee_id: number
        }
        Insert: {
          event_id: number
          fee_id: number
        }
        Update: {
          event_id?: number
          fee_id?: number
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
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string | null
          event_id: number | null
          fee_id: number | null
          gross_amount: number | null
          payment_method_id: number | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          registered_by_user_id: string | null
          registration_date: string | null
          registration_id: number
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: number | null
          fee_id?: number | null
          gross_amount?: number | null
          payment_method_id?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          registered_by_user_id?: string | null
          registration_date?: string | null
          registration_id?: number
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: number | null
          fee_id?: number | null
          gross_amount?: number | null
          payment_method_id?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          registered_by_user_id?: string | null
          registration_date?: string | null
          registration_id?: number
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fee_id_fkey"
            columns: ["event_id", "fee_id"]
            isOneToOne: false
            referencedRelation: "event_fee"
            referencedColumns: ["event_id", "fee_id"]
          },
          {
            foreignKeyName: "event_registrations_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_method"
            referencedColumns: ["payment_method_id"]
          },
          {
            foreignKeyName: "fk_event_registrations_user"
            columns: ["registered_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      fee: {
        Row: {
          fee_id: number
          max_members: number
          min_members: number
          participation_type: Database["public"]["Enums"]["participation_type_enum"]
          price: number
        }
        Insert: {
          fee_id?: number
          max_members?: number
          min_members?: number
          participation_type: Database["public"]["Enums"]["participation_type_enum"]
          price: number
        }
        Update: {
          fee_id?: number
          max_members?: number
          min_members?: number
          participation_type?: Database["public"]["Enums"]["participation_type_enum"]
          price?: number
        }
        Relationships: []
      }
      merchandise_management: {
        Row: {
          available_sizes: string[] | null
          description: string | null
          is_available: boolean | null
          price: number | null
          product_id: number
          product_image: string | null
          product_name: string
        }
        Insert: {
          available_sizes?: string[] | null
          description?: string | null
          is_available?: boolean | null
          price?: number | null
          product_id?: number
          product_image?: string | null
          product_name: string
        }
        Update: {
          available_sizes?: string[] | null
          description?: string | null
          is_available?: boolean | null
          price?: number | null
          product_id?: number
          product_image?: string | null
          product_name?: string
        }
        Relationships: []
      }
      merchandise_orders: {
        Row: {
          amount: number | null
          customer_id: string | null
          items: number | null
          order_date: string | null
          order_id: number
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount?: number | null
          customer_id?: string | null
          items?: number | null
          order_date?: string | null
          order_id?: number
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount?: number | null
          customer_id?: string | null
          items?: number | null
          order_date?: string | null
          order_id?: number
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "merchandise_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_method: {
        Row: {
          gateway_charge: number | null
          method_name: string
          payment_method_id: number
        }
        Insert: {
          gateway_charge?: number | null
          method_name: string
          payment_method_id?: number
        }
        Update: {
          gateway_charge?: number | null
          method_name?: string
          payment_method_id?: number
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          description: string | null
          logo_url: string | null
          name: string
          sponsor_id: number
          tier: string | null
          website_url: string | null
        }
        Insert: {
          description?: string | null
          logo_url?: string | null
          name: string
          sponsor_id?: number
          tier?: string | null
          website_url?: string | null
        }
        Update: {
          description?: string | null
          logo_url?: string | null
          name?: string
          sponsor_id?: number
          tier?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      team: {
        Row: {
          registration_id: number | null
          team_id: number
        }
        Insert: {
          registration_id?: number | null
          team_id?: number
        }
        Update: {
          registration_id?: number | null
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "event_registrations"
            referencedColumns: ["registration_id"]
          },
        ]
      }
      team_members: {
        Row: {
          team_id: number
          user_id: string
        }
        Insert: {
          team_id: number
          user_id: string
        }
        Update: {
          team_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          college: string | null
          dob: string | null
          email: string
          gender: string | null
          phone: string | null
          registration_date: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          college?: string | null
          dob?: string | null
          email: string
          gender?: string | null
          phone?: string | null
          registration_date?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          college?: string | null
          dob?: string | null
          email?: string
          gender?: string | null
          phone?: string | null
          registration_date?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      participation_type_enum: "solo" | "duet" | "group"
      payment_status: "pending" | "done" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      participation_type_enum: ["solo", "duet", "group"],
      payment_status: ["pending", "done", "failed"],
    },
  },
} as const
