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
      admin_messages: {
        Row: {
          admin_id: string | null
          content: string
          created_at: string | null
          id: string
          read_at: string | null
          subject: string
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          subject: string
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_messages_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          type: Database["public"]["Enums"]["setting_type"]
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          type: Database["public"]["Enums"]["setting_type"]
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          type?: Database["public"]["Enums"]["setting_type"]
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      banned_words: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          word: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          word: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "banned_words_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clothes: {
        Row: {
          brand: string | null
          category: string
          color: string
          created_at: string
          id: number
          image: string | null
          is_for_sale: boolean | null
          location: string | null
          material: string | null
          name: string
          notes: string | null
          purchase_price: number | null
          secondary_color: string | null
          selling_price: number | null
          size: string | null
          subcategory: string | null
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          color: string
          created_at?: string
          id?: never
          image?: string | null
          is_for_sale?: boolean | null
          location?: string | null
          material?: string | null
          name: string
          notes?: string | null
          purchase_price?: number | null
          secondary_color?: string | null
          selling_price?: number | null
          size?: string | null
          subcategory?: string | null
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string
          created_at?: string
          id?: never
          image?: string | null
          is_for_sale?: boolean | null
          location?: string | null
          material?: string | null
          name?: string
          notes?: string | null
          purchase_price?: number | null
          secondary_color?: string | null
          selling_price?: number | null
          size?: string | null
          subcategory?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clothing_brands: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      clothing_categories: {
        Row: {
          created_at: string
          id: number
          name: string
          parent_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          parent_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          parent_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clothing_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "clothing_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      clothing_materials: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
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
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: number | null
          id: number
          is_deleted: boolean | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          group_id?: number | null
          id?: number
          is_deleted?: boolean | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: number | null
          id?: number
          is_deleted?: boolean | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "message_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_group_members: {
        Row: {
          group_id: number | null
          id: number
          joined_at: string
          user_id: string | null
        }
        Insert: {
          group_id?: number | null
          id?: number
          joined_at?: string
          user_id?: string | null
        }
        Update: {
          group_id?: number | null
          id?: number
          joined_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "message_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      message_groups: {
        Row: {
          created_at: string
          created_by: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: number
          name?: string
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
          flag_reason: string | null
          id: number
          is_flagged: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          outfit_id: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          flag_reason?: string | null
          id?: number
          is_flagged?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          outfit_id?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          flag_reason?: string | null
          id?: number
          is_flagged?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          outfit_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_comments_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          flag_reason: string | null
          id: number
          is_favorite: boolean | null
          is_flagged: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          name: string
          rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          flag_reason?: string | null
          id?: number
          is_favorite?: boolean | null
          is_flagged?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          name: string
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          flag_reason?: string | null
          id?: number
          is_favorite?: boolean | null
          is_flagged?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          name?: string
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outfits_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          has_completed_onboarding: boolean | null
          id: string
          last_login: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          has_completed_onboarding?: boolean | null
          id: string
          last_login?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          has_completed_onboarding?: boolean | null
          id?: string
          last_login?: string | null
          status?: string | null
        }
        Relationships: []
      }
      user_files: {
        Row: {
          content_type: string | null
          created_at: string
          description: string | null
          file_path: string
          filename: string
          id: string
          size: number | null
          user_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          filename: string
          id?: string
          size?: number | null
          user_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          filename?: string
          id?: string
          size?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          content: string
          created_at: string
          id: number
          is_deleted: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          is_deleted?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          is_deleted?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      contains_banned_words: {
        Args: {
          text_to_check: string
        }
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
      moderate_comment: {
        Args: {
          p_comment_id: number
          p_action: string
          p_reason?: string
        }
        Returns: undefined
      }
      moderate_outfit: {
        Args: {
          p_outfit_id: number
          p_action: string
          p_reason?: string
        }
        Returns: undefined
      }
      update_app_setting: {
        Args: {
          p_key: string
          p_value: string
        }
        Returns: undefined
      }
      update_user_status: {
        Args: {
          user_id: string
          new_status: string
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
        | "send_message"
        | "moderate_outfit"
        | "add_banned_word"
        | "remove_banned_word"
        | "update_setting"
      app_role: "admin" | "user"
      setting_type:
        | "general"
        | "notification"
        | "legal"
        | "appearance"
        | "social"
        | "security"
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
