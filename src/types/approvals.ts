export type RequestType = 'time_off' | 'loan' | 'hr_letter' | 'business_trip';
export type ApproverType = 'manager' | 'hr' | 'specific_user';
export type ApprovalStepStatus = 'queued' | 'pending' | 'approved' | 'rejected' | 'skipped' | 'cancelled';

export interface ApprovalWorkflowStep {
  step: number;
  approver: ApproverType;
  fallback?: ApproverType;
  specific_user_id?: string;
}

export interface ApprovalWorkflow {
  id: string;
  request_type: RequestType;
  is_active: boolean;
  steps: ApprovalWorkflowStep[];
  default_hr_approver_id: string | null;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export interface RequestApprovalStep {
  id: string;
  request_id: string;
  request_type: RequestType;
  step_number: number;
  approver_type: ApproverType;
  approver_user_id: string | null;
  status: ApprovalStepStatus;
  acted_by: string | null;
  acted_at: string | null;
  comment: string | null;
  created_at: string;
  // Joined data
  approver?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export interface PendingApproval {
  step: RequestApprovalStep;
  request_type: RequestType;
  request_id: string;
  // Joined request data - varies by type
  leave_request?: {
    id: string;
    employee_id: string;
    leave_type_id: string;
    start_date: string;
    end_date: string;
    days_count: number;
    reason: string | null;
    status: string;
    created_at: string;
    employee?: {
      id: string;
      first_name: string;
      last_name: string;
      full_name: string | null;
      avatar_url: string | null;
    };
    leave_type?: {
      id: string;
      name: string;
      color: string | null;
    };
  };
  business_trip?: {
    id: string;
    employee_id: string;
    destination_id: string | null;
    start_date: string;
    end_date: string;
    nights_count: number;
    travel_mode: string;
    status: string;
    created_at: string;
    employee?: {
      id: string;
      first_name: string;
      last_name: string;
      full_name: string | null;
      avatar_url: string | null;
    };
    destination?: {
      id: string;
      name: string;
      country: string | null;
      city: string | null;
    };
  };
  loan?: {
    id: string;
    employee_id: string;
    principal_amount: number;
    duration_months: number | null;
    installment_amount: number | null;
    start_date: string;
    status: string;
    notes: string | null;
    created_at: string;
    employee?: {
      id: string;
      first_name: string;
      last_name: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
}
