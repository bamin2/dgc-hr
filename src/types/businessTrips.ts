/**
 * Business Trips Module Types
 * All amounts in BHD only
 */

export type TripStatus = 
  | 'draft' 
  | 'submitted' 
  | 'manager_approved' 
  | 'hr_approved' 
  | 'rejected' 
  | 'cancelled' 
  | 'completed' 
  | 'reconciled';

export type TravelMode = 'plane' | 'car';

export type ExpenseCategory = 'hotel' | 'transport' | 'meals' | 'other';

export type ExpenseHRStatus = 'pending' | 'approved' | 'partially_approved' | 'rejected';

export type AmendmentChangeType = 'dates' | 'destination' | 'travel_mode' | 'other';

export type AmendmentStatus = 'pending' | 'manager_approved' | 'hr_approved' | 'rejected' | 'cancelled';

export interface BusinessTripDestination {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  per_diem_rate_bhd: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessTripSettings {
  id: string;
  module_enabled: boolean;
  car_uplift_per_night_bhd: number;
  require_receipts: boolean;
  max_nights_without_override: number | null;
  allow_cancellation_after_submit: boolean;
  allow_edit_after_submit: boolean;
  email_notifications_enabled: boolean;
  inapp_notifications_enabled: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface BusinessTrip {
  id: string;
  employee_id: string;
  origin_location_id: string | null;
  destination_id: string | null;
  start_date: string;
  end_date: string;
  nights_count: number;
  travel_mode: TravelMode;
  corporate_card_used: boolean;
  per_diem_rate_bhd: number;
  car_uplift_per_night_bhd: number;
  car_uplift_total_bhd: number;
  per_diem_budget_bhd: number;
  per_diem_payable_bhd: number;
  flight_details: string | null;
  status: TripStatus;
  rejection_reason: string | null;
  submitted_at: string | null;
  closed_at: string | null;
  closed_by: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  // Joined data
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string | null;
    avatar_url: string | null;
    department?: { id: string; name: string } | null;
    work_location?: { id: string; name: string } | null;
  };
  destination?: BusinessTripDestination;
  origin_location?: { id: string; name: string };
}

export interface BusinessTripExpense {
  id: string;
  trip_id: string;
  category: ExpenseCategory;
  amount_bhd: number;
  expense_date: string;
  description: string | null;
  receipt_url: string | null;
  hr_status: ExpenseHRStatus;
  hr_approved_amount_bhd: number | null;
  hr_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface BusinessTripAmendment {
  id: string;
  trip_id: string;
  change_type: AmendmentChangeType;
  proposed_values: Record<string, unknown>;
  original_values: Record<string, unknown>;
  reason: string;
  status: AmendmentStatus;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessTripAttachment {
  id: string;
  trip_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// Input types for mutations
export interface CreateBusinessTripInput {
  employee_id: string;
  origin_location_id?: string;
  destination_id: string;
  start_date: string;
  end_date: string;
  travel_mode: TravelMode;
  corporate_card_used: boolean;
  flight_details?: string;
  status?: 'draft' | 'submitted';
}

export interface UpdateBusinessTripInput {
  id: string;
  origin_location_id?: string;
  destination_id?: string;
  start_date?: string;
  end_date?: string;
  travel_mode?: TravelMode;
  corporate_card_used?: boolean;
  flight_details?: string;
  status?: TripStatus;
  rejection_reason?: string;
}

export interface CreateExpenseInput {
  trip_id: string;
  category: ExpenseCategory;
  amount_bhd: number;
  expense_date: string;
  description?: string;
  receipt_url?: string;
}

export interface ReviewExpenseInput {
  id: string;
  hr_status: ExpenseHRStatus;
  hr_approved_amount_bhd?: number;
  hr_notes?: string;
}

export interface CreateAmendmentInput {
  trip_id: string;
  change_type: AmendmentChangeType;
  proposed_values: Record<string, unknown>;
  original_values: Record<string, unknown>;
  reason: string;
}

export interface CreateDestinationInput {
  name: string;
  country?: string;
  city?: string;
  per_diem_rate_bhd: number;
  is_active?: boolean;
}

export interface UpdateDestinationInput {
  id: string;
  name?: string;
  country?: string;
  city?: string;
  per_diem_rate_bhd?: number;
  is_active?: boolean;
}

// Status display helpers
export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  draft: 'Draft',
  submitted: 'Pending Approval',
  manager_approved: 'Manager Approved',
  hr_approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
  reconciled: 'Closed',
};

export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  manager_approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  hr_approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  reconciled: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  hotel: 'Hotel',
  transport: 'Transport',
  meals: 'Meals',
  other: 'Other',
};

export const TRAVEL_MODE_LABELS: Record<TravelMode, string> = {
  plane: 'Plane',
  car: 'Car',
};
