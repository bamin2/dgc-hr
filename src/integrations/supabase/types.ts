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
          default_amount: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_taxable: boolean | null
          is_variable: boolean | null
          name: string
          percentage_of: string | null
          updated_at: string | null
          work_location_id: string | null
        }
        Insert: {
          amount?: number
          amount_type?: string
          created_at?: string | null
          default_amount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_taxable?: boolean | null
          is_variable?: boolean | null
          name: string
          percentage_of?: string | null
          updated_at?: string | null
          work_location_id?: string | null
        }
        Update: {
          amount?: number
          amount_type?: string
          created_at?: string | null
          default_amount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_taxable?: boolean | null
          is_variable?: boolean | null
          name?: string
          percentage_of?: string | null
          updated_at?: string | null
          work_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allowance_templates_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["work_location_id"]
          },
          {
            foreignKeyName: "allowance_templates_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "work_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          created_at: string | null
          default_hr_approver_id: string | null
          id: string
          is_active: boolean | null
          request_type: string
          steps: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          default_hr_approver_id?: string | null
          id?: string
          is_active?: boolean | null
          request_type: string
          steps?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          default_hr_approver_id?: string | null
          id?: string
          is_active?: boolean | null
          request_type?: string
          steps?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      attendance_corrections: {
        Row: {
          attendance_record_id: string
          corrected_check_in: string
          corrected_check_out: string | null
          created_at: string
          date: string
          employee_id: string
          hr_notes: string | null
          hr_reviewed_at: string | null
          hr_reviewer_id: string | null
          id: string
          manager_id: string | null
          manager_notes: string | null
          manager_reviewed_at: string | null
          original_check_in: string | null
          original_check_out: string | null
          reason: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["correction_status"]
          updated_at: string
        }
        Insert: {
          attendance_record_id: string
          corrected_check_in: string
          corrected_check_out?: string | null
          created_at?: string
          date: string
          employee_id: string
          hr_notes?: string | null
          hr_reviewed_at?: string | null
          hr_reviewer_id?: string | null
          id?: string
          manager_id?: string | null
          manager_notes?: string | null
          manager_reviewed_at?: string | null
          original_check_in?: string | null
          original_check_out?: string | null
          reason: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          updated_at?: string
        }
        Update: {
          attendance_record_id?: string
          corrected_check_in?: string
          corrected_check_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          hr_notes?: string | null
          hr_reviewed_at?: string | null
          hr_reviewer_id?: string | null
          id?: string
          manager_id?: string | null
          manager_notes?: string | null
          manager_reviewed_at?: string | null
          original_check_in?: string | null
          original_check_out?: string | null
          reason?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_corrections_attendance_record_id_fkey"
            columns: ["attendance_record_id"]
            isOneToOne: false
            referencedRelation: "attendance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "attendance_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_hr_reviewer_id_fkey"
            columns: ["hr_reviewer_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_hr_reviewer_id_fkey"
            columns: ["hr_reviewer_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "attendance_corrections_hr_reviewer_id_fkey"
            columns: ["hr_reviewer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "attendance_corrections_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          employee_id: string | null
          entity_id: string
          entity_type: string
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          employee_id?: string | null
          entity_id: string
          entity_type: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          employee_id?: string | null
          entity_id?: string
          entity_type?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "audit_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      banks: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          swift_code: string | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          swift_code?: string | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          swift_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      benefit_beneficiaries: {
        Row: {
          created_at: string
          date_of_birth: string | null
          enrollment_id: string
          id: string
          name: string
          national_id: string | null
          percentage: number | null
          relationship: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          enrollment_id: string
          id?: string
          name: string
          national_id?: string | null
          percentage?: number | null
          relationship: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          enrollment_id?: string
          id?: string
          name?: string
          national_id?: string | null
          percentage?: number | null
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_beneficiaries_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "benefit_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_claims: {
        Row: {
          amount: number
          approved_amount: number | null
          claim_date: string
          claim_number: string
          created_at: string
          description: string | null
          employee_id: string
          enrollment_id: string
          id: string
          plan_id: string
          provider_name: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_date: string
          status: Database["public"]["Enums"]["claim_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          approved_amount?: number | null
          claim_date: string
          claim_number: string
          created_at?: string
          description?: string | null
          employee_id: string
          enrollment_id: string
          id?: string
          plan_id: string
          provider_name?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_date: string
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_amount?: number | null
          claim_date?: string
          claim_number?: string
          created_at?: string
          description?: string | null
          employee_id?: string
          enrollment_id?: string
          id?: string
          plan_id?: string
          provider_name?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_date?: string
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_claims_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_claims_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "benefit_claims_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_claims_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "benefit_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_claims_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "benefit_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_claims_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_claims_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "benefit_claims_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_coverage_levels: {
        Row: {
          coverage_details: Json | null
          created_at: string
          employee_cost: number
          employer_cost: number
          id: string
          name: string
          plan_id: string
        }
        Insert: {
          coverage_details?: Json | null
          created_at?: string
          employee_cost?: number
          employer_cost?: number
          id?: string
          name: string
          plan_id: string
        }
        Update: {
          coverage_details?: Json | null
          created_at?: string
          employee_cost?: number
          employer_cost?: number
          id?: string
          name?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_coverage_levels_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "benefit_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_enrollments: {
        Row: {
          coverage_level_id: string
          created_at: string
          employee_contribution: number
          employee_id: string
          employer_contribution: number
          end_date: string | null
          id: string
          plan_id: string
          start_date: string
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string
        }
        Insert: {
          coverage_level_id: string
          created_at?: string
          employee_contribution?: number
          employee_id: string
          employer_contribution?: number
          end_date?: string | null
          id?: string
          plan_id: string
          start_date: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
        }
        Update: {
          coverage_level_id?: string
          created_at?: string
          employee_contribution?: number
          employee_id?: string
          employer_contribution?: number
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_enrollments_coverage_level_id_fkey"
            columns: ["coverage_level_id"]
            isOneToOne: false
            referencedRelation: "benefit_coverage_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "benefit_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_enrollments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "benefit_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          enrolled_count: number | null
          expiry_date: string | null
          features: string[] | null
          id: string
          name: string
          policy_document_url: string | null
          provider: string
          status: Database["public"]["Enums"]["benefit_status"]
          type: Database["public"]["Enums"]["benefit_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          enrolled_count?: number | null
          expiry_date?: string | null
          features?: string[] | null
          id?: string
          name: string
          policy_document_url?: string | null
          provider: string
          status?: Database["public"]["Enums"]["benefit_status"]
          type: Database["public"]["Enums"]["benefit_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          enrolled_count?: number | null
          expiry_date?: string | null
          features?: string[] | null
          id?: string
          name?: string
          policy_document_url?: string | null
          provider?: string
          status?: Database["public"]["Enums"]["benefit_status"]
          type?: Database["public"]["Enums"]["benefit_type"]
          updated_at?: string
        }
        Relationships: []
      }
      business_trip_amendments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          change_type: string
          created_at: string | null
          id: string
          original_values: Json
          proposed_values: Json
          reason: string
          rejection_reason: string | null
          status: string | null
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          change_type: string
          created_at?: string | null
          id?: string
          original_values: Json
          proposed_values: Json
          reason: string
          rejection_reason?: string | null
          status?: string | null
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          change_type?: string
          created_at?: string | null
          id?: string
          original_values?: Json
          proposed_values?: Json
          reason?: string
          rejection_reason?: string | null
          status?: string | null
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_trip_amendments_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "business_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      business_trip_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          trip_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          trip_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          trip_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_trip_attachments_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "business_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      business_trip_destinations: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          per_diem_rate_bhd: number
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          per_diem_rate_bhd?: number
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          per_diem_rate_bhd?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      business_trip_expenses: {
        Row: {
          amount_bhd: number
          category: string
          created_at: string | null
          description: string | null
          expense_date: string
          hr_approved_amount_bhd: number | null
          hr_notes: string | null
          hr_status: string | null
          id: string
          receipt_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          trip_id: string
        }
        Insert: {
          amount_bhd: number
          category: string
          created_at?: string | null
          description?: string | null
          expense_date: string
          hr_approved_amount_bhd?: number | null
          hr_notes?: string | null
          hr_status?: string | null
          id?: string
          receipt_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          trip_id: string
        }
        Update: {
          amount_bhd?: number
          category?: string
          created_at?: string | null
          description?: string | null
          expense_date?: string
          hr_approved_amount_bhd?: number | null
          hr_notes?: string | null
          hr_status?: string | null
          id?: string
          receipt_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_trip_expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "business_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      business_trip_settings: {
        Row: {
          allow_cancellation_after_submit: boolean | null
          allow_edit_after_submit: boolean | null
          car_uplift_per_night_bhd: number | null
          email_notifications_enabled: boolean | null
          id: string
          inapp_notifications_enabled: boolean | null
          max_nights_without_override: number | null
          module_enabled: boolean | null
          require_receipts: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          allow_cancellation_after_submit?: boolean | null
          allow_edit_after_submit?: boolean | null
          car_uplift_per_night_bhd?: number | null
          email_notifications_enabled?: boolean | null
          id?: string
          inapp_notifications_enabled?: boolean | null
          max_nights_without_override?: number | null
          module_enabled?: boolean | null
          require_receipts?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          allow_cancellation_after_submit?: boolean | null
          allow_edit_after_submit?: boolean | null
          car_uplift_per_night_bhd?: number | null
          email_notifications_enabled?: boolean | null
          id?: string
          inapp_notifications_enabled?: boolean | null
          max_nights_without_override?: number | null
          module_enabled?: boolean | null
          require_receipts?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      business_trips: {
        Row: {
          car_uplift_per_night_bhd: number | null
          car_uplift_total_bhd: number | null
          closed_at: string | null
          closed_by: string | null
          corporate_card_used: boolean | null
          created_at: string | null
          destination_id: string | null
          employee_id: string
          end_date: string
          flight_details: string | null
          id: string
          nights_count: number
          origin_city: string | null
          origin_country: string | null
          origin_location_id: string | null
          per_diem_budget_bhd: number
          per_diem_payable_bhd: number
          per_diem_rate_bhd: number
          rejection_reason: string | null
          start_date: string
          status: string
          submitted_at: string | null
          travel_mode: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          car_uplift_per_night_bhd?: number | null
          car_uplift_total_bhd?: number | null
          closed_at?: string | null
          closed_by?: string | null
          corporate_card_used?: boolean | null
          created_at?: string | null
          destination_id?: string | null
          employee_id: string
          end_date: string
          flight_details?: string | null
          id?: string
          nights_count: number
          origin_city?: string | null
          origin_country?: string | null
          origin_location_id?: string | null
          per_diem_budget_bhd?: number
          per_diem_payable_bhd?: number
          per_diem_rate_bhd?: number
          rejection_reason?: string | null
          start_date: string
          status?: string
          submitted_at?: string | null
          travel_mode?: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          car_uplift_per_night_bhd?: number | null
          car_uplift_total_bhd?: number | null
          closed_at?: string | null
          closed_by?: string | null
          corporate_card_used?: boolean | null
          created_at?: string | null
          destination_id?: string | null
          employee_id?: string
          end_date?: string
          flight_details?: string | null
          id?: string
          nights_count?: number
          origin_city?: string | null
          origin_country?: string | null
          origin_location_id?: string | null
          per_diem_budget_bhd?: number
          per_diem_payable_bhd?: number
          per_diem_rate_bhd?: number
          rejection_reason?: string | null
          start_date?: string
          status?: string
          submitted_at?: string | null
          travel_mode?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_trips_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "business_trip_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_trips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_trips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "business_trips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_trips_origin_location_id_fkey"
            columns: ["origin_location_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["work_location_id"]
          },
          {
            foreignKeyName: "business_trips_origin_location_id_fkey"
            columns: ["origin_location_id"]
            isOneToOne: false
            referencedRelation: "work_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          color: Database["public"]["Enums"]["event_color"]
          created_at: string
          description: string | null
          end_time: string
          id: string
          is_all_day: boolean | null
          location: string | null
          organizer_id: string | null
          platform: Database["public"]["Enums"]["event_platform"] | null
          recurrence: Database["public"]["Enums"]["event_recurrence"] | null
          start_time: string
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
        }
        Insert: {
          color?: Database["public"]["Enums"]["event_color"]
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          organizer_id?: string | null
          platform?: Database["public"]["Enums"]["event_platform"] | null
          recurrence?: Database["public"]["Enums"]["event_recurrence"] | null
          start_time: string
          title: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Update: {
          color?: Database["public"]["Enums"]["event_color"]
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          organizer_id?: string | null
          platform?: Database["public"]["Enums"]["event_platform"] | null
          recurrence?: Database["public"]["Enums"]["event_recurrence"] | null
          start_time?: string
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "calendar_events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          candidate_code: string
          created_at: string
          created_by: string | null
          department_id: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          manager_employee_id: string | null
          nationality: string | null
          notes: string | null
          phone: string | null
          position_id: string | null
          proposed_start_date: string | null
          status: Database["public"]["Enums"]["candidate_status"]
          updated_at: string
          work_location_id: string | null
        }
        Insert: {
          candidate_code: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          manager_employee_id?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          position_id?: string | null
          proposed_start_date?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
          work_location_id?: string | null
        }
        Update: {
          candidate_code?: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          manager_employee_id?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          position_id?: string | null
          proposed_start_date?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
          work_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "candidates_manager_employee_id_fkey"
            columns: ["manager_employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_manager_employee_id_fkey"
            columns: ["manager_employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "candidates_manager_employee_id_fkey"
            columns: ["manager_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["position_id"]
          },
          {
            foreignKeyName: "candidates_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["work_location_id"]
          },
          {
            foreignKeyName: "candidates_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "work_locations"
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
          dashboard_card_visibility: Json | null
          dashboard_display_type: string | null
          dashboard_icon_name: string | null
          date_format: string | null
          document_logo_url: string | null
          email: string | null
          employee_can_view_compensation: boolean | null
          id: string
          industry: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          payroll_day_of_month: number | null
          phone: string | null
          primary_color: string | null
          reporting_currency: string | null
          show_compensation_line_items: boolean | null
          tax_id: string | null
          timezone: string | null
          updated_at: string | null
          website: string | null
          weekend_days: number[] | null
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
          dashboard_card_visibility?: Json | null
          dashboard_display_type?: string | null
          dashboard_icon_name?: string | null
          date_format?: string | null
          document_logo_url?: string | null
          email?: string | null
          employee_can_view_compensation?: boolean | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          payroll_day_of_month?: number | null
          phone?: string | null
          primary_color?: string | null
          reporting_currency?: string | null
          show_compensation_line_items?: boolean | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          weekend_days?: number[] | null
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
          dashboard_card_visibility?: Json | null
          dashboard_display_type?: string | null
          dashboard_icon_name?: string | null
          date_format?: string | null
          document_logo_url?: string | null
          email?: string | null
          employee_can_view_compensation?: boolean | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          payroll_day_of_month?: number | null
          phone?: string | null
          primary_color?: string | null
          reporting_currency?: string | null
          show_compensation_line_items?: boolean | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          weekend_days?: number[] | null
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
          work_location_id: string | null
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
          work_location_id?: string | null
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
          work_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deduction_templates_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["work_location_id"]
          },
          {
            foreignKeyName: "deduction_templates_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "work_locations"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      document_expiry_notifications: {
        Row: {
          created_at: string | null
          days_before_expiry: number
          employee_document_id: string
          id: string
          is_sent: boolean | null
          notify_employee: boolean | null
          notify_hr: boolean | null
          notify_manager: boolean | null
          sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_before_expiry?: number
          employee_document_id: string
          id?: string
          is_sent?: boolean | null
          notify_employee?: boolean | null
          notify_hr?: boolean | null
          notify_manager?: boolean | null
          sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_before_expiry?: number
          employee_document_id?: string
          id?: string
          is_sent?: boolean | null
          notify_employee?: boolean | null
          notify_hr?: boolean | null
          notify_manager?: boolean | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_expiry_notifications_employee_document_id_fkey"
            columns: ["employee_document_id"]
            isOneToOne: false
            referencedRelation: "employee_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          available_for_request: boolean | null
          category: string
          content: string
          created_at: string
          description: string | null
          docx_template_url: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          available_for_request?: boolean | null
          category: string
          content: string
          created_at?: string
          description?: string | null
          docx_template_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          available_for_request?: boolean | null
          category?: string
          content?: string
          created_at?: string
          description?: string | null
          docx_template_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          requires_expiry: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          requires_expiry?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          requires_expiry?: boolean | null
        }
        Relationships: []
      }
      email_action_tokens: {
        Row: {
          action_type: string
          created_at: string | null
          expires_at: string
          id: string
          request_id: string
          request_type: string
          step_id: string
          token: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          expires_at: string
          id?: string
          request_id: string
          request_type: string
          step_id: string
          token: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          request_id?: string
          request_type?: string
          step_id?: string
          token?: string
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          email_type: string
          employee_id: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_user_id: string | null
          resend_id: string | null
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email_type: string
          employee_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_user_id?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email_type?: string
          employee_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_user_id?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "email_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      email_template_versions: {
        Row: {
          body_content: string
          change_summary: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          subject: string
          template_id: string
          version_number: number
        }
        Insert: {
          body_content: string
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          subject: string
          template_id: string
          version_number: number
        }
        Update: {
          body_content?: string
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          subject?: string
          template_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "email_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_content: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          recipient_config: Json | null
          subject: string
          type: string
          updated_at: string | null
        }
        Insert: {
          body_content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          recipient_config?: Json | null
          subject: string
          type: string
          updated_at?: string | null
        }
        Update: {
          body_content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          recipient_config?: Json | null
          subject?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      employee_allowances: {
        Row: {
          allowance_template_id: string | null
          created_at: string | null
          custom_amount: number | null
          custom_name: string | null
          effective_date: string | null
          employee_id: string
          end_date: string | null
          id: string
          percentage: number | null
        }
        Insert: {
          allowance_template_id?: string | null
          created_at?: string | null
          custom_amount?: number | null
          custom_name?: string | null
          effective_date?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          percentage?: number | null
        }
        Update: {
          allowance_template_id?: string | null
          created_at?: string | null
          custom_amount?: number | null
          custom_name?: string | null
          effective_date?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          percentage?: number | null
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
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_allowances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
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
      employee_conversion_log: {
        Row: {
          candidate_id: string
          converted_at: string
          converted_by: string | null
          employee_id: string
          id: string
          offer_id: string
          offer_version_id: string
        }
        Insert: {
          candidate_id: string
          converted_at?: string
          converted_by?: string | null
          employee_id: string
          id?: string
          offer_id: string
          offer_version_id: string
        }
        Update: {
          candidate_id?: string
          converted_at?: string
          converted_by?: string | null
          employee_id?: string
          id?: string
          offer_id?: string
          offer_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_conversion_log_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_conversion_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_conversion_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "employee_conversion_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_conversion_log_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_conversion_log_offer_version_id_fkey"
            columns: ["offer_version_id"]
            isOneToOne: false
            referencedRelation: "offer_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_deductions: {
        Row: {
          created_at: string | null
          custom_amount: number | null
          custom_name: string | null
          deduction_template_id: string | null
          effective_date: string | null
          employee_id: string
          end_date: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          custom_amount?: number | null
          custom_name?: string | null
          deduction_template_id?: string | null
          effective_date?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          custom_amount?: number | null
          custom_name?: string | null
          deduction_template_id?: string | null
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
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_deductions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
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
      employee_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_number: string | null
          document_type_id: string
          employee_id: string
          expiry_date: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          issue_date: string | null
          mime_type: string | null
          notes: string | null
          updated_at: string | null
          uploaded_by: string | null
          visible_to_employee: boolean | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_number?: string | null
          document_type_id: string
          employee_id: string
          expiry_date?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          issue_date?: string | null
          mime_type?: string | null
          notes?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          visible_to_employee?: boolean | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_number?: string | null
          document_type_id?: string
          employee_id?: string
          expiry_date?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          issue_date?: string | null
          mime_type?: string | null
          notes?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          visible_to_employee?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_imports: {
        Row: {
          created_at: string | null
          failed_records: number
          filename: string | null
          id: string
          imported_at: string | null
          imported_by: string | null
          rolled_back_at: string | null
          rolled_back_by: string | null
          status: string | null
          successful_records: number
          total_records: number
        }
        Insert: {
          created_at?: string | null
          failed_records?: number
          filename?: string | null
          id?: string
          imported_at?: string | null
          imported_by?: string | null
          rolled_back_at?: string | null
          rolled_back_by?: string | null
          status?: string | null
          successful_records: number
          total_records: number
        }
        Update: {
          created_at?: string | null
          failed_records?: number
          filename?: string | null
          id?: string
          imported_at?: string | null
          imported_by?: string | null
          rolled_back_at?: string | null
          rolled_back_by?: string | null
          status?: string | null
          successful_records?: number
          total_records?: number
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          avatar_url: string | null
          bank_account_number: string | null
          bank_name: string | null
          country: string | null
          cpr_number: string | null
          created_at: string
          date_of_birth: string | null
          department_id: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employee_code: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          first_name: string
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          gosi_registered_salary: number | null
          iban: string | null
          id: string
          import_batch_id: string | null
          is_subject_to_gosi: boolean | null
          join_date: string | null
          last_name: string
          location: string | null
          manager_id: string | null
          nationality: string | null
          offer_letter_template: string | null
          passport_number: string | null
          pay_frequency: Database["public"]["Enums"]["pay_frequency"] | null
          phone: string | null
          position_id: string | null
          preferred_name: string | null
          salary: number | null
          salary_currency_code: string | null
          search_vector: unknown
          second_name: string | null
          send_offer_letter: boolean | null
          status: Database["public"]["Enums"]["employee_status"]
          tax_exemption_status: string | null
          updated_at: string
          user_id: string | null
          work_location: string | null
          work_location_id: string | null
          worker_type: Database["public"]["Enums"]["worker_type"] | null
          direct_reports: {
            address: string | null
            avatar_url: string | null
            bank_account_number: string | null
            bank_name: string | null
            country: string | null
            cpr_number: string | null
            created_at: string
            date_of_birth: string | null
            department_id: string | null
            email: string
            emergency_contact_name: string | null
            emergency_contact_phone: string | null
            emergency_contact_relationship: string | null
            employee_code: string | null
            employment_type:
              | Database["public"]["Enums"]["employment_type"]
              | null
            first_name: string
            full_name: string | null
            gender: Database["public"]["Enums"]["gender_type"] | null
            gosi_registered_salary: number | null
            iban: string | null
            id: string
            import_batch_id: string | null
            is_subject_to_gosi: boolean | null
            join_date: string | null
            last_name: string
            location: string | null
            manager_id: string | null
            nationality: string | null
            offer_letter_template: string | null
            passport_number: string | null
            pay_frequency: Database["public"]["Enums"]["pay_frequency"] | null
            phone: string | null
            position_id: string | null
            preferred_name: string | null
            salary: number | null
            salary_currency_code: string | null
            search_vector: unknown
            second_name: string | null
            send_offer_letter: boolean | null
            status: Database["public"]["Enums"]["employee_status"]
            tax_exemption_status: string | null
            updated_at: string
            user_id: string | null
            work_location: string | null
            work_location_id: string | null
            worker_type: Database["public"]["Enums"]["worker_type"] | null
          } | null
          manager: {
            address: string | null
            avatar_url: string | null
            bank_account_number: string | null
            bank_name: string | null
            country: string | null
            cpr_number: string | null
            created_at: string
            date_of_birth: string | null
            department_id: string | null
            email: string
            emergency_contact_name: string | null
            emergency_contact_phone: string | null
            emergency_contact_relationship: string | null
            employee_code: string | null
            employment_type:
              | Database["public"]["Enums"]["employment_type"]
              | null
            first_name: string
            full_name: string | null
            gender: Database["public"]["Enums"]["gender_type"] | null
            gosi_registered_salary: number | null
            iban: string | null
            id: string
            import_batch_id: string | null
            is_subject_to_gosi: boolean | null
            join_date: string | null
            last_name: string
            location: string | null
            manager_id: string | null
            nationality: string | null
            offer_letter_template: string | null
            passport_number: string | null
            pay_frequency: Database["public"]["Enums"]["pay_frequency"] | null
            phone: string | null
            position_id: string | null
            preferred_name: string | null
            salary: number | null
            salary_currency_code: string | null
            search_vector: unknown
            second_name: string | null
            send_offer_letter: boolean | null
            status: Database["public"]["Enums"]["employee_status"]
            tax_exemption_status: string | null
            updated_at: string
            user_id: string | null
            work_location: string | null
            work_location_id: string | null
            worker_type: Database["public"]["Enums"]["worker_type"] | null
          } | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          country?: string | null
          cpr_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_code?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          first_name: string
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          gosi_registered_salary?: number | null
          iban?: string | null
          id?: string
          import_batch_id?: string | null
          is_subject_to_gosi?: boolean | null
          join_date?: string | null
          last_name: string
          location?: string | null
          manager_id?: string | null
          nationality?: string | null
          offer_letter_template?: string | null
          passport_number?: string | null
          pay_frequency?: Database["public"]["Enums"]["pay_frequency"] | null
          phone?: string | null
          position_id?: string | null
          preferred_name?: string | null
          salary?: number | null
          salary_currency_code?: string | null
          search_vector?: unknown
          second_name?: string | null
          send_offer_letter?: boolean | null
          status?: Database["public"]["Enums"]["employee_status"]
          tax_exemption_status?: string | null
          updated_at?: string
          user_id?: string | null
          work_location?: string | null
          work_location_id?: string | null
          worker_type?: Database["public"]["Enums"]["worker_type"] | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          country?: string | null
          cpr_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_code?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          first_name?: string
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          gosi_registered_salary?: number | null
          iban?: string | null
          id?: string
          import_batch_id?: string | null
          is_subject_to_gosi?: boolean | null
          join_date?: string | null
          last_name?: string
          location?: string | null
          manager_id?: string | null
          nationality?: string | null
          offer_letter_template?: string | null
          passport_number?: string | null
          pay_frequency?: Database["public"]["Enums"]["pay_frequency"] | null
          phone?: string | null
          position_id?: string | null
          preferred_name?: string | null
          salary?: number | null
          salary_currency_code?: string | null
          search_vector?: unknown
          second_name?: string | null
          send_offer_letter?: boolean | null
          status?: Database["public"]["Enums"]["employee_status"]
          tax_exemption_status?: string | null
          updated_at?: string
          user_id?: string | null
          work_location?: string | null
          work_location_id?: string | null
          worker_type?: Database["public"]["Enums"]["worker_type"] | null
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
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "employees_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "employee_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
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
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["position_id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["work_location_id"]
          },
          {
            foreignKeyName: "employees_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "work_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          created_at: string
          employee_id: string
          event_id: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          event_id: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          event_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "event_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      exit_interviews: {
        Row: {
          completed: boolean | null
          created_at: string
          format: Database["public"]["Enums"]["interview_format"] | null
          id: string
          interviewer_id: string | null
          notes: string | null
          offboarding_record_id: string
          scheduled_date: string | null
          scheduled_time: string | null
          skip_interview: boolean | null
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          format?: Database["public"]["Enums"]["interview_format"] | null
          id?: string
          interviewer_id?: string | null
          notes?: string | null
          offboarding_record_id: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          skip_interview?: boolean | null
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          format?: Database["public"]["Enums"]["interview_format"] | null
          id?: string
          interviewer_id?: string | null
          notes?: string | null
          offboarding_record_id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          skip_interview?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exit_interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "exit_interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_interviews_offboarding_record_id_fkey"
            columns: ["offboarding_record_id"]
            isOneToOne: false
            referencedRelation: "offboarding_records"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rates: {
        Row: {
          base_currency_code: string
          created_at: string | null
          created_by: string | null
          effective_date: string
          id: string
          quote_currency_code: string
          rate: number
          updated_at: string | null
        }
        Insert: {
          base_currency_code?: string
          created_at?: string | null
          created_by?: string | null
          effective_date: string
          id?: string
          quote_currency_code: string
          rate: number
          updated_at?: string | null
        }
        Update: {
          base_currency_code?: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string
          id?: string
          quote_currency_code?: string
          rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      generated_documents: {
        Row: {
          content: string
          employee_id: string | null
          generated_at: string
          generated_by: string | null
          id: string
          name: string
          template_id: string | null
        }
        Insert: {
          content: string
          employee_id?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          name: string
          template_id?: string | null
        }
        Update: {
          content?: string
          employee_id?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          name?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "generated_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "generated_documents_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_document_requests: {
        Row: {
          created_at: string
          employee_id: string
          generated_document_id: string | null
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status: string
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          generated_document_id?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          generated_document_id?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_document_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_document_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "hr_document_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_document_requests_generated_document_id_fkey"
            columns: ["generated_document_id"]
            isOneToOne: false
            referencedRelation: "generated_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_document_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_document_requests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balance_adjustments: {
        Row: {
          adjusted_by: string | null
          adjustment_days: number
          adjustment_type: string
          created_at: string | null
          employee_id: string
          id: string
          leave_balance_id: string
          leave_type_id: string
          reason: string | null
        }
        Insert: {
          adjusted_by?: string | null
          adjustment_days: number
          adjustment_type: string
          created_at?: string | null
          employee_id: string
          id?: string
          leave_balance_id: string
          leave_type_id: string
          reason?: string | null
        }
        Update: {
          adjusted_by?: string | null
          adjustment_days?: number
          adjustment_type?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          leave_balance_id?: string
          leave_type_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_balance_adjustments_adjusted_by_fkey"
            columns: ["adjusted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balance_adjustments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balance_adjustments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "leave_balance_adjustments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balance_adjustments_leave_balance_id_fkey"
            columns: ["leave_balance_id"]
            isOneToOne: false
            referencedRelation: "leave_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balance_adjustments_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_balance_summary_mv"
            referencedColumns: ["leave_type_id"]
          },
          {
            foreignKeyName: "leave_balance_adjustments_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          available_days: number | null
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
          available_days?: number | null
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
          available_days?: number | null
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
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
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
            referencedRelation: "leave_balance_summary_mv"
            referencedColumns: ["leave_type_id"]
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
          results_in_negative_balance: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          submitted_at: string | null
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
          results_in_negative_balance?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          submitted_at?: string | null
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
          results_in_negative_balance?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
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
            referencedRelation: "leave_balance_summary_mv"
            referencedColumns: ["leave_type_id"]
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
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
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
          allow_carryover: boolean | null
          color: string | null
          count_weekends: boolean | null
          created_at: string | null
          description: string | null
          document_required_after_days: number | null
          has_salary_deduction: boolean | null
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          max_carryover_days: number | null
          max_consecutive_days: number | null
          max_days_per_year: number | null
          min_days_notice: number | null
          name: string
          requires_approval: boolean | null
          requires_document: boolean | null
          salary_deduction_tiers: Json | null
          updated_at: string | null
          visible_to_employees: boolean | null
        }
        Insert: {
          allow_carryover?: boolean | null
          color?: string | null
          count_weekends?: boolean | null
          created_at?: string | null
          description?: string | null
          document_required_after_days?: number | null
          has_salary_deduction?: boolean | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_carryover_days?: number | null
          max_consecutive_days?: number | null
          max_days_per_year?: number | null
          min_days_notice?: number | null
          name: string
          requires_approval?: boolean | null
          requires_document?: boolean | null
          salary_deduction_tiers?: Json | null
          updated_at?: string | null
          visible_to_employees?: boolean | null
        }
        Update: {
          allow_carryover?: boolean | null
          color?: string | null
          count_weekends?: boolean | null
          created_at?: string | null
          description?: string | null
          document_required_after_days?: number | null
          has_salary_deduction?: boolean | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_carryover_days?: number | null
          max_consecutive_days?: number | null
          max_days_per_year?: number | null
          min_days_notice?: number | null
          name?: string
          requires_approval?: boolean | null
          requires_document?: boolean | null
          salary_deduction_tiers?: Json | null
          updated_at?: string | null
          visible_to_employees?: boolean | null
        }
        Relationships: []
      }
      loan_events: {
        Row: {
          affected_installment_id: string | null
          amount_delta: number | null
          created_at: string
          created_by: string | null
          effective_date: string
          event_type: string
          id: string
          loan_id: string
          new_duration_months: number | null
          new_installment_amount: number | null
          notes: string | null
        }
        Insert: {
          affected_installment_id?: string | null
          amount_delta?: number | null
          created_at?: string
          created_by?: string | null
          effective_date: string
          event_type: string
          id?: string
          loan_id: string
          new_duration_months?: number | null
          new_installment_amount?: number | null
          notes?: string | null
        }
        Update: {
          affected_installment_id?: string | null
          amount_delta?: number | null
          created_at?: string
          created_by?: string | null
          effective_date?: string
          event_type?: string
          id?: string
          loan_id?: string
          new_duration_months?: number | null
          new_installment_amount?: number | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_events_affected_installment_id_fkey"
            columns: ["affected_installment_id"]
            isOneToOne: false
            referencedRelation: "loan_installments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_events_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_installments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          is_partial_payment: boolean | null
          loan_id: string
          original_amount: number | null
          paid_at: string | null
          paid_in_payroll_run_id: string | null
          paid_method: string | null
          rescheduled_from_installment_id: string | null
          schedule_version: number | null
          skipped_reason: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          is_partial_payment?: boolean | null
          loan_id: string
          original_amount?: number | null
          paid_at?: string | null
          paid_in_payroll_run_id?: string | null
          paid_method?: string | null
          rescheduled_from_installment_id?: string | null
          schedule_version?: number | null
          skipped_reason?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          is_partial_payment?: boolean | null
          loan_id?: string
          original_amount?: number | null
          paid_at?: string | null
          paid_in_payroll_run_id?: string | null
          paid_method?: string | null
          rescheduled_from_installment_id?: string | null
          schedule_version?: number | null
          skipped_reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_installments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_installments_paid_in_payroll_run_id_fkey"
            columns: ["paid_in_payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_installments_paid_in_payroll_run_id_fkey"
            columns: ["paid_in_payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_summary_mv"
            referencedColumns: ["payroll_run_id"]
          },
          {
            foreignKeyName: "loan_installments_rescheduled_from_installment_id_fkey"
            columns: ["rescheduled_from_installment_id"]
            isOneToOne: false
            referencedRelation: "loan_installments"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          deduct_from_payroll: boolean
          disbursed_at: string | null
          duration_months: number | null
          employee_id: string
          id: string
          installment_amount: number | null
          notes: string | null
          principal_amount: number
          repayment_frequency: string
          requested_by: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          deduct_from_payroll?: boolean
          disbursed_at?: string | null
          duration_months?: number | null
          employee_id: string
          id?: string
          installment_amount?: number | null
          notes?: string | null
          principal_amount: number
          repayment_frequency?: string
          requested_by?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          deduct_from_payroll?: boolean
          disbursed_at?: string | null
          duration_months?: number | null
          employee_id?: string
          id?: string
          installment_amount?: number | null
          notes?: string | null
          principal_amount?: number
          repayment_frequency?: string
          requested_by?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      offboarding_access_systems: {
        Row: {
          access_level: string | null
          created_at: string
          id: string
          name: string
          offboarding_record_id: string
          revocation_date: string | null
          revoked_at: string | null
          revoked_by: string | null
          status: Database["public"]["Enums"]["access_status"]
          type: Database["public"]["Enums"]["access_system_type"]
          updated_at: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string
          id?: string
          name: string
          offboarding_record_id: string
          revocation_date?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["access_status"]
          type?: Database["public"]["Enums"]["access_system_type"]
          updated_at?: string
        }
        Update: {
          access_level?: string | null
          created_at?: string
          id?: string
          name?: string
          offboarding_record_id?: string
          revocation_date?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["access_status"]
          type?: Database["public"]["Enums"]["access_system_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_access_systems_offboarding_record_id_fkey"
            columns: ["offboarding_record_id"]
            isOneToOne: false
            referencedRelation: "offboarding_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_access_systems_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_access_systems_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "offboarding_access_systems_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_assets: {
        Row: {
          condition: Database["public"]["Enums"]["asset_condition"]
          created_at: string
          id: string
          name: string
          notes: string | null
          offboarding_record_id: string
          returned_at: string | null
          serial_number: string | null
          type: Database["public"]["Enums"]["asset_type"]
          updated_at: string
        }
        Insert: {
          condition?: Database["public"]["Enums"]["asset_condition"]
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          offboarding_record_id: string
          returned_at?: string | null
          serial_number?: string | null
          type?: Database["public"]["Enums"]["asset_type"]
          updated_at?: string
        }
        Update: {
          condition?: Database["public"]["Enums"]["asset_condition"]
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          offboarding_record_id?: string
          returned_at?: string | null
          serial_number?: string | null
          type?: Database["public"]["Enums"]["asset_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_assets_offboarding_record_id_fkey"
            columns: ["offboarding_record_id"]
            isOneToOne: false
            referencedRelation: "offboarding_records"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_records: {
        Row: {
          created_at: string
          data_backup_required: boolean | null
          departure_reason: Database["public"]["Enums"]["departure_reason"]
          email_forwarding: boolean | null
          employee_id: string
          hr_contact_id: string | null
          id: string
          it_contact_id: string | null
          last_working_day: string
          manager_confirmed: boolean | null
          notes: string | null
          notice_period_status:
            | Database["public"]["Enums"]["notice_period_status"]
            | null
          resignation_letter_received: boolean | null
          status: Database["public"]["Enums"]["offboarding_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_backup_required?: boolean | null
          departure_reason?: Database["public"]["Enums"]["departure_reason"]
          email_forwarding?: boolean | null
          employee_id: string
          hr_contact_id?: string | null
          id?: string
          it_contact_id?: string | null
          last_working_day: string
          manager_confirmed?: boolean | null
          notes?: string | null
          notice_period_status?:
            | Database["public"]["Enums"]["notice_period_status"]
            | null
          resignation_letter_received?: boolean | null
          status?: Database["public"]["Enums"]["offboarding_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_backup_required?: boolean | null
          departure_reason?: Database["public"]["Enums"]["departure_reason"]
          email_forwarding?: boolean | null
          employee_id?: string
          hr_contact_id?: string | null
          id?: string
          it_contact_id?: string | null
          last_working_day?: string
          manager_confirmed?: boolean | null
          notes?: string | null
          notice_period_status?:
            | Database["public"]["Enums"]["notice_period_status"]
            | null
          resignation_letter_received?: boolean | null
          status?: Database["public"]["Enums"]["offboarding_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "offboarding_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_records_hr_contact_id_fkey"
            columns: ["hr_contact_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_records_hr_contact_id_fkey"
            columns: ["hr_contact_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "offboarding_records_hr_contact_id_fkey"
            columns: ["hr_contact_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_records_it_contact_id_fkey"
            columns: ["it_contact_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_records_it_contact_id_fkey"
            columns: ["it_contact_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "offboarding_records_it_contact_id_fkey"
            columns: ["it_contact_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_emails: {
        Row: {
          body_rendered: string
          error_message: string | null
          id: string
          offer_version_id: string
          provider_message_id: string | null
          sent_at: string | null
          sent_by: string | null
          status: Database["public"]["Enums"]["offer_email_status"]
          subject: string
          to_email: string
        }
        Insert: {
          body_rendered: string
          error_message?: string | null
          id?: string
          offer_version_id: string
          provider_message_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["offer_email_status"]
          subject: string
          to_email: string
        }
        Update: {
          body_rendered?: string
          error_message?: string | null
          id?: string
          offer_version_id?: string
          provider_message_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["offer_email_status"]
          subject?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_emails_offer_version_id_fkey"
            columns: ["offer_version_id"]
            isOneToOne: false
            referencedRelation: "offer_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_letter_templates: {
        Row: {
          body_template: string | null
          created_at: string
          description: string | null
          docx_original_filename: string | null
          docx_template_url: string | null
          id: string
          is_active: boolean
          placeholders_supported: string[] | null
          subject_template: string | null
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          body_template?: string | null
          created_at?: string
          description?: string | null
          docx_original_filename?: string | null
          docx_template_url?: string | null
          id?: string
          is_active?: boolean
          placeholders_supported?: string[] | null
          subject_template?: string | null
          template_name: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          body_template?: string | null
          created_at?: string
          description?: string | null
          docx_original_filename?: string | null
          docx_template_url?: string | null
          id?: string
          is_active?: boolean
          placeholders_supported?: string[] | null
          subject_template?: string | null
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      offer_versions: {
        Row: {
          accepted_at: string | null
          basic_salary: number
          change_reason: string | null
          created_at: string
          created_by: string | null
          currency_code: string
          deductions_fixed: number
          deductions_total: number
          department_id: string | null
          effective_date: string | null
          employer_gosi_amount: number
          gosi_employee_amount: number | null
          gross_pay_total: number | null
          housing_allowance: number
          id: string
          is_subject_to_gosi: boolean | null
          manager_employee_id: string | null
          net_pay_estimate: number | null
          offer_expiry_date: string | null
          offer_id: string
          other_allowances: number
          other_deductions: number | null
          pdf_storage_path: string | null
          position_id: string | null
          rejected_at: string | null
          remarks_internal: string | null
          sent_at: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["offer_version_status"]
          superseded_at: string | null
          template_id: string | null
          transport_allowance: number
          version_number: number
          work_location_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          basic_salary?: number
          change_reason?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deductions_fixed?: number
          deductions_total?: number
          department_id?: string | null
          effective_date?: string | null
          employer_gosi_amount?: number
          gosi_employee_amount?: number | null
          gross_pay_total?: number | null
          housing_allowance?: number
          id?: string
          is_subject_to_gosi?: boolean | null
          manager_employee_id?: string | null
          net_pay_estimate?: number | null
          offer_expiry_date?: string | null
          offer_id: string
          other_allowances?: number
          other_deductions?: number | null
          pdf_storage_path?: string | null
          position_id?: string | null
          rejected_at?: string | null
          remarks_internal?: string | null
          sent_at?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["offer_version_status"]
          superseded_at?: string | null
          template_id?: string | null
          transport_allowance?: number
          version_number?: number
          work_location_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          basic_salary?: number
          change_reason?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deductions_fixed?: number
          deductions_total?: number
          department_id?: string | null
          effective_date?: string | null
          employer_gosi_amount?: number
          gosi_employee_amount?: number | null
          gross_pay_total?: number | null
          housing_allowance?: number
          id?: string
          is_subject_to_gosi?: boolean | null
          manager_employee_id?: string | null
          net_pay_estimate?: number | null
          offer_expiry_date?: string | null
          offer_id?: string
          other_allowances?: number
          other_deductions?: number | null
          pdf_storage_path?: string | null
          position_id?: string | null
          rejected_at?: string | null
          remarks_internal?: string | null
          sent_at?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["offer_version_status"]
          superseded_at?: string | null
          template_id?: string | null
          transport_allowance?: number
          version_number?: number
          work_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_versions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_versions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "offer_versions_manager_employee_id_fkey"
            columns: ["manager_employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_versions_manager_employee_id_fkey"
            columns: ["manager_employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "offer_versions_manager_employee_id_fkey"
            columns: ["manager_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_versions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_versions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["position_id"]
          },
          {
            foreignKeyName: "offer_versions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "offer_letter_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_versions_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["work_location_id"]
          },
          {
            foreignKeyName: "offer_versions_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "work_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          candidate_id: string
          created_at: string
          created_by: string | null
          current_version_id: string | null
          id: string
          offer_code: string
          status: Database["public"]["Enums"]["offer_status"]
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          id?: string
          offer_code: string
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          id?: string
          offer_code?: string
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_current_version_id_fkey"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "offer_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_records: {
        Row: {
          buddy_id: string | null
          completed_on: string | null
          created_at: string
          employee_id: string
          hr_contact_id: string | null
          id: string
          it_contact_id: string | null
          manager_id: string | null
          scheduled_completion: string | null
          start_date: string
          status: Database["public"]["Enums"]["onboarding_status"]
          updated_at: string
          welcome_message: string | null
          workflow_id: string | null
          workflow_name: string
        }
        Insert: {
          buddy_id?: string | null
          completed_on?: string | null
          created_at?: string
          employee_id: string
          hr_contact_id?: string | null
          id?: string
          it_contact_id?: string | null
          manager_id?: string | null
          scheduled_completion?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["onboarding_status"]
          updated_at?: string
          welcome_message?: string | null
          workflow_id?: string | null
          workflow_name: string
        }
        Update: {
          buddy_id?: string | null
          completed_on?: string | null
          created_at?: string
          employee_id?: string
          hr_contact_id?: string | null
          id?: string
          it_contact_id?: string | null
          manager_id?: string | null
          scheduled_completion?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["onboarding_status"]
          updated_at?: string
          welcome_message?: string | null
          workflow_id?: string | null
          workflow_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_records_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_records_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "onboarding_records_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "onboarding_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_records_hr_contact_id_fkey"
            columns: ["hr_contact_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_records_hr_contact_id_fkey"
            columns: ["hr_contact_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "onboarding_records_hr_contact_id_fkey"
            columns: ["hr_contact_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_records_it_contact_id_fkey"
            columns: ["it_contact_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_records_it_contact_id_fkey"
            columns: ["it_contact_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "onboarding_records_it_contact_id_fkey"
            columns: ["it_contact_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_records_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_records_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "onboarding_records_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_records_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "onboarding_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          assigned_to: Database["public"]["Enums"]["task_assignee"]
          category: Database["public"]["Enums"]["task_category"]
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_required: boolean | null
          onboarding_record_id: string
          status: Database["public"]["Enums"]["task_status"]
          task_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: Database["public"]["Enums"]["task_assignee"]
          category?: Database["public"]["Enums"]["task_category"]
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_required?: boolean | null
          onboarding_record_id: string
          status?: Database["public"]["Enums"]["task_status"]
          task_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: Database["public"]["Enums"]["task_assignee"]
          category?: Database["public"]["Enums"]["task_category"]
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_required?: boolean | null
          onboarding_record_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "onboarding_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_tasks_onboarding_record_id_fkey"
            columns: ["onboarding_record_id"]
            isOneToOne: false
            referencedRelation: "onboarding_records"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_workflow_tasks: {
        Row: {
          assigned_to: Database["public"]["Enums"]["task_assignee"]
          category: Database["public"]["Enums"]["task_category"]
          created_at: string
          description: string | null
          due_days_offset: number | null
          id: string
          is_required: boolean | null
          task_order: number | null
          title: string
          workflow_id: string
        }
        Insert: {
          assigned_to?: Database["public"]["Enums"]["task_assignee"]
          category?: Database["public"]["Enums"]["task_category"]
          created_at?: string
          description?: string | null
          due_days_offset?: number | null
          id?: string
          is_required?: boolean | null
          task_order?: number | null
          title: string
          workflow_id: string
        }
        Update: {
          assigned_to?: Database["public"]["Enums"]["task_assignee"]
          category?: Database["public"]["Enums"]["task_category"]
          created_at?: string
          description?: string | null
          due_days_offset?: number | null
          id?: string
          is_required?: boolean | null
          task_order?: number | null
          title?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_workflow_tasks_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "onboarding_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_workflows: {
        Row: {
          categories: Database["public"]["Enums"]["task_category"][] | null
          created_at: string
          description: string | null
          estimated_days: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          categories?: Database["public"]["Enums"]["task_category"][] | null
          created_at?: string
          description?: string | null
          estimated_days?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          categories?: Database["public"]["Enums"]["task_category"][] | null
          created_at?: string
          description?: string | null
          estimated_days?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
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
          {
            foreignKeyName: "payroll_records_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_summary_mv"
            referencedColumns: ["payroll_run_id"]
          },
        ]
      }
      payroll_run_adjustments: {
        Row: {
          amount: number
          created_at: string | null
          employee_id: string
          id: string
          name: string
          notes: string | null
          payroll_run_id: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          employee_id: string
          id?: string
          name: string
          notes?: string | null
          payroll_run_id: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          employee_id?: string
          id?: string
          name?: string
          notes?: string | null
          payroll_run_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_run_adjustments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_run_adjustments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "payroll_run_adjustments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_run_adjustments_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_run_adjustments_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_summary_mv"
            referencedColumns: ["payroll_run_id"]
          },
        ]
      }
      payroll_run_employees: {
        Row: {
          base_salary: number | null
          created_at: string | null
          department: string | null
          employee_code: string | null
          employee_id: string
          employee_name: string
          gosi_deduction: number | null
          gross_pay: number | null
          housing_allowance: number | null
          id: string
          net_pay: number | null
          other_allowances: Json | null
          other_deductions: Json | null
          payroll_run_id: string
          position: string | null
          total_deductions: number | null
          transportation_allowance: number | null
        }
        Insert: {
          base_salary?: number | null
          created_at?: string | null
          department?: string | null
          employee_code?: string | null
          employee_id: string
          employee_name: string
          gosi_deduction?: number | null
          gross_pay?: number | null
          housing_allowance?: number | null
          id?: string
          net_pay?: number | null
          other_allowances?: Json | null
          other_deductions?: Json | null
          payroll_run_id: string
          position?: string | null
          total_deductions?: number | null
          transportation_allowance?: number | null
        }
        Update: {
          base_salary?: number | null
          created_at?: string | null
          department?: string | null
          employee_code?: string | null
          employee_id?: string
          employee_name?: string
          gosi_deduction?: number | null
          gross_pay?: number | null
          housing_allowance?: number | null
          id?: string
          net_pay?: number | null
          other_allowances?: Json | null
          other_deductions?: Json | null
          payroll_run_id?: string
          position?: string | null
          total_deductions?: number | null
          transportation_allowance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_run_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_run_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "payroll_run_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_run_employees_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_run_employees_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_summary_mv"
            referencedColumns: ["payroll_run_id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          created_at: string
          created_by: string | null
          employee_count: number
          id: string
          location_id: string | null
          pay_period_end: string
          pay_period_start: string
          processed_date: string
          status: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          employee_count?: number
          id?: string
          location_id?: string | null
          pay_period_end: string
          pay_period_start: string
          processed_date?: string
          status?: string
          total_amount?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          employee_count?: number
          id?: string
          location_id?: string | null
          pay_period_end?: string
          pay_period_start?: string
          processed_date?: string
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["work_location_id"]
          },
          {
            foreignKeyName: "payroll_runs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "work_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      payslip_documents: {
        Row: {
          currency_code: string
          employee_id: string
          generated_at: string
          generated_by: string | null
          id: string
          metadata: Json
          payroll_run_id: string
          pdf_storage_path: string
          period_end: string
          period_start: string
          status: string
          template_id: string
        }
        Insert: {
          currency_code?: string
          employee_id: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          metadata?: Json
          payroll_run_id: string
          pdf_storage_path: string
          period_end: string
          period_start: string
          status?: string
          template_id: string
        }
        Update: {
          currency_code?: string
          employee_id?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          metadata?: Json
          payroll_run_id?: string
          pdf_storage_path?: string
          period_end?: string
          period_start?: string
          status?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payslip_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslip_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "payslip_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslip_documents_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslip_documents_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_summary_mv"
            referencedColumns: ["payroll_run_id"]
          },
          {
            foreignKeyName: "payslip_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "payslip_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payslip_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          docx_storage_path: string
          effective_from: string | null
          id: string
          is_default: boolean
          name: string
          original_filename: string | null
          settings: Json
          status: string
          updated_at: string
          version_number: number
          work_location_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          docx_storage_path: string
          effective_from?: string | null
          id?: string
          is_default?: boolean
          name: string
          original_filename?: string | null
          settings?: Json
          status?: string
          updated_at?: string
          version_number?: number
          work_location_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          docx_storage_path?: string
          effective_from?: string | null
          id?: string
          is_default?: boolean
          name?: string
          original_filename?: string | null
          settings?: Json
          status?: string
          updated_at?: string
          version_number?: number
          work_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payslip_templates_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["work_location_id"]
          },
          {
            foreignKeyName: "payslip_templates_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "work_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          job_description: string | null
          level: number | null
          title: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          job_description?: string | null
          level?: number | null
          title: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          job_description?: string | null
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
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["department_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
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
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          actor_id: string | null
          comment: string | null
          created_at: string
          id: string
          mentioned_employee_ids: string[] | null
          metadata: Json | null
          new_status: Database["public"]["Enums"]["project_status"] | null
          old_status: Database["public"]["Enums"]["project_status"] | null
          project_id: string
          target_employee_id: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          actor_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          mentioned_employee_ids?: string[] | null
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["project_status"] | null
          old_status?: Database["public"]["Enums"]["project_status"] | null
          project_id: string
          target_employee_id?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          actor_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          mentioned_employee_ids?: string[] | null
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["project_status"] | null
          old_status?: Database["public"]["Enums"]["project_status"] | null
          project_id?: string
          target_employee_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "project_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activities_target_employee_id_fkey"
            columns: ["target_employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activities_target_employee_id_fkey"
            columns: ["target_employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "project_activities_target_employee_id_fkey"
            columns: ["target_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          project_id: string
          role: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          project_id: string
          role?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "project_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
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
          created_by: string | null
          department_id: string | null
          description: string | null
          due_date: string | null
          end_date: string | null
          id: string
          owner_id: string | null
          priority: Database["public"]["Enums"]["project_priority"]
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["project_priority"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["project_priority"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      public_holidays: {
        Row: {
          compensation_reason: string | null
          created_at: string | null
          date: string
          id: string
          is_compensated: boolean | null
          name: string
          observed_date: string
          updated_at: string | null
          year: number
        }
        Insert: {
          compensation_reason?: string | null
          created_at?: string | null
          date: string
          id?: string
          is_compensated?: boolean | null
          name: string
          observed_date: string
          updated_at?: string | null
          year: number
        }
        Update: {
          compensation_reason?: string | null
          created_at?: string | null
          date?: string
          id?: string
          is_compensated?: boolean | null
          name?: string
          observed_date?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      request_approval_steps: {
        Row: {
          acted_at: string | null
          acted_by: string | null
          approver_type: string
          approver_user_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          request_id: string
          request_type: string
          status: string
          step_number: number
        }
        Insert: {
          acted_at?: string | null
          acted_by?: string | null
          approver_type: string
          approver_user_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          request_id: string
          request_type: string
          status?: string
          step_number: number
        }
        Update: {
          acted_at?: string | null
          acted_by?: string | null
          approver_type?: string
          approver_user_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          request_id?: string
          request_type?: string
          status?: string
          step_number?: number
        }
        Relationships: []
      }
      salary_history: {
        Row: {
          change_type: Database["public"]["Enums"]["salary_change_type"]
          changed_by: string | null
          created_at: string
          effective_date: string
          employee_id: string
          id: string
          new_allowances: Json | null
          new_deductions: Json | null
          new_salary: number
          previous_allowances: Json | null
          previous_deductions: Json | null
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
          new_allowances?: Json | null
          new_deductions?: Json | null
          new_salary: number
          previous_allowances?: Json | null
          previous_deductions?: Json | null
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
          new_allowances?: Json | null
          new_deductions?: Json | null
          new_salary?: number
          previous_allowances?: Json | null
          previous_deductions?: Json | null
          previous_salary?: number | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_update_batch_employees: {
        Row: {
          after_basic_salary: number | null
          after_gosi_deduction: number | null
          after_gosi_registered_salary: number | null
          after_net_salary: number | null
          after_total_allowances: number | null
          after_total_deductions: number | null
          batch_id: string
          before_basic_salary: number | null
          before_gosi_deduction: number | null
          before_gosi_registered_salary: number | null
          before_net_salary: number | null
          before_total_allowances: number | null
          before_total_deductions: number | null
          created_at: string | null
          employee_id: string
          id: string
        }
        Insert: {
          after_basic_salary?: number | null
          after_gosi_deduction?: number | null
          after_gosi_registered_salary?: number | null
          after_net_salary?: number | null
          after_total_allowances?: number | null
          after_total_deductions?: number | null
          batch_id: string
          before_basic_salary?: number | null
          before_gosi_deduction?: number | null
          before_gosi_registered_salary?: number | null
          before_net_salary?: number | null
          before_total_allowances?: number | null
          before_total_deductions?: number | null
          created_at?: string | null
          employee_id: string
          id?: string
        }
        Update: {
          after_basic_salary?: number | null
          after_gosi_deduction?: number | null
          after_gosi_registered_salary?: number | null
          after_net_salary?: number | null
          after_total_allowances?: number | null
          after_total_deductions?: number | null
          batch_id?: string
          before_basic_salary?: number | null
          before_gosi_deduction?: number | null
          before_gosi_registered_salary?: number | null
          before_net_salary?: number | null
          before_total_allowances?: number | null
          before_total_deductions?: number | null
          created_at?: string | null
          employee_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_update_batch_employees_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "salary_update_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_update_batch_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_update_batch_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "salary_update_batch_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_update_batches: {
        Row: {
          change_type: string
          components_changed: Json | null
          created_at: string | null
          effective_date: string
          employee_count: number
          employee_ids: string[]
          filter_criteria: Json | null
          gosi_salary_changed: boolean | null
          id: string
          initiated_at: string | null
          initiated_by: string
          notes: string | null
          reason: string
          total_after_salary: number | null
          total_before_salary: number | null
          total_change: number | null
          update_type: string
          update_value: number | null
        }
        Insert: {
          change_type: string
          components_changed?: Json | null
          created_at?: string | null
          effective_date: string
          employee_count: number
          employee_ids: string[]
          filter_criteria?: Json | null
          gosi_salary_changed?: boolean | null
          id?: string
          initiated_at?: string | null
          initiated_by: string
          notes?: string | null
          reason: string
          total_after_salary?: number | null
          total_before_salary?: number | null
          total_change?: number | null
          update_type: string
          update_value?: number | null
        }
        Update: {
          change_type?: string
          components_changed?: Json | null
          created_at?: string | null
          effective_date?: string
          employee_count?: number
          employee_ids?: string[]
          filter_criteria?: Json | null
          gosi_salary_changed?: boolean | null
          id?: string
          initiated_at?: string | null
          initiated_by?: string
          notes?: string | null
          reason?: string
          total_after_salary?: number | null
          total_before_salary?: number | null
          total_change?: number | null
          update_type?: string
          update_value?: number | null
        }
        Relationships: []
      }
      smart_tags: {
        Row: {
          category: string
          created_at: string | null
          description: string
          field: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          source: string
          tag: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          field: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          source: string
          tag: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          field?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          source?: string
          tag?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          compact_mode: boolean | null
          created_at: string | null
          date_format: string | null
          default_page: string | null
          employee_table_columns: Json | null
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
          employee_table_columns?: Json | null
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
          employee_table_columns?: Json | null
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
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string | null
          device: string | null
          id: string
          ip_address: unknown
          is_current: boolean | null
          last_active: string | null
          location: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device?: string | null
          id?: string
          ip_address?: unknown
          is_current?: boolean | null
          last_active?: string | null
          location?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device?: string | null
          id?: string
          ip_address?: unknown
          is_current?: boolean | null
          last_active?: string | null
          location?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      work_locations: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          currency: string | null
          gosi_base_calculation: string | null
          gosi_enabled: boolean | null
          gosi_nationality_rates: Json | null
          id: string
          is_hq: boolean | null
          is_remote: boolean | null
          name: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          gosi_base_calculation?: string | null
          gosi_enabled?: boolean | null
          gosi_nationality_rates?: Json | null
          id?: string
          is_hq?: boolean | null
          is_remote?: boolean | null
          name: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          gosi_base_calculation?: string | null
          gosi_enabled?: boolean | null
          gosi_nationality_rates?: Json | null
          id?: string
          is_hq?: boolean | null
          is_remote?: boolean | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      employee_summary_mv: {
        Row: {
          active_loans_count: number | null
          avatar_url: string | null
          department_id: string | null
          department_name: string | null
          email: string | null
          employee_code: string | null
          full_name: string | null
          id: string | null
          join_date: string | null
          manager_id: string | null
          manager_name: string | null
          pending_leave_requests: number | null
          pending_trips_count: number | null
          position_id: string | null
          position_title: string | null
          status: Database["public"]["Enums"]["employee_status"] | null
          work_location_id: string | null
          work_location_name: string | null
        }
        Relationships: []
      }
      leave_balance_summary_mv: {
        Row: {
          available_days: number | null
          department_id: string | null
          department_name: string | null
          employee_id: string | null
          employee_name: string | null
          leave_type_color: string | null
          leave_type_id: string | null
          leave_type_name: string | null
          pending_days: number | null
          total_days: number | null
          used_days: number | null
          year: number | null
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
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_summary_mv: {
        Row: {
          employee_count: number | null
          location_id: string | null
          location_name: string | null
          pay_period_end: string | null
          pay_period_start: string | null
          payroll_run_id: string | null
          status: string | null
          total_base_salary: number | null
          total_deductions: number | null
          total_gosi_deduction: number | null
          total_gross_pay: number | null
          total_housing_allowance: number | null
          total_net_pay: number | null
          total_transportation_allowance: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "employee_summary_mv"
            referencedColumns: ["work_location_id"]
          },
          {
            foreignKeyName: "payroll_runs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "work_locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      direct_reports: {
        Args: { "": Database["public"]["Tables"]["employees"]["Row"] }
        Returns: {
          address: string | null
          avatar_url: string | null
          bank_account_number: string | null
          bank_name: string | null
          country: string | null
          cpr_number: string | null
          created_at: string
          date_of_birth: string | null
          department_id: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employee_code: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          first_name: string
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          gosi_registered_salary: number | null
          iban: string | null
          id: string
          import_batch_id: string | null
          is_subject_to_gosi: boolean | null
          join_date: string | null
          last_name: string
          location: string | null
          manager_id: string | null
          nationality: string | null
          offer_letter_template: string | null
          passport_number: string | null
          pay_frequency: Database["public"]["Enums"]["pay_frequency"] | null
          phone: string | null
          position_id: string | null
          preferred_name: string | null
          salary: number | null
          salary_currency_code: string | null
          search_vector: unknown
          second_name: string | null
          send_offer_letter: boolean | null
          status: Database["public"]["Enums"]["employee_status"]
          tax_exemption_status: string | null
          updated_at: string
          user_id: string | null
          work_location: string | null
          work_location_id: string | null
          worker_type: Database["public"]["Enums"]["worker_type"] | null
        }[]
        SetofOptions: {
          from: "employees"
          to: "employees"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      generate_loan_installments: {
        Args: { loan_uuid: string }
        Returns: undefined
      }
      get_dashboard_metrics: {
        Args: { p_attendance_limit?: number; p_team_limit?: number }
        Returns: Json
      }
      get_my_employee_id: { Args: never; Returns: string }
      get_reports_overview: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: Json
      }
      get_user_employee_id: { Args: { _user_id: string }; Returns: string }
      has_any_role:
        | {
            Args: {
              _roles: Database["public"]["Enums"]["app_role"][]
              _user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              _roles: Database["public"]["Enums"]["app_role"][]
              _user_id: string
            }
            Returns: boolean
          }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      is_event_organizer: {
        Args: { _employee_id: string; _event_id: string }
        Returns: boolean
      }
      is_event_participant: {
        Args: { _employee_id: string; _event_id: string }
        Returns: boolean
      }
      is_manager_of: {
        Args: { _employee_id: string; _manager_user_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { p_employee_id: string; p_project_id: string }
        Returns: boolean
      }
      is_project_owner: {
        Args: { p_employee_id: string; p_project_id: string }
        Returns: boolean
      }
      manager: {
        Args: { "": Database["public"]["Tables"]["employees"]["Row"] }
        Returns: {
          address: string | null
          avatar_url: string | null
          bank_account_number: string | null
          bank_name: string | null
          country: string | null
          cpr_number: string | null
          created_at: string
          date_of_birth: string | null
          department_id: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employee_code: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          first_name: string
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          gosi_registered_salary: number | null
          iban: string | null
          id: string
          import_batch_id: string | null
          is_subject_to_gosi: boolean | null
          join_date: string | null
          last_name: string
          location: string | null
          manager_id: string | null
          nationality: string | null
          offer_letter_template: string | null
          passport_number: string | null
          pay_frequency: Database["public"]["Enums"]["pay_frequency"] | null
          phone: string | null
          position_id: string | null
          preferred_name: string | null
          salary: number | null
          salary_currency_code: string | null
          search_vector: unknown
          second_name: string | null
          send_offer_letter: boolean | null
          status: Database["public"]["Enums"]["employee_status"]
          tax_exemption_status: string | null
          updated_at: string
          user_id: string | null
          work_location: string | null
          work_location_id: string | null
          worker_type: Database["public"]["Enums"]["worker_type"] | null
        }
        SetofOptions: {
          from: "employees"
          to: "employees"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      refresh_all_materialized_views: { Args: never; Returns: undefined }
    }
    Enums: {
      access_status: "active" | "scheduled" | "revoked"
      access_system_type:
        | "email"
        | "cloud"
        | "internal"
        | "third_party"
        | "physical"
      activity_type:
        | "created"
        | "status_change"
        | "assignee_added"
        | "assignee_removed"
        | "comment"
        | "updated"
      app_role: "employee" | "manager" | "hr" | "admin"
      asset_condition: "pending" | "good" | "damaged" | "missing"
      asset_type: "hardware" | "keycard" | "documents" | "other"
      benefit_status: "active" | "inactive" | "pending"
      benefit_type:
        | "health"
        | "dental"
        | "vision"
        | "life"
        | "disability"
        | "retirement"
        | "wellness"
        | "other"
      candidate_status:
        | "draft"
        | "in_process"
        | "offer_sent"
        | "offer_accepted"
        | "offer_rejected"
        | "archived"
      claim_status: "pending" | "approved" | "rejected" | "processing"
      correction_status:
        | "pending_manager"
        | "pending_hr"
        | "approved"
        | "rejected"
      departure_reason:
        | "resignation"
        | "termination"
        | "retirement"
        | "end_of_contract"
        | "other"
      employee_status:
        | "active"
        | "on_leave"
        | "on_boarding"
        | "probation"
        | "terminated"
        | "resigned"
      employment_type: "full_time" | "part_time" | "contract"
      enrollment_status: "active" | "pending" | "cancelled" | "expired"
      event_color: "green" | "orange" | "coral" | "mint" | "blue" | "purple"
      event_platform: "zoom" | "meet" | "slack" | "teams" | "in-person"
      event_recurrence: "none" | "daily" | "weekly" | "monthly"
      event_type: "meeting" | "event" | "reminder" | "task"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      interview_format: "in_person" | "video" | "written"
      notice_period_status: "serving" | "waived" | "garden_leave"
      offboarding_status: "pending" | "in_progress" | "completed" | "cancelled"
      offer_email_status: "draft" | "sent" | "failed"
      offer_status:
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
        | "archived"
      offer_version_status:
        | "draft"
        | "sent"
        | "superseded"
        | "accepted"
        | "rejected"
        | "expired"
      onboarding_status:
        | "pending"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "incomplete"
      pay_frequency: "hour" | "day" | "week" | "month" | "year"
      payroll_run_status: "draft" | "finalized" | "payslips_issued"
      project_priority: "low" | "medium" | "high"
      project_status: "todo" | "in_progress" | "need_review" | "done"
      salary_change_type:
        | "initial"
        | "adjustment"
        | "promotion"
        | "annual_review"
        | "correction"
        | "bulk_update"
        | "allowance_change"
        | "deduction_change"
        | "compensation_update"
      task_assignee: "employee" | "hr" | "manager" | "it"
      task_category:
        | "documentation"
        | "training"
        | "setup"
        | "introduction"
        | "compliance"
      task_status: "pending" | "in_progress" | "completed" | "skipped"
      worker_type: "employee" | "contractor_individual" | "contractor_business"
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
      access_status: ["active", "scheduled", "revoked"],
      access_system_type: [
        "email",
        "cloud",
        "internal",
        "third_party",
        "physical",
      ],
      activity_type: [
        "created",
        "status_change",
        "assignee_added",
        "assignee_removed",
        "comment",
        "updated",
      ],
      app_role: ["employee", "manager", "hr", "admin"],
      asset_condition: ["pending", "good", "damaged", "missing"],
      asset_type: ["hardware", "keycard", "documents", "other"],
      benefit_status: ["active", "inactive", "pending"],
      benefit_type: [
        "health",
        "dental",
        "vision",
        "life",
        "disability",
        "retirement",
        "wellness",
        "other",
      ],
      candidate_status: [
        "draft",
        "in_process",
        "offer_sent",
        "offer_accepted",
        "offer_rejected",
        "archived",
      ],
      claim_status: ["pending", "approved", "rejected", "processing"],
      correction_status: [
        "pending_manager",
        "pending_hr",
        "approved",
        "rejected",
      ],
      departure_reason: [
        "resignation",
        "termination",
        "retirement",
        "end_of_contract",
        "other",
      ],
      employee_status: [
        "active",
        "on_leave",
        "on_boarding",
        "probation",
        "terminated",
        "resigned",
      ],
      employment_type: ["full_time", "part_time", "contract"],
      enrollment_status: ["active", "pending", "cancelled", "expired"],
      event_color: ["green", "orange", "coral", "mint", "blue", "purple"],
      event_platform: ["zoom", "meet", "slack", "teams", "in-person"],
      event_recurrence: ["none", "daily", "weekly", "monthly"],
      event_type: ["meeting", "event", "reminder", "task"],
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      interview_format: ["in_person", "video", "written"],
      notice_period_status: ["serving", "waived", "garden_leave"],
      offboarding_status: ["pending", "in_progress", "completed", "cancelled"],
      offer_email_status: ["draft", "sent", "failed"],
      offer_status: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
        "archived",
      ],
      offer_version_status: [
        "draft",
        "sent",
        "superseded",
        "accepted",
        "rejected",
        "expired",
      ],
      onboarding_status: [
        "pending",
        "scheduled",
        "in_progress",
        "completed",
        "incomplete",
      ],
      pay_frequency: ["hour", "day", "week", "month", "year"],
      payroll_run_status: ["draft", "finalized", "payslips_issued"],
      project_priority: ["low", "medium", "high"],
      project_status: ["todo", "in_progress", "need_review", "done"],
      salary_change_type: [
        "initial",
        "adjustment",
        "promotion",
        "annual_review",
        "correction",
        "bulk_update",
        "allowance_change",
        "deduction_change",
        "compensation_update",
      ],
      task_assignee: ["employee", "hr", "manager", "it"],
      task_category: [
        "documentation",
        "training",
        "setup",
        "introduction",
        "compliance",
      ],
      task_status: ["pending", "in_progress", "completed", "skipped"],
      worker_type: ["employee", "contractor_individual", "contractor_business"],
    },
  },
} as const
