import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Employee,
  useUpdateEmployee,
  useDeleteEmployee,
  useArchiveEmployee,
} from "@/hooks/useEmployees";
import { toast } from "@/hooks/use-toast";

interface UseEmployeeActionsReturn {
  handleView: (employee: Employee) => void;
  handleDelete: (employee: Employee) => Promise<void>;
  handleSave: (employee: Employee, data: Partial<Employee>) => Promise<void>;
  handleReassign: (employeeId: string, newManagerId: string, employees: Employee[]) => Promise<void>;
  handleBulkReassign: (assignments: { employeeId: string; managerId: string }[]) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}

// Friendly labels for FK-referenced tables, used to explain why a delete was blocked.
const REFERENCING_TABLE_LABELS: Record<string, string> = {
  salary_update_batch_employees: "Salary update batch",
  salary_history: "Salary history",
  payroll_run_employees: "Payroll run",
  payroll_run_adjustments: "Payroll adjustment",
  loans: "Loan",
  attendance_corrections: "Attendance correction",
  attendance_records: "Attendance record",
  benefit_claims: "Benefit claim",
  benefit_enrollments: "Benefit enrollment",
  business_trips: "Business trip",
  leave_requests: "Leave request",
  leave_balances: "Leave balance",
  audit_logs: "Audit log",
  employee_documents: "Employee document",
  hr_document_requests: "HR document request",
  generated_documents: "Generated document",
  candidates: "Candidate",
  offer_versions: "Offer letter",
  exit_interviews: "Exit interview",
  offboarding_records: "Offboarding record",
  onboarding_records: "Onboarding record",
  event_participants: "Calendar event",
  calendar_events: "Calendar event",
  email_logs: "Email log",
  benefit_ticket_usage: "Benefit ticket",
  employee_conversion_log: "Employee conversion log",
  offboarding_access_systems: "Offboarding access system",
  employees: "Direct report",
  departments: "Department (as manager)",
};

function describeFkBlocker(error: unknown): string | null {
  const e = error as { code?: string; details?: string; message?: string } | null;
  if (!e || e.code !== "23503") return null;
  const source = `${e.details ?? ""} ${e.message ?? ""}`;
  const match = source.match(/table\s+"([^"]+)"/);
  if (!match) return "another record in the system";
  const table = match[1];
  return REFERENCING_TABLE_LABELS[table] ?? table.replace(/_/g, " ");
}

export function useEmployeeActions(
  onDeleteSuccess?: (employeeId: string) => void
): UseEmployeeActionsReturn {
  const navigate = useNavigate();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const archiveEmployee = useArchiveEmployee();

  const handleView = useCallback(
    (employee: Employee) => {
      navigate(`/employees/${employee.id}`);
    },
    [navigate]
  );

  const archiveAndNotify = useCallback(
    async (employee: Employee) => {
      try {
        await archiveEmployee.mutateAsync(employee.id);
        onDeleteSuccess?.(employee.id);
        toast({
          title: "Employee archived",
          description: `${employee.firstName} ${employee.lastName} was marked as terminated and removed from active lists. Historical records were preserved.`,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to archive employee. Please try again.",
          variant: "destructive",
        });
      }
    },
    [archiveEmployee, onDeleteSuccess]
  );

  const handleDelete = useCallback(
    async (employee: Employee) => {
      try {
        await deleteEmployee.mutateAsync(employee.id);
        onDeleteSuccess?.(employee.id);
        toast({
          title: "Employee deleted",
          description: `${employee.firstName} ${employee.lastName} has been removed.`,
        });
      } catch (err) {
        const blocker = describeFkBlocker(err);
        if (blocker) {
          // Auto-archive: it preserves history and is what the user wants 99% of the time.
          // We still surface the reason so the action is transparent.
          toast({
            title: "Cannot permanently delete",
            description: `${employee.firstName} ${employee.lastName} is referenced by ${blocker} records. Archiving instead — they will be removed from active lists but historical data is preserved.`,
          });
          await archiveAndNotify(employee);
          return;
        }
        toast({
          title: "Error",
          description: "Failed to delete employee. Please try again.",
          variant: "destructive",
        });
      }
    },
    [deleteEmployee, onDeleteSuccess, archiveAndNotify]
  );

  const handleSave = useCallback(
    async (employee: Employee, data: Partial<Employee>) => {
      try {
        await updateEmployee.mutateAsync({
          id: employee.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          department_id: data.departmentId || null,
          position_id: data.positionId || null,
          status: data.status as any,
          date_of_birth: data.dateOfBirth || null,
          gender: data.gender as any || null,
          address: data.address || null,
          nationality: data.nationality || null,
          avatar_url: data.avatar || null,
          join_date: data.joinDate || null,
        });
        toast({
          title: "Employee updated",
          description: `${data.firstName} ${data.lastName}'s information has been updated.`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to update employee. Please try again.",
          variant: "destructive",
        });
      }
    },
    [updateEmployee]
  );

  const handleReassign = useCallback(
    async (employeeId: string, newManagerId: string, employees: Employee[]) => {
      const employee = employees.find((e) => e.id === employeeId);
      const newManager = employees.find((e) => e.id === newManagerId);

      if (!employee || !newManager) return;

      try {
        await updateEmployee.mutateAsync({
          id: employeeId,
          manager_id: newManagerId,
        });

        toast({
          title: "Manager reassigned",
          description: `${employee.firstName} ${employee.lastName} now reports to ${newManager.firstName} ${newManager.lastName}.`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to reassign manager. Please try again.",
          variant: "destructive",
        });
      }
    },
    [updateEmployee]
  );

  const handleBulkReassign = useCallback(
    async (assignments: { employeeId: string; managerId: string }[]) => {
      try {
        await Promise.all(
          assignments.map(({ employeeId, managerId }) =>
            updateEmployee.mutateAsync({
              id: employeeId,
              manager_id: managerId,
            })
          )
        );
        toast({
          title: "Managers assigned",
          description: `Updated ${assignments.length} employee(s).`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to assign managers. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    },
    [updateEmployee]
  );

  return {
    handleView,
    handleDelete,
    handleSave,
    handleReassign,
    handleBulkReassign,
    isUpdating: updateEmployee.isPending,
    isDeleting: deleteEmployee.isPending,
  };
}
