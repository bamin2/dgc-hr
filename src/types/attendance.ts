/**
 * Attendance Types
 * Types for attendance tracking and records
 */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'on_leave' | 'half_day' | 'remote';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  work_hours: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    department?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  on_leave: number;
  half_day: number;
  remote: number;
  total: number;
}

export interface AttendanceRecordFilters {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
  status?: AttendanceStatus;
}
