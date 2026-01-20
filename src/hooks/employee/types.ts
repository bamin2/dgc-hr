import { Database } from "@/integrations/supabase/types";

// Re-export database enum types
export type WorkerType = Database["public"]["Enums"]["worker_type"];
export type EmploymentType = Database["public"]["Enums"]["employment_type"];
export type PayFrequency = Database["public"]["Enums"]["pay_frequency"];
export type EmployeeStatus = Database["public"]["Enums"]["employee_status"];
export type GenderType = Database["public"]["Enums"]["gender_type"];

// Team member status (UI mapping of employee status)
export type TeamMemberStatus = 'active' | 'draft' | 'absent' | 'onboarding' | 'offboarding' | 'dismissed';

// UI-compatible Employee interface (for HR/Admin views)
export interface Employee {
  id: string;
  userId?: string;
  firstName: string;
  secondName?: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  departmentId?: string;
  position: string;
  positionId?: string;
  status: "active" | "on_leave" | "on_boarding" | "probation" | "terminated";
  joinDate: string;
  employeeId: string;
  manager?: string;
  managerId?: string;
  location?: string;
  workLocationId?: string;
  workLocationName?: string;
  workLocationCountry?: string;
  salary?: number;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  isSubjectToGosi?: boolean;
  gosiRegisteredSalary?: number;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  passportNumber?: string;
  cprNumber?: string;
}

// UI-compatible TeamMember interface (for Team views)
export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  avatar?: string;
  workerType: WorkerType;
  country?: string;
  startDate: string;
  department: string;
  departmentId?: string;
  jobTitle: string;
  positionId?: string;
  employmentType: EmploymentType;
  status: TeamMemberStatus;
  managerId?: string;
  managerName?: string;
  workLocation?: string;
  salary?: number;
  payFrequency: PayFrequency;
  taxExemptionStatus?: string;
  sendOfferLetter?: boolean;
  offerLetterTemplate?: string;
}
