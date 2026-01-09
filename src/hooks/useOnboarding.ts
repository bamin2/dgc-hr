import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { addDays, format } from "date-fns";
import { queryKeys } from "@/lib/queryKeys";

// Types
export type OnboardingStatus = Database["public"]["Enums"]["onboarding_status"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskCategory = Database["public"]["Enums"]["task_category"];
export type TaskAssignee = Database["public"]["Enums"]["task_assignee"];

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

// Fetch workflow templates
export function useOnboardingWorkflows() {
  return useQuery({
    queryKey: queryKeys.workflows.onboarding.templates,
    queryFn: async () => {
      const { data: workflows, error: workflowsError } = await supabase
        .from("onboarding_workflows")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (workflowsError) throw workflowsError;

      // Fetch tasks for each workflow
      const { data: tasks, error: tasksError } = await supabase
        .from("onboarding_workflow_tasks")
        .select("*")
        .order("task_order");

      if (tasksError) throw tasksError;

      // Group tasks by workflow
      const workflowsWithTasks = workflows.map((workflow) => ({
        ...workflow,
        tasks: tasks.filter((task) => task.workflow_id === workflow.id),
      }));

      return workflowsWithTasks as OnboardingWorkflow[];
    },
  });
}

// Fetch onboarding records
export function useOnboardingRecords() {
  return useQuery({
    queryKey: queryKeys.workflows.onboarding.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_records")
        .select(`
          *,
          employee:employees!onboarding_records_employee_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            department:departments!employees_department_id_fkey(name),
            position:positions!employees_position_id_fkey(title)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OnboardingRecord[];
    },
  });
}

// Fetch single onboarding record with tasks
export function useOnboardingRecord(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workflows.onboarding.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data: record, error: recordError } = await supabase
        .from("onboarding_records")
        .select(`
          *,
          employee:employees!onboarding_records_employee_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            department:departments!employees_department_id_fkey(name),
            position:positions!employees_position_id_fkey(title)
          )
        `)
        .eq("id", id)
        .single();

      if (recordError) throw recordError;

      const { data: tasks, error: tasksError } = await supabase
        .from("onboarding_tasks")
        .select("*")
        .eq("onboarding_record_id", id)
        .order("task_order");

      if (tasksError) throw tasksError;

      return { ...record, tasks } as OnboardingRecord;
    },
    enabled: !!id,
  });
}

// Create onboarding record
interface CreateOnboardingInput {
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

export function useCreateOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOnboardingInput) => {
      const scheduledCompletion = addDays(input.startDate, input.estimatedDays);

      // Create onboarding record
      const { data: record, error: recordError } = await supabase
        .from("onboarding_records")
        .insert({
          employee_id: input.employeeId,
          workflow_id: input.workflowId,
          workflow_name: input.workflowName,
          start_date: format(input.startDate, "yyyy-MM-dd"),
          scheduled_completion: format(scheduledCompletion, "yyyy-MM-dd"),
          status: "scheduled",
          manager_id: input.managerId || null,
          buddy_id: input.buddyId || null,
          it_contact_id: input.itContactId || null,
          hr_contact_id: input.hrContactId || null,
          welcome_message: input.welcomeMessage || null,
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Create tasks
      const tasksToInsert = input.tasks.map((task) => ({
        onboarding_record_id: record.id,
        title: task.title,
        description: task.description,
        category: task.category,
        assigned_to: task.assignedTo,
        is_required: task.isRequired,
        task_order: task.taskOrder,
        due_date: format(addDays(input.startDate, task.dueDaysOffset), "yyyy-MM-dd"),
        status: "pending" as TaskStatus,
      }));

      const { error: tasksError } = await supabase
        .from("onboarding_tasks")
        .insert(tasksToInsert);

      if (tasksError) throw tasksError;

      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.onboarding.all });
    },
  });
}

// Update onboarding task status
export function useUpdateOnboardingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      completedBy,
    }: {
      taskId: string;
      status: TaskStatus;
      completedBy?: string;
    }) => {
      const { data, error } = await supabase
        .from("onboarding_tasks")
        .update({
          status,
          completed_at: status === "completed" ? new Date().toISOString() : null,
          completed_by: status === "completed" ? completedBy : null,
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.onboarding.detail(data.onboarding_record_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.onboarding.all });
    },
  });
}

// Update onboarding record status
export function useUpdateOnboardingRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      completedOn,
    }: {
      id: string;
      status?: OnboardingStatus;
      completedOn?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      if (status) updates.status = status;
      if (completedOn) updates.completed_on = completedOn;

      const { data, error } = await supabase
        .from("onboarding_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.onboarding.all });
    },
  });
}

// Delete onboarding record
export function useDeleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("onboarding_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.onboarding.all });
    },
  });
}

// Helper to calculate progress
export function calculateOnboardingProgress(tasks: OnboardingTask[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
}
