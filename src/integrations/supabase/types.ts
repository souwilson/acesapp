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
      ad_campaigns: {
        Row: {
          ad_performance_id: string
          budget: string | null
          campaign_name: string
          clicks: number | null
          conv_body: string | null
          conv_checkout: string | null
          cpa: number | null
          cpc: number | null
          cpi: number | null
          cpm: number | null
          created_at: string
          ctr: string | null
          frequency: string | null
          hook: string | null
          ic: number | null
          id: string
          impressions: number | null
          margin: string | null
          profit: number | null
          rejected_sales: number | null
          revenue: number | null
          roas: number | null
          sales: number | null
          spend: number | null
          status: string | null
        }
        Insert: {
          ad_performance_id: string
          budget?: string | null
          campaign_name: string
          clicks?: number | null
          conv_body?: string | null
          conv_checkout?: string | null
          cpa?: number | null
          cpc?: number | null
          cpi?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: string | null
          frequency?: string | null
          hook?: string | null
          ic?: number | null
          id?: string
          impressions?: number | null
          margin?: string | null
          profit?: number | null
          rejected_sales?: number | null
          revenue?: number | null
          roas?: number | null
          sales?: number | null
          spend?: number | null
          status?: string | null
        }
        Update: {
          ad_performance_id?: string
          budget?: string | null
          campaign_name?: string
          clicks?: number | null
          conv_body?: string | null
          conv_checkout?: string | null
          cpa?: number | null
          cpc?: number | null
          cpi?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: string | null
          frequency?: string | null
          hook?: string | null
          ic?: number | null
          id?: string
          impressions?: number | null
          margin?: string | null
          profit?: number | null
          rejected_sales?: number | null
          revenue?: number | null
          roas?: number | null
          sales?: number | null
          spend?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_ad_performance_id_fkey"
            columns: ["ad_performance_id"]
            isOneToOne: false
            referencedRelation: "ad_performance"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_creatives: {
        Row: {
          conversion_body: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          cta: number | null
          ctr: number | null
          drive_url: string | null
          id: string
          identification: string
          information: string | null
          observations: string | null
          play_rate_hook: number | null
          retention_body: number | null
          retention_hook: number | null
          status: string
          updated_at: string
          variation: string
        }
        Insert: {
          conversion_body?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          cta?: number | null
          ctr?: number | null
          drive_url?: string | null
          id?: string
          identification: string
          information?: string | null
          observations?: string | null
          play_rate_hook?: number | null
          retention_body?: number | null
          retention_hook?: number | null
          status?: string
          updated_at?: string
          variation?: string
        }
        Update: {
          conversion_body?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          cta?: number | null
          ctr?: number | null
          drive_url?: string | null
          id?: string
          identification?: string
          information?: string | null
          observations?: string | null
          play_rate_hook?: number | null
          retention_body?: number | null
          retention_hook?: number | null
          status?: string
          updated_at?: string
          variation?: string
        }
        Relationships: []
      }
      ad_performance: {
        Row: {
          cpa: number | null
          created_at: string
          date: string
          id: string
          investment: number
          manager: string | null
          notes: string | null
          platform: string
          revenue: number
          roas: number | null
          sales: number
          updated_at: string
        }
        Insert: {
          cpa?: number | null
          created_at?: string
          date: string
          id?: string
          investment?: number
          manager?: string | null
          notes?: string | null
          platform: string
          revenue?: number
          roas?: number | null
          sales?: number
          updated_at?: string
        }
        Update: {
          cpa?: number | null
          created_at?: string
          date?: string
          id?: string
          investment?: number
          manager?: string | null
          notes?: string | null
          platform?: string
          revenue?: number
          roas?: number | null
          sales?: number
          updated_at?: string
        }
        Relationships: []
      }
      allowed_users: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      collaborators: {
        Row: {
          created_at: string
          id: string
          monthly_value: number
          name: string
          notes: string | null
          payment_date: string
          role: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_value?: number
          name: string
          notes?: string | null
          payment_date: string
          role: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_value?: number
          name?: string
          notes?: string | null
          payment_date?: string
          role?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      dismissed_alerts: {
        Row: {
          alert_key: string
          created_at: string
          dismissed_at: string
          dismissed_by: string | null
          id: string
        }
        Insert: {
          alert_key: string
          created_at?: string
          dismissed_at?: string
          dismissed_by?: string | null
          id?: string
        }
        Update: {
          alert_key?: string
          created_at?: string
          dismissed_at?: string
          dismissed_by?: string | null
          id?: string
        }
        Relationships: []
      }
      login_audit: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          reason: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          reason?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          reason?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      platforms: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          name: string
          notes: string | null
          type: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          name: string
          notes?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_expenses: {
        Row: {
          category: string
          created_at: string
          current_amount: number
          id: string
          name: string
          notes: string | null
          payment_method: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          current_amount?: number
          id?: string
          name: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_amount?: number
          id?: string
          name?: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      taxes: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: string
          id: string
          notes: string | null
          paid: boolean
          paid_at: string | null
          receipt_url: string | null
          tax_date: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          due_date: string
          id?: string
          notes?: string | null
          paid?: boolean
          paid_at?: string | null
          receipt_url?: string | null
          tax_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          notes?: string | null
          paid?: boolean
          paid_at?: string | null
          receipt_url?: string | null
          tax_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string
          created_at: string
          currency: string
          due_date: string
          id: string
          monthly_value: number
          name: string
          notes: string | null
          payment_method: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          monthly_value?: number
          name: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          monthly_value?: number
          name?: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      variable_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          is_reimbursement: boolean
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          reimbursement_status: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date: string
          description: string
          id?: string
          is_reimbursement?: boolean
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reimbursement_status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_reimbursement?: boolean
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reimbursement_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          date: string
          destination: string
          id: string
          notes: string | null
          reason: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date: string
          destination?: string
          id?: string
          notes?: string | null
          reason: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          destination?: string
          id?: string
          notes?: string | null
          reason?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _email: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: { Args: { _email: string }; Returns: boolean }
      is_allowed_user: { Args: { _email: string }; Returns: boolean }
      is_rate_limited: { Args: { _email: string }; Returns: boolean }
      log_login_attempt: {
        Args: {
          _email: string
          _ip_address?: string
          _reason?: string
          _success: boolean
          _user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "viewer"
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
      app_role: ["admin", "manager", "viewer"],
    },
  },
} as const
