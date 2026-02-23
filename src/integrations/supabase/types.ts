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
      ai_learning_logs: {
        Row: {
          confidence: number | null
          created_at: string
          detected_entities: Json | null
          detected_intent: string
          id: string
          user_accepted: boolean | null
          user_feedback: string | null
          user_message: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          detected_entities?: Json | null
          detected_intent: string
          id?: string
          user_accepted?: boolean | null
          user_feedback?: string | null
          user_message: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          detected_entities?: Json | null
          detected_intent?: string
          id?: string
          user_accepted?: boolean | null
          user_feedback?: string | null
          user_message?: string
        }
        Relationships: []
      }
      app_columns: {
        Row: {
          column_type: string
          created_at: string
          default_value: string | null
          id: string
          is_required: boolean
          name: string
          position: number
          table_id: string
        }
        Insert: {
          column_type?: string
          created_at?: string
          default_value?: string | null
          id?: string
          is_required?: boolean
          name: string
          position?: number
          table_id: string
        }
        Update: {
          column_type?: string
          created_at?: string
          default_value?: string | null
          id?: string
          is_required?: boolean
          name?: string
          position?: number
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_columns_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "app_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      app_rows: {
        Row: {
          created_at: string
          data: Json
          id: string
          table_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          table_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          table_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_rows_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "app_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      app_tables: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_tables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          plan: Json | null
          project_id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          plan?: Json | null
          project_id: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          plan?: Json | null
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      db_connections: {
        Row: {
          created_at: string
          database_name: string
          host: string
          id: string
          is_default: boolean
          password_encrypted: string
          port: number
          project_id: string
          status: string
          status_message: string | null
          type: string
          updated_at: string
          use_ssl: boolean
          username: string
        }
        Insert: {
          created_at?: string
          database_name: string
          host: string
          id?: string
          is_default?: boolean
          password_encrypted: string
          port: number
          project_id: string
          status?: string
          status_message?: string | null
          type: string
          updated_at?: string
          use_ssl?: boolean
          username: string
        }
        Update: {
          created_at?: string
          database_name?: string
          host?: string
          id?: string
          is_default?: boolean
          password_encrypted?: string
          port?: number
          project_id?: string
          status?: string
          status_message?: string | null
          type?: string
          updated_at?: string
          use_ssl?: boolean
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "db_connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      project_versions: {
        Row: {
          created_at: string
          html: string
          id: string
          message: string | null
          project_id: string
          version_number: number
        }
        Insert: {
          created_at?: string
          html: string
          id?: string
          message?: string | null
          project_id: string
          version_number?: number
        }
        Update: {
          created_at?: string
          html?: string
          id?: string
          message?: string | null
          project_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          db_enabled: boolean
          description: string | null
          entities: Json | null
          html: string | null
          id: string
          intent: string | null
          is_public: boolean
          name: string
          slug: string | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          db_enabled?: boolean
          description?: string | null
          entities?: Json | null
          html?: string | null
          id?: string
          intent?: string | null
          is_public?: boolean
          name: string
          slug?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          db_enabled?: boolean
          description?: string | null
          entities?: Json | null
          html?: string | null
          id?: string
          intent?: string | null
          is_public?: boolean
          name?: string
          slug?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_entity_memory: {
        Row: {
          business_name: string | null
          color_scheme: string | null
          created_at: string
          id: string
          intent: string
          project_id: string
          sections: string[] | null
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          color_scheme?: string | null
          created_at?: string
          id?: string
          intent: string
          project_id: string
          sections?: string[] | null
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          color_scheme?: string | null
          created_at?: string
          id?: string
          intent?: string
          project_id?: string
          sections?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_entity_memory_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
