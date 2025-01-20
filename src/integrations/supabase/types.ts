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
      audit_logs: {
        Row: {
          action_details: Json | null
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_id: string | null
          created_at: string
          id: number
          ip_address: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_id?: string | null
          created_at?: string
          id?: number
          ip_address?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: Database["public"]["Enums"]["admin_action_type"]
          admin_id?: string | null
          created_at?: string
          id?: number
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clothes: {
        Row: {
          category: string
          color: string
          created_at: string
          id: number
          image: string | null
          name: string
          user_id: string | null
        }
        Insert: {
          category: string
          color: string
          created_at?: string
          id?: never
          image?: string | null
          name: string
          user_id?: string | null
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          id?: never
          image?: string | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: number
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: number
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_profile_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_profile_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: never
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: never
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      outfit_clothes: {
        Row: {
          clothes_id: number | null
          created_at: string
          id: number
          outfit_id: number | null
        }
        Insert: {
          clothes_id?: number | null
          created_at?: string
          id?: number
          outfit_id?: number | null
        }
        Update: {
          clothes_id?: number | null
          created_at?: string
          id?: number
          outfit_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_clothes_clothes_id_fkey"
            columns: ["clothes_id"]
            isOneToOne: false
            referencedRelation: "clothes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_clothes_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_comments: {
        Row: {
          content: string
          created_at: string
          id: number
          outfit_id: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          outfit_id?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          outfit_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_comments_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_votes: {
        Row: {
          created_at: string
          id: number
          outfit_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          outfit_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          outfit_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_votes_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfits: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_favorite: boolean | null
          name: string
          rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_favorite?: boolean | null
          name: string
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_favorite?: boolean | null
          name?: string
          rating?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          has_completed_onboarding: boolean | null
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          has_completed_onboarding?: boolean | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          has_completed_onboarding?: boolean | null
          id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          category: string
          color: string
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          category: string
          color: string
          created_at?: string
          id?: number
          user_id?: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_retention: {
        Args: {
          start_date: string
          end_date: string
          retention_period: unknown
        }
        Returns: {
          date: string
          retention_rate: number
        }[]
      }
      check_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_daily_active_users: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          date: string
          active_users: number
        }[]
      }
      get_new_users_per_day: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          date: string
          new_users: number
        }[]
      }
      get_outfits_per_day: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          date: string
          outfits_count: number
        }[]
      }
      get_votes_per_day: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          date: string
          votes_count: number
        }[]
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action: Database["public"]["Enums"]["admin_action_type"]
          details?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      admin_action_type:
        | "login"
        | "logout"
        | "create_user"
        | "update_user"
        | "delete_user"
        | "create_outfit"
        | "update_outfit"
        | "delete_outfit"
        | "moderate_comment"
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
