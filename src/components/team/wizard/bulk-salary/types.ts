import { TeamMember } from "@/hooks/useTeamMembers";
import { SalaryChangeType } from "@/hooks/useSalaryHistory";

export type UpdateType = 'percentage_increase' | 'percentage_decrease' | 'fixed_increase' | 'fixed_decrease' | 'set_new';

export type GosiHandling = 'keep' | 'per_employee';

// Extended entry types with tracking fields
export interface AllowanceEntryExtended {
  id: string;
  templateId?: string;
  customName?: string;
  amount: number;
  originalAmount?: number;
  isCustom: boolean;
  isPercentage?: boolean;
  percentageOf?: string;
  isExisting?: boolean;
  dbRecordId?: string;
}

export interface DeductionEntryExtended {
  id: string;
  templateId?: string;
  customName?: string;
  amount: number;
  originalAmount?: number;
  isCustom: boolean;
  isPercentage?: boolean;
  percentageOf?: string;
  isExisting?: boolean;
  dbRecordId?: string;
}

export interface BulkSalaryWizardData {
  // Step 1: Employee Selection
  selectedEmployeeIds: string[];
  filters: {
    departmentId?: string;
    positionId?: string;
    employmentType?: string;
    nationality?: string;
    workLocationId?: string;
  };
  
  // Step 2: Update Type
  updateType: UpdateType | null;
  updateValue: string;
  perEmployeeSalaries: Record<string, string>;
  
  // Step 3: Components (per-employee)
  perEmployeeAllowances: Record<string, AllowanceEntryExtended[]>;
  perEmployeeDeductions: Record<string, DeductionEntryExtended[]>;
  
  // Step 4: GOSI
  gosiHandling: GosiHandling;
  gosiPerEmployee: Record<string, string>;
  
  // Step 5: Effective Date
  effectiveDate: Date | null;
  
  // Step 7: Reason
  changeType: SalaryChangeType;
  reason: string;
  notes: string;
  
  // Step 8: Confirmation
  confirmed: boolean;
}

export interface EmployeeImpact {
  employee: TeamMember & {
    gosiRegisteredSalary?: number;
    isSubjectToGosi?: boolean;
  };
  beforeBasicSalary: number;
  afterBasicSalary: number;
  beforeAllowances: number;
  afterAllowances: number;
  beforeDeductions: number;
  afterDeductions: number;
  beforeNetSalary: number;
  afterNetSalary: number;
  beforeGosiSalary: number | null;
  afterGosiSalary: number | null;
  beforeGosiDeduction: number;
  afterGosiDeduction: number;
}

export interface WizardStep {
  id: number;
  label: string;
  description: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, label: "Select Employees", description: "Choose who to update" },
  { id: 2, label: "Update Type", description: "How to change salaries" },
  { id: 3, label: "Components", description: "Allowances & deductions" },
  { id: 4, label: "GOSI Salary", description: "GOSI registered salary" },
  { id: 5, label: "Effective Date", description: "When changes apply" },
  { id: 6, label: "Review", description: "Impact summary" },
  { id: 7, label: "Reason", description: "Document the change" },
  { id: 8, label: "Confirm", description: "Apply changes" },
];

export const CHANGE_TYPE_OPTIONS: { value: SalaryChangeType; label: string }[] = [
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'annual_review', label: 'Annual Review' },
  { value: 'correction', label: 'Correction' },
  { value: 'bulk_update', label: 'Bulk Update' },
];

export const initialWizardData: BulkSalaryWizardData = {
  selectedEmployeeIds: [],
  filters: {},
  updateType: null,
  updateValue: '',
  perEmployeeSalaries: {},
  perEmployeeAllowances: {},
  perEmployeeDeductions: {},
  gosiHandling: 'keep',
  gosiPerEmployee: {},
  effectiveDate: new Date(),
  changeType: 'bulk_update',
  reason: '',
  notes: '',
  confirmed: false,
};
