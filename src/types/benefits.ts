/**
 * Centralized Benefits Types
 * These types are shared across benefits-related hooks and components
 */

import { Database } from '@/integrations/supabase/types';

// Re-export types from the database, but also define them explicitly to include new types
// that may not yet be in the auto-generated types file
export type BenefitType = 
  | 'health' | 'dental' | 'vision' | 'life' | 'disability' 
  | 'retirement' | 'wellness' | 'air_ticket' | 'car_park' | 'phone' | 'other';

export type BenefitStatus = Database['public']['Enums']['benefit_status'];
export type EnrollmentStatus = Database['public']['Enums']['enrollment_status'];
export type ClaimStatus = Database['public']['Enums']['claim_status'];

// Type-specific configuration interfaces
export interface AirTicketConfig {
  tickets_per_period: number;
  period_years: number;
}

// CarParkConfig is intentionally empty - car park plans use standard coverage levels
// Spot location is stored in enrollment.entitlement_data, not in the plan config
export interface CarParkConfig {
  // Reserved for future plan-level settings
}

// Car Park enrollment-specific data (stored in entitlement_data)
export interface CarParkData {
  spot_location?: string;
}

export interface PhoneConfig {
  total_device_cost: number;
  monthly_installment: number;
  installment_months: number;
}

export type EntitlementConfig = AirTicketConfig | CarParkConfig | PhoneConfig;

// Type-specific tracking data interfaces
export interface AirTicketData {
  tickets_used: number;
  last_ticket_date: string | null;
  entitlement_start_date: string;
}

export interface PhoneData {
  installments_paid: number;
  total_paid: number;
  remaining_balance: number;
}

export type EntitlementData = AirTicketData | PhoneData;

export interface BenefitPlan {
  id: string;
  name: string;
  type: BenefitType;
  provider: string;
  description: string | null;
  features: string[] | null;
  status: BenefitStatus;
  enrolled_count: number | null;
  policy_document_url: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
  coverage_levels?: BenefitCoverageLevel[];
}

export interface BenefitCoverageLevel {
  id: string;
  plan_id: string;
  name: string;
  employee_cost: number;
  employer_cost: number;
  coverage_details: Record<string, unknown> | null;
  created_at: string;
}

export interface BenefitEnrollment {
  id: string;
  employee_id: string;
  plan_id: string;
  coverage_level_id: string;
  start_date: string;
  end_date: string | null;
  status: EnrollmentStatus;
  employee_contribution: number;
  employer_contribution: number;
  created_at: string;
  updated_at: string;
  plan?: BenefitPlan;
  coverage_level?: BenefitCoverageLevel;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  beneficiaries?: BenefitBeneficiary[];
}

export interface BenefitBeneficiary {
  id: string;
  enrollment_id: string;
  name: string;
  relationship: string;
  date_of_birth: string | null;
  percentage: number | null;
  created_at: string;
}

export interface BenefitClaim {
  id: string;
  employee_id: string;
  enrollment_id: string;
  plan_id: string;
  claim_number: string;
  claim_date: string;
  service_date: string;
  amount: number;
  approved_amount: number | null;
  status: ClaimStatus;
  description: string | null;
  provider_name: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  plan?: {
    id: string;
    name: string;
    type: BenefitType;
  };
}

// Input types for mutations
export interface CreateBenefitPlanInput {
  name: string;
  type: BenefitType;
  provider: string;
  description?: string;
  features?: string[];
  status?: BenefitStatus;
}

export interface CreateEnrollmentInput {
  employee_id: string;
  plan_id: string;
  coverage_level_id: string;
  start_date: string;
  end_date?: string;
  beneficiaries?: Omit<BenefitBeneficiary, 'id' | 'enrollment_id' | 'created_at'>[];
}

export interface CreateClaimInput {
  employee_id: string;
  enrollment_id: string;
  plan_id: string;
  service_date: string;
  amount: number;
  description?: string;
  provider_name?: string;
}
