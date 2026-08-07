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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
          summary: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
          summary?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
          summary?: string
        }
        Relationships: []
      }
      dishes: {
        Row: {
          available: boolean
          category: string
          created_at: string
          description: string
          discount: number
          id: string
          image_url: string | null
          name: string
          prep_minutes: number | null
          price: number
          recommended: boolean
          restaurant_id: string
          stock: number
          tags: string[]
          veg: boolean
          visible: boolean
        }
        Insert: {
          available?: boolean
          category?: string
          created_at?: string
          description?: string
          discount?: number
          id?: string
          image_url?: string | null
          name: string
          prep_minutes?: number | null
          price: number
          recommended?: boolean
          restaurant_id: string
          stock?: number
          tags?: string[]
          veg?: boolean
          visible?: boolean
        }
        Update: {
          available?: boolean
          category?: string
          created_at?: string
          description?: string
          discount?: number
          id?: string
          image_url?: string | null
          name?: string
          prep_minutes?: number | null
          price?: number
          recommended?: boolean
          restaurant_id?: string
          stock?: number
          tags?: string[]
          veg?: boolean
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          image_url: string
          kind: string
          link_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          image_url: string
          kind?: string
          link_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string
          kind?: string
          link_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string | null
          id: string
          link: string | null
          read_at: string | null
          recipient_id: string | null
          title: string
        }
        Insert: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          recipient_id?: string | null
          title: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          recipient_id?: string | null
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          admin_notes: string | null
          code: string
          customer_name: string
          delivery_fee: number
          discount: number
          email: string | null
          eta_minutes: number | null
          id: string
          items: Json
          landmark: string | null
          payment_method: string
          phone: string
          pincode: string | null
          placed_at: string
          restaurant_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          admin_notes?: string | null
          code: string
          customer_name: string
          delivery_fee?: number
          discount?: number
          email?: string | null
          eta_minutes?: number | null
          id?: string
          items?: Json
          landmark?: string | null
          payment_method?: string
          phone: string
          pincode?: string | null
          placed_at?: string
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          admin_notes?: string | null
          code?: string
          customer_name?: string
          delivery_fee?: number
          discount?: number
          email?: string | null
          eta_minutes?: number | null
          id?: string
          items?: Json
          landmark?: string | null
          payment_method?: string
          phone?: string
          pincode?: string | null
          placed_at?: string
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          loyalty_points: number
          phone: string | null
          suspended: boolean
          updated_at: string
          wallet_balance: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          loyalty_points?: number
          phone?: string | null
          suspended?: boolean
          updated_at?: string
          wallet_balance?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          loyalty_points?: number
          phone?: string | null
          suspended?: boolean
          updated_at?: string
          wallet_balance?: number
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          cost_for_two: number
          created_at: string
          cuisines: string[]
          delivery_max: number
          delivery_min: number
          description: string
          featured: boolean
          id: string
          image_url: string | null
          name: string
          offer: string | null
          owner_id: string | null
          pure_veg: boolean
          rating: number
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviews: number
          slug: string
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          cost_for_two?: number
          created_at?: string
          cuisines?: string[]
          delivery_max?: number
          delivery_min?: number
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          name: string
          offer?: string | null
          owner_id?: string | null
          pure_veg?: boolean
          rating?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviews?: number
          slug: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          cost_for_two?: number
          created_at?: string
          cuisines?: string[]
          delivery_max?: number
          delivery_min?: number
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          name?: string
          offer?: string | null
          owner_id?: string | null
          pure_veg?: boolean
          rating?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviews?: number
          slug?: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          closed_reason: string
          closed_title: string
          created_at: string
          delivery_fee: number
          eta_max: number
          eta_min: number
          free_delivery_above: number
          free_delivery_enabled: boolean
          id: boolean
          offer_active: boolean
          offer_text: string
          shop_open: boolean
          store_name: string
          support_email: string
          support_phone: string
          tagline: string
          tax_rate: number
          theme_accent: string
          theme_background: string
          theme_mode: string
          theme_primary: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          closed_reason?: string
          closed_title?: string
          created_at?: string
          delivery_fee?: number
          eta_max?: number
          eta_min?: number
          free_delivery_above?: number
          free_delivery_enabled?: boolean
          id?: boolean
          offer_active?: boolean
          offer_text?: string
          shop_open?: boolean
          store_name?: string
          support_email?: string
          support_phone?: string
          tagline?: string
          tax_rate?: number
          theme_accent?: string
          theme_background?: string
          theme_mode?: string
          theme_primary?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          closed_reason?: string
          closed_title?: string
          created_at?: string
          delivery_fee?: number
          eta_max?: number
          eta_min?: number
          free_delivery_above?: number
          free_delivery_enabled?: boolean
          id?: boolean
          offer_active?: boolean
          offer_text?: string
          shop_open?: boolean
          store_name?: string
          support_email?: string
          support_phone?: string
          tagline?: string
          tax_rate?: number
          theme_accent?: string
          theme_background?: string
          theme_mode?: string
          theme_primary?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "restaurant_owner" | "customer" | "manager" | "staff"
      approval_status: "pending" | "approved" | "rejected"
      order_status:
        | "received"
        | "accepted"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
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
      app_role: ["admin", "restaurant_owner", "customer", "manager", "staff"],
      approval_status: ["pending", "approved", "rejected"],
      order_status: [
        "received",
        "accepted",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
