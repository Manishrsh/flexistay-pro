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
      attendance: {
        Row: {
          check_in: string
          check_out: string | null
          created_at: string
          id: string
          member_id: string
          method: string
        }
        Insert: {
          check_in?: string
          check_out?: string | null
          created_at?: string
          id?: string
          member_id: string
          method?: string
        }
        Update: {
          check_in?: string
          check_out?: string | null
          created_at?: string
          id?: string
          member_id?: string
          method?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      diet_meal_sends: {
        Row: {
          created_at: string
          error: string | null
          id: string
          meal_id: string
          member_id: string | null
          sent_date: string
          status: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          meal_id: string
          member_id?: string | null
          sent_date: string
          status?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          meal_id?: string
          member_id?: string | null
          sent_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_meal_sends_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "diet_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_meal_sends_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_meals: {
        Row: {
          created_at: string
          day_of_week: number
          description: string | null
          id: string
          meal_name: string
          meal_time: string
          notify: boolean
          plan_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          description?: string | null
          id?: string
          meal_name: string
          meal_time: string
          notify?: boolean
          plan_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          description?: string | null
          id?: string
          meal_name?: string
          meal_time?: string
          notify?: boolean
          plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_meals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_plans: {
        Row: {
          breakfast: string | null
          calories: number | null
          created_at: string
          dinner: string | null
          id: string
          lunch: string | null
          member_id: string | null
          name: string
          notes: string | null
          protein_g: number | null
          snacks: string | null
          updated_at: string
          water_liters: number | null
        }
        Insert: {
          breakfast?: string | null
          calories?: number | null
          created_at?: string
          dinner?: string | null
          id?: string
          lunch?: string | null
          member_id?: string | null
          name: string
          notes?: string | null
          protein_g?: number | null
          snacks?: string | null
          updated_at?: string
          water_liters?: number | null
        }
        Update: {
          breakfast?: string | null
          calories?: number | null
          created_at?: string
          dinner?: string | null
          id?: string
          lunch?: string | null
          member_id?: string | null
          name?: string
          notes?: string | null
          protein_g?: number | null
          snacks?: string | null
          updated_at?: string
          water_liters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_plans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          branch_id: string | null
          condition: string | null
          cost: number | null
          created_at: string
          id: string
          last_service_date: string | null
          name: string
          purchase_date: string | null
          updated_at: string
          vendor: string | null
          warranty_until: string | null
        }
        Insert: {
          branch_id?: string | null
          condition?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          last_service_date?: string | null
          name: string
          purchase_date?: string | null
          updated_at?: string
          vendor?: string | null
          warranty_until?: string | null
        }
        Update: {
          branch_id?: string | null
          condition?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          last_service_date?: string | null
          name?: string
          purchase_date?: string | null
          updated_at?: string
          vendor?: string | null
          warranty_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          branch_id: string | null
          category: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          spent_on: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount?: number
          branch_id?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          spent_on?: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          spent_on?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          channel: string | null
          created_at: string
          done: boolean
          followup_at: string
          id: string
          lead_id: string | null
          member_id: string | null
          notes: string | null
          outcome: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string
          done?: boolean
          followup_at?: string
          id?: string
          lead_id?: string | null
          member_id?: string | null
          notes?: string | null
          outcome?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string
          done?: boolean
          followup_at?: string
          id?: string
          lead_id?: string | null
          member_id?: string | null
          notes?: string | null
          outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          interest: string | null
          mobile: string | null
          notes: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          interest?: string | null
          mobile?: string | null
          notes?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          interest?: string | null
          mobile?: string | null
          notes?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          address: string | null
          blood_group: string | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          dob: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          gender: string | null
          height_cm: number | null
          id: string
          joined_on: string
          medical_conditions: string | null
          member_code: string | null
          mobile: string | null
          photo_url: string | null
          status: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          address?: string | null
          blood_group?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          dob?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          joined_on?: string
          medical_conditions?: string | null
          member_code?: string | null
          mobile?: string | null
          photo_url?: string | null
          status?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          address?: string | null
          blood_group?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          dob?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          joined_on?: string
          medical_conditions?: string | null
          member_code?: string | null
          mobile?: string | null
          photo_url?: string | null
          status?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_expiry_sends: {
        Row: {
          created_at: string
          days_before: number
          error: string | null
          id: string
          member_id: string | null
          membership_id: string
          sent_date: string
          status: string
        }
        Insert: {
          created_at?: string
          days_before: number
          error?: string | null
          id?: string
          member_id?: string | null
          membership_id: string
          sent_date: string
          status?: string
        }
        Update: {
          created_at?: string
          days_before?: number
          error?: string | null
          id?: string
          member_id?: string | null
          membership_id?: string
          sent_date?: string
          status?: string
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          freeze_days: number
          gst_percent: number
          id: string
          is_active: boolean
          name: string
          personal_training: boolean
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days: number
          freeze_days?: number
          gst_percent?: number
          id?: string
          is_active?: boolean
          name: string
          personal_training?: boolean
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          freeze_days?: number
          gst_percent?: number
          id?: string
          is_active?: boolean
          name?: string
          personal_training?: boolean
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          amount: number
          created_at: string
          discount: number
          end_date: string
          id: string
          member_id: string
          plan_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          discount?: number
          end_date: string
          id?: string
          member_id: string
          plan_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          discount?: number
          end_date?: string
          id?: string
          member_id?: string
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          id: string
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          body?: string | null
          channel?: string
          created_at?: string
          id?: string
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          id?: string
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          discount: number
          due_amount: number
          gst_amount: number
          id: string
          invoice_no: string | null
          member_id: string | null
          membership_id: string | null
          method: string
          notes: string | null
          paid_on: string
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          discount?: number
          due_amount?: number
          gst_amount?: number
          id?: string
          invoice_no?: string | null
          member_id?: string | null
          membership_id?: string | null
          method?: string
          notes?: string | null
          paid_on?: string
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          discount?: number
          due_amount?: number
          gst_amount?: number
          id?: string
          invoice_no?: string | null
          member_id?: string | null
          membership_id?: string | null
          method?: string
          notes?: string | null
          paid_on?: string
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sales: {
        Row: {
          created_at: string
          id: string
          member_id: string | null
          product_id: string
          quantity: number
          sold_on: string
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          member_id?: string | null
          product_id: string
          quantity?: number
          sold_on?: string
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string | null
          product_id?: string
          quantity?: number
          sold_on?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_sales_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost_price: number | null
          created_at: string
          id: string
          name: string
          reorder_level: number | null
          sell_price: number | null
          sku: string | null
          stock: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          id?: string
          name: string
          reorder_level?: number | null
          sell_price?: number | null
          sku?: string | null
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          id?: string
          name?: string
          reorder_level?: number | null
          sell_price?: number | null
          sku?: string | null
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          address: string | null
          business_name: string
          currency: string
          currency_symbol: string
          email: string | null
          gst_percent: number
          id: string
          logo_url: string | null
          phone: string | null
          theme: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name?: string
          currency?: string
          currency_symbol?: string
          email?: string | null
          gst_percent?: number
          id?: string
          logo_url?: string | null
          phone?: string | null
          theme?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string
          currency?: string
          currency_symbol?: string
          email?: string | null
          gst_percent?: number
          id?: string
          logo_url?: string | null
          phone?: string | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          branch_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          joined_on: string | null
          mobile: string | null
          role_title: string
          salary: number | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          joined_on?: string | null
          mobile?: string | null
          role_title: string
          salary?: number | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          joined_on?: string | null
          mobile?: string | null
          role_title?: string
          salary?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_assignments: {
        Row: {
          assigned_at: string
          id: string
          member_id: string
          trainer_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          member_id: string
          trainer_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          member_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          branch_id: string | null
          created_at: string
          email: string | null
          experience_years: number | null
          full_name: string
          id: string
          is_active: boolean
          mobile: string | null
          photo_url: string | null
          salary: number | null
          specialization: string | null
          updated_at: string
          working_hours: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          full_name: string
          id?: string
          is_active?: boolean
          mobile?: string | null
          photo_url?: string | null
          salary?: number | null
          specialization?: string | null
          updated_at?: string
          working_hours?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          full_name?: string
          id?: string
          is_active?: boolean
          mobile?: string | null
          photo_url?: string | null
          salary?: number | null
          specialization?: string | null
          updated_at?: string
          working_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          day_of_week: string
          exercise_name: string
          id: string
          notes: string | null
          plan_id: string
          reps: number | null
          rest_seconds: number | null
          sets: number | null
          sort_order: number | null
        }
        Insert: {
          day_of_week: string
          exercise_name: string
          id?: string
          notes?: string | null
          plan_id: string
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          sort_order?: number | null
        }
        Update: {
          day_of_week?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          plan_id?: string
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string
          id: string
          member_id: string | null
          name: string
          notes: string | null
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id?: string | null
          name: string
          notes?: string | null
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string | null
          name?: string
          notes?: string | null
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
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
      app_role:
        | "super_admin"
        | "owner"
        | "manager"
        | "trainer"
        | "receptionist"
        | "accountant"
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
      app_role: [
        "super_admin",
        "owner",
        "manager",
        "trainer",
        "receptionist",
        "accountant",
      ],
    },
  },
} as const
