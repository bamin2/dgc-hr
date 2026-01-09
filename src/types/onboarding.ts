/**
 * Centralized Onboarding/Offboarding Types
 * These types are shared across onboarding-related hooks and components
 */

import { Database } from '@/integrations/supabase/types';

export type OnboardingStatus = Database['public']['Enums']['onboarding_status'];
export type TaskStatus = Database['public']['Enums']['task_status'];
export type TaskCategory = Database['public']['Enums']['task_category'];
export type TaskAssignee = Database['public']['Enums']['task_assignee'];
export type InterviewFormat = Database['public']['Enums']['interview_format'];

export interface OnboardingWorkflow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  estimated_days: number | null;
  categories: TaskCategory[] | null;
  is_active: boolean | null;
  tasks?: OnboardingWorkflowTask[];
}

export interface OnboardingWorkflowTask {
  id: string;
  workflow_id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  assigned_to: TaskAssignee;
  is_required: boolean | null;
  task_order: number | null;
  due_days_offset: number | null;
}

export interface OnboardingRecord {
  id: string;
  employee_id: string;
  workflow_id: string | null;
  workflow_name: string;
  start_date: string;
  scheduled_completion: string | null;
  completed_on: string | null;
  status: OnboardingStatus;
  manager_id: string | null;
  buddy_id: string | null;
  it_contact_id: string | null;
  hr_contact_id: string | null;
  welcome_message: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    department?: { name: string } | null;
    position?: { title: string } | null;
  };
  tasks?: OnboardingTask[];
}

export interface OnboardingTask {
  id: string;
  onboarding_record_id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  assigned_to: TaskAssignee;
  is_required: boolean | null;
  task_order: number | null;
  due_date: string | null;
  status: TaskStatus;
  completed_at: string | null;
  completed_by: string | null;
}

// Offboarding types
export interface OffboardingRecord {
  id: string;
  employee_id: string;
  last_working_day: string;
  separation_type: string;
  reason: string | null;
  status: string;
  initiated_by: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    department?: { name: string } | null;
    position?: { title: string } | null;
  };
}

export interface ExitInterview {
  id: string;
  offboarding_record_id: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  format: InterviewFormat | null;
  interviewer_id: string | null;
  completed: boolean | null;
  skip_interview: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Input types
export interface CreateOnboardingInput {
  employeeId: string;
  workflowId: string;
  workflowName: string;
  startDate: Date;
  estimatedDays: number;
  managerId?: string;
  buddyId?: string;
  itContactId?: string;
  hrContactId?: string;
  welcomeMessage?: string;
  tasks: {
    title: string;
    description: string | null;
    category: TaskCategory;
    assignedTo: TaskAssignee;
    isRequired: boolean;
    taskOrder: number;
    dueDaysOffset: number;
  }[];
}
