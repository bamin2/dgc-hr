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
      allowance_templates: {
        Row: {
          amount: number
          amount_type: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_taxable: boolean | null
          name: string
          percentage_of: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          amount_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_taxable?: boolean | null
          name: string
          percentage_of?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_taxable?: boolean | null
          name?: string
          percentage_of?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          notes: string | null
          status: string
          updated_at: string | null
          work_hours: number | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          status: string
          updated_at?: string | null
          work_hours?: number | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          work_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_state: string | null
          address_street: string | null
          address_zip_code: string | null
          company_size: string | null
          created_at: string | null
          currency: string | null
          date_format: string | null
          email: string | null
          id: string
          industry: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          tax_id: string | null
          timezone: string | null
          updated_at: string | null
          website: string | null
          year_founded: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip_code?: string | null
          company_size?: string | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          year_founded?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip_code?: string | null
          company_size?: string | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          year_founded?: string | null
        }
        Relationships: []
      }
      company_settings_audit: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          company_settings_id: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          company_settings_id: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          company_settings_id?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: []
      }
      deduction_templates: {
        Row: {
          amount: number
          amount_type: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          name: string
          percentage_of: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          amount_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          name: string
          percentage_of?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          name?: string
          percentage_of?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_allowances: {
        Row: {
          allowance_template_id: string
          created_at: string | null
          custom_amount: number | null
          effective_date: string | null
          employee_id: string
          end_date: string | null
          id: string
        }
        Insert: {
          allowance_template_id: string
          created_at?: string | null
          custom_amount?: number | null
          effective_date?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
        }
        Update: {
          allowance_template_id?: string
          created_at?: string | null
          custom_amount?: number | null
          effective_date?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_allowances_allowance_template_id_fkey"
            columns: ["allowance_template_id"]
            isOneToOne: false
            referencedRelation: "allowance_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_allowances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_deductions: {
        Row: {
          created_at: string | null
          custom_amount: number | null
          deduction_template_id: string
          effective_date: string | null
          employee_id: string
          end_date: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          custom_amount?: number | null
          deduction_template_id: string
          effective_date?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          custom_amount?: number | null
          deduction_template_id?: string
          effective_date?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_deductions_deduction_template_id_fkey"
            columns: ["deduction_template_id"]
            isOneToOne: false
            referencedRelation: "deduction_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_deductions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          department_id: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employee_code: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          join_date: string | null
          last_name: string
          location: string | null
          manager_id: string | null
          nationality: string | null
          phone: string | null
          position_id: string | null
          salary: number | null
          status: Database["public"]["Enums"]["employee_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_code?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          join_date?: string | null
          last_name: string
          location?: string | null
          manager_id?: string | null
          nationality?: string | null
          phone?: string | null
          position_id?: string | null
          salary?: number | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_code?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          join_date?: string | null
          last_name?: string
          location?: string | null
          manager_id?: string | null
          nationality?: string | null
          phone?: string | null
          position_id?: string | null
          salary?: number | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          leave_type_id: string
          pending_days: number | null
          total_days: number
          updated_at: string | null
          used_days: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          leave_type_id: string
          pending_days?: number | null
          total_days?: number
          updated_at?: string | null
          used_days?: number | null
          year: number
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          leave_type_id?: string
          pending_days?: number | null
          total_days?: number
          updated_at?: string | null
          used_days?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string | null
          days_count: number
          employee_id: string
          end_date: string
          id: string
          is_half_day: boolean | null
          leave_type_id: string
          reason: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_count: number
          employee_id: string
          end_date: string
          id?: string
          is_half_day?: boolean | null
          leave_type_id: string
          reason?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_count?: number
          employee_id?: string
          end_date?: string
          id?: string
          is_half_day?: boolean | null
          leave_type_id?: string
          reason?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          max_days_per_year: number | null
          name: string
          requires_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_days_per_year?: number | null
          name: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_days_per_year?: number | null
          name?: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_document_expiration: boolean | null
          email_leave_approvals: boolean | null
          email_leave_submissions: boolean | null
          email_new_employee: boolean | null
          email_payroll_reminders: boolean | null
          email_system_announcements: boolean | null
          email_weekly_summary: boolean | null
          id: string
          push_enabled: boolean | null
          push_new_leave_requests: boolean | null
          push_payroll_deadlines: boolean | null
          push_system_updates: boolean | null
          push_urgent_approvals: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string | null
          user_id: string
          weekend_notifications: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_document_expiration?: boolean | null
          email_leave_approvals?: boolean | null
          email_leave_submissions?: boolean | null
          email_new_employee?: boolean | null
          email_payroll_reminders?: boolean | null
          email_system_announcements?: boolean | null
          email_weekly_summary?: boolean | null
          id?: string
          push_enabled?: boolean | null
          push_new_leave_requests?: boolean | null
          push_payroll_deadlines?: boolean | null
          push_system_updates?: boolean | null
          push_urgent_approvals?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id: string
          weekend_notifications?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_document_expiration?: boolean | null
          email_leave_approvals?: boolean | null
          email_leave_submissions?: boolean | null
          email_new_employee?: boolean | null
          email_payroll_reminders?: boolean | null
          email_system_announcements?: boolean | null
          email_weekly_summary?: boolean | null
          id?: string
          push_enabled?: boolean | null
          push_new_leave_requests?: boolean | null
          push_payroll_deadlines?: boolean | null
          push_system_updates?: boolean | null
          push_urgent_approvals?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id?: string
          weekend_notifications?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          actor_avatar: string | null
          actor_name: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          actor_avatar?: string | null
          actor_name?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          actor_avatar?: string | null
          actor_name?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payroll_records: {
        Row: {
          base_salary: number
          bonuses: number
          created_at: string
          department: string
          employee_id: string
          employee_name: string
          id: string
          insurance_deduction: number
          net_pay: number
          other_deduction: number
          overtime: number
          paid_date: string | null
          payroll_run_id: string | null
          status: string
          tax_deduction: number
        }
        Insert: {
          base_salary?: number
          bonuses?: number
          created_at?: string
          department: string
          employee_id: string
          employee_name: string
          id?: string
          insurance_deduction?: number
          net_pay?: number
          other_deduction?: number
          overtime?: number
          paid_date?: string | null
          payroll_run_id?: string | null
          status?: string
          tax_deduction?: number
        }
        Update: {
          base_salary?: number
          bonuses?: number
          created_at?: string
          department?: string
          employee_id?: string
          employee_name?: string
          id?: string
          insurance_deduction?: number
          net_pay?: number
          other_deduction?: number
          overtime?: number
          paid_date?: string | null
          payroll_run_id?: string | null
          status?: string
          tax_deduction?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          created_at: string
          employee_count: number
          id: string
          pay_period_end: string
          pay_period_start: string
          processed_date: string
          status: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          employee_count?: number
          id?: string
          pay_period_end: string
          pay_period_start: string
          processed_date?: string
          status?: string
          total_amount?: number
        }
        Update: {
          created_at?: string
          employee_count?: number
          id?: string
          pay_period_end?: string
          pay_period_start?: string
          processed_date?: string
          status?: string
          total_amount?: number
        }
        Relationships: []
      }
      positions: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          level: number | null
          title: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          level?: number | null
          title: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          level?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          employee_id: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_history: {
        Row: {
          change_type: Database["public"]["Enums"]["salary_change_type"]
          changed_by: string | null
          created_at: string
          effective_date: string
          employee_id: string
          id: string
          new_salary: number
          previous_salary: number | null
          reason: string | null
        }
        Insert: {
          change_type?: Database["public"]["Enums"]["salary_change_type"]
          changed_by?: string | null
          created_at?: string
          effective_date?: string
          employee_id: string
          id?: string
          new_salary: number
          previous_salary?: number | null
          reason?: string | null
        }
        Update: {
          change_type?: Database["public"]["Enums"]["salary_change_type"]
          changed_by?: string | null
          created_at?: string
          effective_date?: string
          employee_id?: string
          id?: string
          new_salary?: number
          previous_salary?: number | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          compact_mode: boolean | null
          created_at: string | null
          date_format: string | null
          default_page: string | null
          first_day_of_week: string | null
          id: string
          items_per_page: number | null
          language: string | null
          theme: string | null
          time_format: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compact_mode?: boolean | null
          created_at?: string | null
          date_format?: string | null
          default_page?: string | null
          first_day_of_week?: string | null
          id?: string
          items_per_page?: number | null
          language?: string | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compact_mode?: boolean | null
          created_at?: string | null
          date_format?: string | null
          default_page?: string | null
          first_day_of_week?: string | null
          id?: string
          items_per_page?: number | null
          language?: string | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
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
      get_user_employee_id: { Args: { _user_id: string }; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager_of: {
        Args: { _employee_id: string; _manager_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "employee" | "manager" | "hr" | "admin"
      employee_status:
        | "active"
        | "on_leave"
        | "on_boarding"
        | "probation"
        | "terminated"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      salary_change_type:
        | "initial"
        | "adjustment"
        | "promotion"
        | "annual_review"
        | "correction"
        | "bulk_update"
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
      app_role: ["employee", "manager", "hr", "admin"],
      employee_status: [
        "active",
        "on_leave",
        "on_boarding",
        "probation",
        "terminated",
      ],
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      salary_change_type: [
        "initial",
        "adjustment",
        "promotion",
        "annual_review",
        "correction",
        "bulk_update",
      ],
    },
  },
} as const
