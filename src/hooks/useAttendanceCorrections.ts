import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CorrectionStatus = 'pending_manager' | 'pending_hr' | 'approved' | 'rejected';

export interface AttendanceCorrection {
  id: string;
  employee_id: string;
  attendance_record_id: string;
  date: string;
  original_check_in: string | null;
  original_check_out: string | null;
  corrected_check_in: string;
  corrected_check_out: string | null;
  reason: string;
  status: CorrectionStatus;
  manager_id: string | null;
  manager_reviewed_at: string | null;
  manager_notes: string | null;
  hr_reviewer_id: string | null;
  hr_reviewed_at: string | null;
  hr_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    manager_id: string | null;
    department?: {
      id: string;
      name: string;
    } | null;
  };
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  hr_reviewer?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface UseCorrectionsOptions {
  employeeId?: string;
  status?: CorrectionStatus | CorrectionStatus[];
  managerId?: string;
}

const correctionSelect = `
  *,
  employee:employees!attendance_corrections_employee_id_fkey (
    id,
    first_name,
    last_name,
    email,
    avatar_url,
    manager_id,
    department:departments!employees_department_id_fkey (
      id,
      name
    )
  ),
  manager:employees!attendance_corrections_manager_id_fkey (
    id,
    first_name,
    last_name
  ),
  hr_reviewer:employees!attendance_corrections_hr_reviewer_id_fkey (
    id,
    first_name,
    last_name
  )
`;

export function useAttendanceCorrections(options: UseCorrectionsOptions = {}) {
  const { employeeId, status, managerId } = options;

  return useQuery({
    queryKey: ['attendance-corrections', { employeeId, status, managerId }],
    queryFn: async () => {
      let query = supabase
        .from('attendance_corrections')
        .select(correctionSelect)
        .order('created_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status);
        } else {
          query = query.eq('status', status);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AttendanceCorrection[];
    },
  });
}

export function usePendingManagerApprovals() {
  return useAttendanceCorrections({ status: 'pending_manager' });
}

export function usePendingHRApprovals() {
  return useAttendanceCorrections({ status: 'pending_hr' });
}

export function useMyAttendanceCorrections(employeeId: string | undefined) {
  return useAttendanceCorrections({ employeeId });
}

interface CreateCorrectionData {
  employee_id: string;
  attendance_record_id: string;
  date: string;
  original_check_in: string | null;
  original_check_out: string | null;
  corrected_check_in: string;
  corrected_check_out: string | null;
  reason: string;
}

export function useCreateAttendanceCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCorrectionData) => {
      const { data: result, error } = await supabase
        .from('attendance_corrections')
        .insert({
          ...data,
          status: 'pending_manager',
        })
        .select(correctionSelect)
        .single();

      if (error) throw error;
      return result as AttendanceCorrection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-corrections'] });
      toast.success('Correction request submitted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to submit correction: ${error.message}`);
    },
  });
}

interface ManagerReviewData {
  correctionId: string;
  approved: boolean;
  managerId: string;
  notes?: string;
  rejectionReason?: string;
}

export function useManagerReviewCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ correctionId, approved, managerId, notes, rejectionReason }: ManagerReviewData) => {
      const updateData = approved
        ? {
            status: 'pending_hr' as CorrectionStatus,
            manager_id: managerId,
            manager_reviewed_at: new Date().toISOString(),
            manager_notes: notes || null,
          }
        : {
            status: 'rejected' as CorrectionStatus,
            manager_id: managerId,
            manager_reviewed_at: new Date().toISOString(),
            manager_notes: notes || null,
            rejection_reason: rejectionReason || 'Rejected by manager',
          };

      const { data, error } = await supabase
        .from('attendance_corrections')
        .update(updateData)
        .eq('id', correctionId)
        .eq('status', 'pending_manager')
        .select(correctionSelect)
        .single();

      if (error) throw error;
      return data as AttendanceCorrection;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-corrections'] });
      toast.success(variables.approved ? 'Correction forwarded to HR' : 'Correction rejected');
    },
    onError: (error) => {
      toast.error(`Failed to review correction: ${error.message}`);
    },
  });
}

interface HRReviewData {
  correctionId: string;
  approved: boolean;
  hrReviewerId: string;
  notes?: string;
  rejectionReason?: string;
}

export function useHRReviewCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ correctionId, approved, hrReviewerId, notes, rejectionReason }: HRReviewData) => {
      // First get the correction to apply changes if approved
      const { data: correction, error: fetchError } = await supabase
        .from('attendance_corrections')
        .select('*')
        .eq('id', correctionId)
        .single();

      if (fetchError) throw fetchError;

      if (approved) {
        // Update the original attendance record
        const { error: updateError } = await supabase
          .from('attendance_records')
          .update({
            check_in: correction.corrected_check_in,
            check_out: correction.corrected_check_out,
            // Recalculate work hours if both times exist
            work_hours: correction.corrected_check_in && correction.corrected_check_out
              ? calculateWorkHours(correction.corrected_check_in, correction.corrected_check_out)
              : null,
          })
          .eq('id', correction.attendance_record_id);

        if (updateError) throw updateError;
      }

      // Update the correction status
      const updateData = approved
        ? {
            status: 'approved' as CorrectionStatus,
            hr_reviewer_id: hrReviewerId,
            hr_reviewed_at: new Date().toISOString(),
            hr_notes: notes || null,
          }
        : {
            status: 'rejected' as CorrectionStatus,
            hr_reviewer_id: hrReviewerId,
            hr_reviewed_at: new Date().toISOString(),
            hr_notes: notes || null,
            rejection_reason: rejectionReason || 'Rejected by HR',
          };

      const { data, error } = await supabase
        .from('attendance_corrections')
        .update(updateData)
        .eq('id', correctionId)
        .eq('status', 'pending_hr')
        .select(correctionSelect)
        .single();

      if (error) throw error;
      return data as AttendanceCorrection;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-corrections'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      toast.success(variables.approved ? 'Correction approved and applied' : 'Correction rejected');
    },
    onError: (error) => {
      toast.error(`Failed to review correction: ${error.message}`);
    },
  });
}

// Helper to calculate work hours from time strings
function calculateWorkHours(checkIn: string, checkOut: string): number {
  const today = new Date().toISOString().split('T')[0];
  const checkInTime = new Date(`${today}T${checkIn}`);
  const checkOutTime = new Date(`${today}T${checkOut}`);
  const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100;
}

export function useDeleteAttendanceCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attendance_corrections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-corrections'] });
      toast.success('Correction request deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete correction: ${error.message}`);
    },
  });
}
